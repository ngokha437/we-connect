import { useGetGroupMembersQuery } from "@services/groupApi";
import { useOutletContext, useParams } from "react-router-dom";
import GroupMemberCard from "./GroupMemberCard";

const GroupMembers = () => {
  const { groupId } = useParams();
  const { data } = useGetGroupMembersQuery(groupId);
  const { currentUserRole } = useOutletContext();

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {(data?.members || []).map(({ user, role }) => (
          <GroupMemberCard
            key={user._id}
            id={user._id}
            fullName={user.fullName}
            avatarImage={user.image}
            targetUserRole={role}
            currentUserRole={currentUserRole}
            groupId={groupId}
          />
        ))}
      </div>
    </div>
  );
};

export default GroupMembers;
