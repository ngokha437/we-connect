import { Events } from "@libs/constants";
import { useInitialCallMutation } from "@services/videoCallApi";
import { createContext, useContext, useRef, useState } from "react";
import { socket } from "./SocketProvider";

const VideoCallContext = createContext();

export const useVideoCallContext = () => {
  return useContext(VideoCallContext);
};

const VideoCallProvider = ({ children }) => {
  const [isInCall, setIsInCall] = useState(false);
  const peerConnection = useRef(null);

  const [initialCall] = useInitialCallMutation();

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
        audio: true,
      });

      const remoteMediaStream = new MediaStream();

      pc.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
          remoteMediaStream.addTrack(track);
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

      peerConnection.current = pc;
      return pc;
    } catch (error) {
      console.error(error);
    }
  };

  async function startCall(userId) {
    setIsInCall(true);

    const res = initialCall(userId);
    console.log({ res });

    const callId = 321;
    const pc = await setupPeerConnection({ remoteUserId: userId, callId });
    console.log({ pc });
  }

  return (
    <VideoCallContext.Provider value={{ isInCall, setIsInCall, startCall }}>
      {children}
    </VideoCallContext.Provider>
  );
};

export default VideoCallProvider;
