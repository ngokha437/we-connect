import UserCard from "@components/UserCard";
import { useSearchUsersQuery } from "@services/rootApi";
import { useLocation } from "react-router-dom";

const SearchUsersPage = () => {
  const location = useLocation();

  const { data } = useSearchUsersQuery({
    limit: 10,
    offset: 0,
    searchQuery: location?.state?.searchTerm,
  });

  return (
    <div className="container flex-col">
      <p className="text-xl font-bold">Search</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {(data?.users || []).map((user) => (
          <UserCard
            key={user._id}
            id={user._id}
            fullName={user.fullName}
            avatarImage={user.image}
            isFriend={user.isFriend}
            requestSent={user.requestSent}
            requestReceived={user.requestReceived}
          />
        ))}
      </div>
    </div>
  );
};

export default SearchUsersPage;
