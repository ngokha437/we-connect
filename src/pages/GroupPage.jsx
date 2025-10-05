import GroupSidebar from "@components/Groups/GroupSideBar";
import { Outlet } from "react-router-dom";

const GroupPage = () => {
  return (
    <div className="container">
      <GroupSidebar />
      <div className="flex flex-1 flex-col gap-4">
        <Outlet />
      </div>
    </div>
  );
};

export default GroupPage;
