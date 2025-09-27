import ChatDetail from "@components/Messages/ChatDetail";
import AccountSettings from "@pages/AccountSettings";
import AuthLayout from "@pages/auth/AuthLayout";
import LoginPage from "@pages/auth/LoginPage";
import OTPVerifyPage from "@pages/auth/OTPVerifyPage";
import RegisterPage from "@pages/auth/RegisterPage";
import MessagePage from "@pages/MessagePage";
import ProtectedLayout from "@pages/ProtectedLayout";
import RootLayout from "@pages/RootLayout";
import SearchUsersPage from "@pages/SearchUsersPage";
import About from "@pages/UserProfile/About";
import FriendList from "@pages/UserProfile/FriendList";
import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

const HomePage = lazy(() => import("@pages/HomePage"));
const UserProfilePage = lazy(() => import("@pages/UserProfile/UserProfile"));

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        element: <ProtectedLayout />,
        children: [
          {
            path: "/",
            element: <HomePage />,
          },
          {
            path: "/messages",
            element: <MessagePage />,
            children: [
              {
                path: ":userId",
                element: <ChatDetail />,
              },
            ],
          },
          {
            path: "/search/users",
            element: <SearchUsersPage />,
          },
          {
            path: "/users/:userId",
            element: <UserProfilePage />,
            children: [
              {
                index: true,
                element: <Navigate to="about" replace />,
              },
              {
                path: "about",
                element: <About />,
              },
              {
                path: "friends",
                element: <FriendList />,
              },
            ],
          },
          {
            path: "/settings",
            children: [
              {
                path: "account",
                element: <AccountSettings />,
              },
            ],
          },
        ],
      },
      {
        element: <AuthLayout />,
        children: [
          {
            path: "/register",
            element: <RegisterPage />,
          },
          {
            path: "/login",
            element: <LoginPage />,
          },
          {
            path: "/verify-otp",
            element: <OTPVerifyPage />,
          },
        ],
      },
    ],
  },
]);

export default router;
