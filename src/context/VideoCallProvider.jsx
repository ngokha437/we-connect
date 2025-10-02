import VideoCallRoom from "@components/VideoCall/VideoCallRoom";
import { Events } from "@libs/constants";
import { closeDialog, openDialog } from "@redux/slices/dialogSlice";
import { openSnackbar } from "@redux/slices/snackbarSlice";
import {
  useAnswerCallMutation,
  useEndCallMutation,
  useInitialCallMutation,
  useRejectCallMutation,
} from "@services/videoCallApi";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useDispatch } from "react-redux";
import { socket } from "./SocketProvider";

const VideoCallContext = createContext({});

export const useVideoCallContext = () => {
  return useContext(VideoCallContext);
};

const VideoCallProvider = ({ children }) => {
  const [isInCall, setIsInCall] = useState(false);
  const [incomingCall, setIncomingCall] = useState(false);
  const [callId, setCallId] = useState(null);
  const [callerInfo, setCallerInfo] = useState(null);

  const dispatch = useDispatch();

  const pendingSDPOffer = useRef(null);

  const [connection, setConnection] = useState(null);

  const [initialCall] = useInitialCallMutation();
  const [answerCall] = useAnswerCallMutation();
  const [rejectIncomingCall] = useRejectCallMutation();
  const [endCall] = useEndCallMutation();

  const pendingICECandidates = useRef([]);

  const setupPeerConnection = async ({ remoteUserId, callId }) => {
    try {
      const pc = new RTCPeerConnection({
        iceServers: [
          {
            urls: "stun:stun.relay.metered.ca:80",
          },
          {
            urls: "turn:global.relay.metered.ca:80",
            username: "d3a5c57a12dc876ae671d1b1",
            credential: "ce45GV5+aOVfkEpW",
          },
          {
            urls: "turn:global.relay.metered.ca:80?transport=tcp",
            username: "d3a5c57a12dc876ae671d1b1",
            credential: "ce45GV5+aOVfkEpW",
          },
          {
            urls: "turn:global.relay.metered.ca:443",
            username: "d3a5c57a12dc876ae671d1b1",
            credential: "ce45GV5+aOVfkEpW",
          },
          {
            urls: "turns:global.relay.metered.ca:443?transport=tcp",
            username: "d3a5c57a12dc876ae671d1b1",
            credential: "ce45GV5+aOVfkEpW",
          },
        ],
      });

      const localStream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true,
      });

      const remoteStream = new MediaStream();

      pc.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
          remoteStream.addTrack(track);
        });
      };

      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });

      pc.onicecandidate = (event) => {
        console.log({ event });
        // emit
        if (event.candidate) {
          socket.emit(Events.ICE_CANDIDATE, {
            targetUserId: remoteUserId,
            candidate: event.candidate,
            callId,
          });
        }
      };

      // offer tu A gui len Signaling Server => B
      async function createOffer() {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        return offer;
      }

      // tren client A
      async function handleAnswer(answer) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        processQueuedCandidates(pc);
      }

      // tren client B
      async function handleOffer(offer) {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        processQueuedCandidates(pc);
        return answer;
      }

      const closeConnection = () => {
        localStream.getTracks().forEach((track) => track.stop());
        pc.close();
      };

      function processQueuedCandidates(peerConnection) {
        if (pendingICECandidates.current.length > 0) {
          pendingICECandidates.current.forEach(async (candidate) => {
            await peerConnection.addIceCandidate(
              new RTCIceCandidate(candidate),
            );
          });
        }

        pendingICECandidates.current = [];
      }

      const handleNewCandidate = async (candidate) => {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      };

      return {
        pc,
        createOffer,
        handleAnswer,
        handleOffer,
        handleNewCandidate,
        closeConnection,
        remoteStream,
        localStream,
        processQueuedCandidates,
      };
    } catch (error) {
      console.error(error);
    }
  };

  const cleanupCall = useCallback(() => {
    if (connection) {
      connection.closeConnection;
    }

    setConnection(null);
    setIsInCall(false);
    setIncomingCall(false);
    setCallId(null);
    setCallerInfo(null);
  }, [connection]);

  const endCurrentCall = useCallback(async () => {
    if (!isInCall) return;

    await endCall(callId).unwrap();
    cleanupCall();
  }, [callId, cleanupCall, endCall, isInCall]);

  async function startCall(userId) {
    try {
      const res = await initialCall(userId);

      if (res.error) {
        dispatch(
          openSnackbar({
            type: "error",
            message: res.error?.data?.message,
          }),
        );
        return;
      }

      const peerConnection = await setupPeerConnection({
        remoteUserId: userId,
        callId: res.data.callId,
      });

      setIsInCall(true);
      setConnection(peerConnection);
      setCallId(res.data.callId);

      const offer = await peerConnection.createOffer();
      socket.emit(Events.SDP_OFFER, {
        targetUserId: userId,
        sdp: offer,
        callId: res.data.callId,
      });

      return res.data.callId;
    } catch (err) {
      dispatch(
        openSnackbar({
          type: "error",
          message: err.message,
        }),
      );
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  async function acceptCall() {
    if (!incomingCall) return;

    try {
      await answerCall(callId).unwrap();

      const connection = await setupPeerConnection({
        callId: callId,
        remoteUserId: callerInfo._id,
      });

      if (pendingSDPOffer.current) {
        const answer = await connection.handleOffer(pendingSDPOffer.current);
        socket.emit(Events.SDP_ANSWER, {
          targetUserId: callerInfo._id,
          sdp: answer,
          callId,
        });
        pendingSDPOffer.current = null;

        connection.processQueuedCandidates(connection.peerConnection);
      }

      setConnection(connection);

      setIsInCall(true);
      setIncomingCall(false);

      dispatch(closeDialog());
    } catch (error) {
      console.error(error);
    }
  }

  async function rejectCall() {
    if (!incomingCall) return;

    try {
      await rejectIncomingCall(callId).unwrap();

      cleanupCall();

      dispatch(closeDialog());
    } catch (error) {
      console.error(error);
    }
  }

  const handleIncomingCall = useCallback((data) => {
    setIsInCall(false);
    setIncomingCall(true);
    setCallId(data.callId);
    setCallerInfo(data.caller);

    dispatch(
      openDialog({
        title: "Incoming Call",
        contentType: "INCOMING_CALL_DIALOG",
        closeActionType: Events.CALL_REJECTED,
      }),
    );
  }, []);

  useEffect(() => {
    socket.on(Events.INCOMING_CALL, handleIncomingCall);
    socket.on(Events.SDP_OFFER, async (data) => {
      pendingSDPOffer.current = data.sdp;
    });
    socket.on(Events.SDP_ANSWER, async (data) => {
      // tren nguoi A nhan duoc answer tu nguoi B
      if (!connection || !isInCall) return;

      await connection.handleAnswer(data.sdp);
    });
    socket.on(Events.ICE_CANDIDATE, (data) => {
      if (!connection || !isInCall || !connection.pc.remoteDescription) {
        pendingICECandidates.current.push(data.candidate);
        return;
      }

      connection.handleNewCandidate(data.candidate);
    });
    socket.on(Events.CALL_ENDED, cleanupCall);
    socket.on(Events.CALL_REJECTED, () => {
      cleanupCall();

      dispatch(
        openSnackbar({
          type: "info",
          message: "Your call was declined.",
        }),
      );
    });

    return () => {
      socket.off(Events.INCOMING_CALL);
      socket.off(Events.SDP_OFFER);
      socket.off(Events.SDP_ANSWER);
      socket.off(Events.ICE_CANDIDATE);
      socket.off(Events.CALL_ENDED);
      socket.off(Events.CALL_REJECTED);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callId, callerInfo?._id, connection, handleIncomingCall, isInCall]);

  useEffect(() => {
    if (isInCall && callId) {
      const handleBeforeUnload = (event) => {
        event.preventDefault();
        endCurrentCall();
      };

      window.addEventListener("beforeunload", handleBeforeUnload);

      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    }
  }, [callId, endCurrentCall, isInCall]);

  return (
    <VideoCallContext.Provider
      value={{
        isInCall,
        setIsInCall,
        startCall,
        callerInfo,
        acceptCall,
        rejectCall,
        localStream: connection?.localStream,
        remoteStream: connection?.remoteStream,
        endCurrentCall,
      }}
    >
      {children}
      <VideoCallRoom />
    </VideoCallContext.Provider>
  );
};

export default VideoCallProvider;
