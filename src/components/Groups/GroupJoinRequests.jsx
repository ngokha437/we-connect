import Button from "@components/Button";
import UserAvatar from "@components/UserAvatar";
import { Check, Close } from "@mui/icons-material";
import {
  useGetGroupPendingRequestsQuery,
  useRespondGroupPendingRequestMutation,
} from "@services/groupApi";

const GroupJoinRequestItem = ({ fullName, id, userAvatarSrc, groupId }) => {
  const [respondPendingRequest] = useRespondGroupPendingRequestMutation();

  return (
    <div className="flex gap-2">
      <UserAvatar name={fullName} src={userAvatarSrc} />
      <div>
        <p className="font-bold">{fullName}</p>
        <div className="mt-2 !space-x-1">
          <Button
            variant="contained"
            size="small"
            onClick={() =>
              respondPendingRequest({
                groupId,
                userId: id,
                approve: true,
              })
            }
            icon={<Check className="mr-1" fontSize="small" />}
          >
            Accept
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() =>
              respondPendingRequest({
                groupId,
                userId: id,
                approve: false,
              })
            }
            icon={<Close className="mr-1" fontSize="small" />}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

const GroupJoinRequests = ({ groupId }) => {
  const { data = {} } = useGetGroupPendingRequestsQuery(groupId);

  return (
    <div className="card">
      <p className="mb-4 font-bold">Pending Requests</p>
      <div className="space-y-4">
        {(data.pendingRequests || []).map(({ user }) => (
          <GroupJoinRequestItem
            key={user._id}
            id={user._id}
            fullName={user.fullName}
            userAvatarSrc={user.image}
            groupId={groupId}
          />
        ))}
      </div>
    </div>
  );
};

export default GroupJoinRequests;
