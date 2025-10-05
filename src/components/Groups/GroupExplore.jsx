import { useGetGroupsQuery } from "@services/groupApi";
import GroupList from "./GroupList";

const GroupExplore = () => {
  const { data = {} } = useGetGroupsQuery({
    searchQuery: "",
    limit: 10,
    offset: 0,
  });

  return <GroupList groups={data.groups} title="Explore" />;
};

export default GroupExplore;
