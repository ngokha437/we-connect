import { useVideoCallContext } from "@context/VideoCallProvider";
import { Mic, PhoneDisabled, Videocam } from "@mui/icons-material";
import { IconButton } from "@mui/material";

const CallControls = () => {
  const { setIsInCall } = useVideoCallContext();

  return (
    <div className="flex justify-center gap-3 bg-gray-900 p-4">
      <IconButton>
        <Mic className="text-dark-400" />
      </IconButton>
      <IconButton onClick={() => setIsInCall(false)}>
        <PhoneDisabled className="text-red-500" />
      </IconButton>
      <IconButton>
        <Videocam className="text-dark-400" />
      </IconButton>
    </div>
  );
};

export default CallControls;
