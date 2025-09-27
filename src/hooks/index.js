import { socket } from "@context/SocketProvider";
import { Events } from "@libs/constants";
import { useMediaQuery, useTheme } from "@mui/material";
import { logout as logoutAction } from "@redux/slices/authSlice";
import { useCreateNotificationMutation } from "@services/notificationApi";
import {
  useGetPostsByAuthorIdQuery,
  useGetPostsQuery,
} from "@services/postApi";
import { throttle } from "lodash";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export const useLogout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logout = () => {
    dispatch(logoutAction());
    navigate("/login", { replace: true });
  };
  return { logout };
};

export const useUserInfo = () => {
  return useSelector((state) => state.auth.userInfo);
};

export const useDetectLayout = () => {
  const theme = useTheme();
  const isMediumLayout = useMediaQuery(theme.breakpoints.down("md"));

  return { isMediumLayout };
};

export const useLazyLoadPosts = ({ userId }) => {
  const [offset, setOffset] = useState(0);
  const limit = 10;
  const [hasMore, setHasMore] = useState(true);

  const {
    data: userProfileData = { ids: [], entities: [] },
    isFetching: userProfileFetching,
    refetch: userProfileRefetch,
  } = useGetPostsByAuthorIdQuery({ offset, limit, userId }, { skip: !userId });

  const {
    data: homeData = { ids: [], entities: [] },
    isFetching: homeIsFetching,
    refetch: homeRefetch,
  } = useGetPostsQuery({ offset, limit }, { skip: !!userId });

  const data = userId ? userProfileData : homeData;
  const isFetching = userId ? userProfileFetching : homeIsFetching;
  const refetch = userId ? userProfileRefetch : homeRefetch;

  const posts = (data.ids || []).map((id) => data.entities[id]);

  const prevPostCountRef = useRef(0);

  useEffect(() => {
    if (!isFetching && data && hasMore) {
      if (userId) {
        if (data.ids.length === data.meta.total) {
          setHasMore(false);
        }
      } else {
        const currentPostCount = data.ids.length;
        const newFetchedCount = currentPostCount - prevPostCountRef.current;
        if (newFetchedCount === 0) {
          setHasMore(false);
        } else {
          prevPostCountRef.current = currentPostCount;
        }
      }
    }
  }, [data, hasMore, isFetching, userId]);

  const loadMore = useCallback(() => {
    setOffset((offset) => offset + limit);
  }, []);

  useEffect(() => {
    refetch();
  }, [offset, refetch]);

  useInfiniteScroll({
    hasMore,
    loadMore,
    isFetching,
  });

  return { isFetching, posts };
};

export const useInfiniteScroll = ({
  hasMore,
  loadMore,
  isFetching,
  threshold = 50,
  throttleMs = 500,
}) => {
  const handleScroll = useMemo(() => {
    return throttle(() => {
      const scrollTop = document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;

      if (!hasMore) return;

      if (clientHeight + scrollTop + threshold >= scrollHeight && !isFetching) {
        loadMore();
      }
    }, throttleMs);
  }, [hasMore, isFetching, loadMore, threshold, throttleMs]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      handleScroll.cancel();
    };
  }, [handleScroll]);
};

export const useNotification = () => {
  const [createNotificationMutation] = useCreateNotificationMutation();
  const { _id: currentUserId } = useUserInfo();

  async function createNotification({
    receiverUserId,
    postId,
    notificationType,
    notificationTypeId,
  }) {
    if (receiverUserId === currentUserId) {
      return;
    }

    const notification = await createNotificationMutation({
      userId: receiverUserId,
      postId,
      notificationType,
      notificationTypeId,
    }).unwrap();

    socket.emit(Events.CREATE_NOTIFICATION, {...notification, testing: false});
  }

  return { createNotification };
};
