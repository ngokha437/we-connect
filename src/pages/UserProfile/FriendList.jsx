import UserCard from "@components/UserCard";
import { useGetFriendsByUserIdQuery } from "@services/friendApi";
import { useParams } from "react-router-dom";

const FriendList = () => {
  const { userId } = useParams();
  const { data } = useGetFriendsByUserIdQuery(userId);

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {(data?.friends || []).map((user) => (
          <UserCard
            key={user._id}
            id={user._id}
            fullName={user.fullName}
            avatarImage={user.image}
            isShowActionButtons={false}
          />
        ))}
      </div>
    </div>
  );
};

export default FriendList;
