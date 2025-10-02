import Button from "@components/Button";
import UserAvatar from "@components/UserAvatar";
import { useVideoCallContext } from "@context/VideoCallProvider";
import { Call, CallEnd } from "@mui/icons-material";

const IncomingCallDialog = () => {
  const {
    incomingCall,
    callerInfo = {},
    acceptCall,
    rejectCall,
    callId,
  } = useVideoCallContext();

  return (
    <div className="flex flex-col items-center p-6">
      <UserAvatar
        name={callerInfo?.fullName}
        src={callerInfo?.image}
        className="mb-3 !h-16 !w-16"
      />
      <p className="mb-1 text-xl font-semibold">{callerInfo?.fullName}</p>
      <p className="text-dark-400 mb-4">Incoming video call...</p>

      <div className="flex w-full justify-center gap-6">
        <Button
          variant="contained"
          inputProps={{ startIcon: <Call /> }}
          onClick={acceptCall}
        >
          Accept
        </Button>
        <Button
          variant="contained"
          inputProps={{ startIcon: <CallEnd />, color: "error" }}
          onClick={rejectCall}
        >
          Reject
        </Button>
      </div>
    </div>
  );
};

export default IncomingCallDialog;
