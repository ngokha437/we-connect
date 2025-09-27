import UserAvatar from "@components/UserAvatar";
import { UserActionButtons } from "@components/UserCard";
import { useUserInfo } from "@hooks/index";
import { Tab, Tabs } from "@mui/material";
import { useGetUserInfoByIdQuery } from "@services/userApi";
import { Link, Outlet, useLocation, useParams } from "react-router-dom";

function UserProfile() {
  const { userId } = useParams();
  const location = useLocation();
  const { _id } = useUserInfo();
  const { data = {}, isLoading, isFetching } = useGetUserInfoByIdQuery(userId);

  const isMyProfile = userId === _id;
  const fullName = data.fullName;

  const TABS = [
    {
      path: "about",
      label: "About",
      index: 0,
    },
    {
      path: "friends",
      label: "Friends",
      index: 1,
    },
  ];

  const getActiveTabIndex = (pathName) => {
    if (pathName === `/users/${userId}`) return 0;

    const lastSegment = pathName.split("/").filter(Boolean).pop();
    const matchedTab = TABS.find((tab) => tab.path === lastSegment);
    return matchedTab ? matchedTab.index : 0;
  };

  const currentTabIndex = getActiveTabIndex(location.pathname);

  return (
    <div className="container flex-col">
      <div className="card relative p-0">
        <img
          className="h-36 w-full object-cover sm:h-80"
          src={data.coverImage ?? "https://placehold.co/1920x540"}
        />
        <div className="absolute mb-3 flex w-full -translate-y-1/3 transform flex-col items-center px-6 sm:-translate-y-1/2 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-end">
            <UserAvatar
              name={fullName}
              src={data.image}
              className="!h-24 !w-24 border-4 border-white !text-6xl sm:!h-44 sm:!w-44"
            />
            <div className="text-center sm:text-left">
              <p className="max-w-80 truncate text-2xl font-bold sm:text-3xl">
                {fullName}
              </p>
              <p className="text-dark-400 text-sm">
                <Link to={`/users/${userId}/friends`}>
                  {data.totalFriends} friends
                </Link>
              </p>
            </div>
          </div>
          <div>
            {!isMyProfile && (
              <UserActionButtons
                userId={userId}
                isFriend={data.isFriend}
                requestSent={data.requestSent}
                requestReceived={data.requestReceived}
              />
            )}
          </div>
        </div>
        <div className="pt-40 sm:pt-36">
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
                  to={`/users/${userId}/${tab.path}`}
                />
              ))}
            </Tabs>
          </div>
        </div>
      </div>
      <Outlet
        context={{
          userData: data,
          isMyProfile,
        }}
      />
    </div>
  );
}

export default UserProfile;
