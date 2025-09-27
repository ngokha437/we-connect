import { useVideoCallContext } from "@context/VideoCallProvider";
import CallControls from "./CallControls";

const VideoCallRoom = () => {
  const { isInCall } = useVideoCallContext();
  if (!isInCall) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <div className="relative flex-1">
        <div className="absolute inset-0 bg-red-300">
          <video />
        </div>
        <div className="absolute right-4 bottom-4 h-40 w-56 overflow-hidden rounded-lg bg-green-600">
          <video />
        </div>
      </div>
      <CallControls />
    </div>
  );
};

export default VideoCallRoom;
