import { useVideoCallContext } from "@context/VideoCallProvider";
import { Events } from "@libs/constants";
import { Close } from "@mui/icons-material";
import { DialogTitle, IconButton, Dialog as MUIDialog } from "@mui/material";
import { closeDialog } from "@redux/slices/dialogSlice";
import { useDispatch, useSelector } from "react-redux";
import IncomingCallDialog from "./configs/IncomingCallDialog";
import NewPostDialog from "./configs/NewPostDialog";

const DynamicContent = ({ contentType, additionalData }) => {
  switch (contentType) {
    case "NEW_POST_DIALOG":
      return <NewPostDialog userInfo={additionalData} />;
    case "INCOMING_CALL_DIALOG":
      return <IncomingCallDialog />;
    default:
      return <p></p>;
  }
};

const Dialog = () => {
  const dialog = useSelector((state) => state.dialog);
  const dispatch = useDispatch();
  const { rejectCall } = useVideoCallContext();

  const close = () => {
    dispatch(closeDialog());

    if (dialog.closeActionType === Events.CALL_REJECTED) {
      rejectCall();
    }
  };

  return (
    <MUIDialog
      open={dialog.open}
      maxWidth={dialog.maxWidth}
      fullWidth={dialog.fullWidth}
      onClose={close}
    >
      <DialogTitle className="flex items-center justify-between border-b">
        {dialog.title}
        <IconButton onClick={close}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DynamicContent
        contentType={dialog.contentType}
        additionalData={dialog.additionalData}
      />
    </MUIDialog>
  );
};

export default Dialog;
