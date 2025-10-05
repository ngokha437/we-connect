import UserAvatar from "@components/UserAvatar";
import { useUserInfo } from "@hooks/index";
import { Link } from "react-router-dom";
import MemberActionButtons from "./MemberActionButtons";

const GroupMemberCard = ({
  id,
  fullName = "",
  avatarImage,
  currentUserRole,
  targetUserRole,
  groupId,
}) => {
  const { _id } = useUserInfo();

  const isMyself = _id === id;

  return (
    <div className="card relative flex flex-col items-center">
      {!isMyself && (
        <div className="absolute top-2 right-2">
          <MemberActionButtons
            groupId={groupId}
            targetUserId={id}
            currentUserRole={currentUserRole}
            targetUserRole={targetUserRole}
          />
        </div>
      )}
      <UserAvatar
        name={fullName}
        src={avatarImage}
        className="mb-3 !h-12 !w-12"
      />
      <Link to={`/users/${id}`}>
        <p className="text-lg font-bold">{fullName}</p>
      </Link>
      <p className="text-sm text-gray-400">Role: {targetUserRole}</p>
    </div>
  );
};

export default GroupMemberCard;
