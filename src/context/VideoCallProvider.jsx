import { Events } from "@libs/constants";
import {
  useAnswerCallMutation,
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
import { socket } from "./SocketProvider";
import VideoCallRoom from "@components/VideoCall/VideoCallRoom";

const VideoCallContext = createContext();

export const useVideoCallContext = () => {
  return useContext(VideoCallContext);
};

const VideoCallProvider = ({ children }) => {
  const [isInCall, setIsInCall] = useState(false);
  const [incomingCall, setIncomingCall] = useState(false);
  const [callId, setCallId] = useState(null);
  const [callerInfo, setCallerInfo] = useState(null);

  const pendingSDPOffer = useRef(null);

  const [connection, setConnection] = useState(null);

  const [initialCall] = useInitialCallMutation();
  const [answerCall] = useAnswerCallMutation();
  const [rejectCall] = useRejectCallMutation();

  const setupPeerConnection = async ({ remoteUserId, callId }) => {
    try {
      const pc = new RTCPeerConnection({
        iceServers: [
          {
            urls: "stun:stun.l.google.com.19302",
          },
          {
            urls: "stun:stun1.l.google.com.19302",
          },
        ],
      });

      const localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
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
      }

      // tren client B
      async function handleOffer(offer) {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        return answer;
      }

      const closeConnection = () => {
        localStream.getTracks().forEach((track) => track.stop());
        pc.close();
      };

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
      };
    } catch (error) {
      console.error(error);
    }
  };

  async function startCall(userId) {
    setIsInCall(true);

    const res = await initialCall(userId);
    const peerConnection = await setupPeerConnection({
      remoteUserId: userId,
      callId: res.data.callId,
    });
    setConnection(peerConnection);

    const offer = await peerConnection.createOffer();
    socket.emit(Events.SDP_OFFER, {
      targetUserId: userId,
      sdp: offer,
      callId: res.data.callId,
    });

    return res.data.callId;
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
      }

      setConnection(connection);

      setIsInCall(true);
      setIncomingCall(false);
    } catch (error) {
      console.error(error);
    }
  }

  const handleIncomingCall = useCallback((data) => {
    setIsInCall(false);
    setIncomingCall(true);
    setCallId(data.callId);
    setCallerInfo(data.caller);
  }, []);

  useEffect(() => {
    if (incomingCall) {
      acceptCall();
    }
  }, [acceptCall, incomingCall]);

  useEffect(() => {
    socket.on(Events.INCOMING_CALL, handleIncomingCall);
    socket.on(Events.SDP_OFFER, async (data) => {
      pendingSDPOffer.current = data.sdp;
    });
    // socket.on(Events.SDP_OFFER, async (data) => {
    //   //tren user B
    //   if (!connection || !isInCall) return;

    //   const answer = await connection.handleOffer(data.sdp);
    //   socket.emit(Events.SDP_ANSWER, {
    //     targetUserId: callerInfo._id,
    //     sdp: answer,
    //     callId,
    //   });
    // });
    socket.on(Events.SDP_ANSWER, async (data) => {
      // tren nguoi A nhan duoc answer tu nguoi B
      if (!connection || !isInCall) return;

      await connection.handleAnswer(data.sdp);
    });
    socket.on(Events.ICE_CANDIDATE, (data) => {
      if (!connection || !isInCall) return;

      connection.handleNewCandidate(data.candidate);
    });
  }, [callId, callerInfo?._id, connection, handleIncomingCall, isInCall]);

  return (
    <VideoCallContext.Provider
      value={{
        isInCall,
        setIsInCall,
        startCall,
        localStream: connection?.localStream,
        remoteStream: connection?.remoteStream,
      }}
    >
      {children}
      <VideoCallRoom />
    </VideoCallContext.Provider>
  );
};

export default VideoCallProvider;
