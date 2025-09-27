import { socket } from "@context/SocketProvider";
import { Events } from "@libs/constants";
import {
  Check,
  Close,
  MessageOutlined,
  PersonAdd,
  PersonRemove,
} from "@mui/icons-material";
import { CircularProgress } from "@mui/material";
import {
  useAcceptFriendRequestMutation,
  useCancelFriendRequestMutation,
  useSendFriendRequestMutation,
} from "@services/friendApi";
import { Link } from "react-router-dom";
import Button from "./Button";
import UserAvatar from "./UserAvatar";

export function UserActionButtons({
  userId,
  isFriend,
  requestSent,
  requestReceived,
}) {
  const [sendFriendRequest, { isLoading: isAddingFriend }] =
    useSendFriendRequestMutation();
  const [acceptFriendRequest, { isLoading: isAccepting }] =
    useAcceptFriendRequestMutation();
  const [cancelFriendRequest, { isLoading: isCanceling }] =
    useCancelFriendRequestMutation();
  if (isFriend) {
    return (
      <div className="mt-2 !space-x-1">
        <Button variant="outlined" size="small">
          <PersonRemove className="mr-1" fontSize="small" />
          Unfriend
        </Button>
        <Button
          variant="contained"
          size="small"
          inputProps={{ component: Link, to: `/messages/${userId}` }}
        >
          <MessageOutlined className="mr-1" fontSize="small" />
          Message
        </Button>
      </div>
    );
  }

  if (requestSent) {
    return (
      <Button variant="contained" size="small" disabled>
        <Check className="mr-1" fontSize="small" />
        Request Sent
      </Button>
    );
  }

  if (requestReceived) {
    return (
      <div className="mt-2 !space-x-1">
        <Button
          variant="contained"
          size="small"
          onClick={() => acceptFriendRequest(userId)}
          icon={<Check className="mr-1" fontSize="small" />}
          isLoading={isAccepting}
        >
          Accept
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={() => cancelFriendRequest(userId)}
          icon={<Close className="mr-1" fontSize="small" />}
          isLoading={isCanceling}
        >
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="outlined"
      size="small"
      onClick={async () => {
        await sendFriendRequest(userId).unwrap();
        socket.emit(Events.FRIEND_REQUEST_SENT, {
          receiverId: userId,
        });
      }}
      disabled={isAddingFriend}
    >
      {isAddingFriend ? (
        <CircularProgress className="mr-1 animate-spin" size="16px" />
      ) : (
        <PersonAdd className="mr-1" fontSize="small" />
      )}
      Add Friend
    </Button>
  );
}

const UserCard = ({
  id,
  isFriend,
  fullName = "",
  avatarImage,
  requestSent,
  requestReceived,
  isShowActionButtons = true,
}) => {
  return (
    <div className="card flex flex-col items-center">
      <UserAvatar
        name={fullName}
        src={avatarImage}
        className="mb-3 !h-12 !w-12"
      />
      <Link to={`/users/${id}`}>
        <p className="text-lg font-bold">{fullName}</p>
      </Link>
      {isShowActionButtons && (
        <div className="mt-4">
          <UserActionButtons
            userId={id}
            isFriend={isFriend}
            requestSent={requestSent}
            requestReceived={requestReceived}
          />
        </div>
      )}
    </div>
  );
};

export default UserCard;
