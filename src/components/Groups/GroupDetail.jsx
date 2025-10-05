import { Tab, Tabs } from "@mui/material";
import { useGetGroupDetailQuery } from "@services/groupApi";
import { Link, Outlet, useLocation, useParams } from "react-router-dom";
import GroupActionButtons from "./GroupActionButtons";
import GroupBannerUploader from "./GroupBannerUploader";
import GroupJoinRequests from "./GroupJoinRequests";

function GroupDetail() {
  const { groupId } = useParams();
  const location = useLocation();
  const { data = {}, isLoading, isFetching } = useGetGroupDetailQuery(groupId);

  const TABS = [
    {
      path: "discussion",
      label: "Discussion",
      index: 0,
    },
    {
      path: "members",
      label: "Members",
      index: 1,
    },
  ];

  const getActiveTabIndex = (pathName) => {
    if (pathName === `/groups/${groupId}`) return 0;

    const lastSegment = pathName.split("/").filter(Boolean).pop();
    const matchedTab = TABS.find((tab) => tab.path === lastSegment);
    return matchedTab ? matchedTab.index : 0;
  };

  const currentTabIndex = getActiveTabIndex(location.pathname);

  // Owner => Admin => Moderator => Member

  const isMember = data.userMembership?.isMember;
  const isRequestSent = !isMember && data.userMembership?.status === "Pending";
  const canViewPendingRequest = ["Owner", "Admin", "Moderator"].includes(
    data.userMembership?.role,
  );
  const canUpdateGroup = ["Owner", "Admin"].includes(data.userMembership?.role);

  return (
    <div className="flex flex-col gap-4">
      <div className="card relative p-0">
        <div className="relative">
          <img
            className="h-36 w-full object-cover sm:h-80"
            src={data.coverImage ?? "https://placehold.co/1920x540"}
          />
          {canUpdateGroup && (
            <GroupBannerUploader
              className="absolute right-6 bottom-3"
              groupId={groupId}
            />
          )}
        </div>
        <div className="flex justify-between gap-2 p-6">
          <div>
            <p className="text-2xl font-bold">{data.name}</p>
            <p>{data.memberCount} members</p>
          </div>
          <div>
            <GroupActionButtons
              id={data._id}
              isMember={isMember}
              isRequestSent={isRequestSent}
              role={data.userMembership?.role}
            />
          </div>
        </div>
        {isMember ? (
          <div>
            <div className="border-dark-300 border-t px-6 py-2">
              <Tabs
                value={currentTabIndex}
                sx={{
                  "&& .Mui-selected": {
                    backgroundColor: "var(--color-primary-main)",
                    color: "white",
                    borderRadius: "5px",
                  },

                  "&& .MuiTabs-indicator": {
                    display: "none",
                  },

                  "&& .MuiTab-root": {
                    minHeight: "auto",
                  },

                  "&& .MuiTabs-scroller": {
                    marginTop: "4px",
                  },
                }}
              >
                {TABS.map((tab) => (
                  <Tab
                    key={tab.path}
                    label={tab.label}
                    LinkComponent={Link}
                    to={`/groups/${groupId}/${tab.path}`}
                  />
                ))}
              </Tabs>
            </div>
          </div>
        ) : (
          <div className="border-dark-300 border-t px-6 py-2">
            <p>Join this group to discuss and connect with other members</p>
          </div>
        )}
      </div>
      {isMember && (
        <div className="flex gap-4">
          <div className="flex-3">
            <Outlet
              context={{
                groupId: groupId,
                currentUserRole: data.userMembership?.role,
              }}
            />
          </div>
          <div className="flex-2 space-y-4">
            <div className="card">
              <p className="mb-3 text-lg font-bold">Description</p>
              <p>{data.description}</p>
            </div>
            {canViewPendingRequest && <GroupJoinRequests groupId={groupId} />}
          </div>
        </div>
      )}
    </div>
  );
}

export default GroupDetail;
