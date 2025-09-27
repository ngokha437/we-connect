import { rootApi } from "./rootApi";

export const messageApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    getConversations: builder.query({
      query: () => "/messages/conversations",
      providesTags: ["CONVERSATIONS"],
    }),
    getMessages: builder.query({
      query: ({ userId, offset, limit }) => ({
        url: "/messages",
        params: { userId, offset, limit },
      }),
      keepUnusedDataFor: 0,
      serializeQueryArgs: ({ queryArgs }) => ({ userId: queryArgs.userId }),
      providesTags: (result, error, { userId }) => {
        return [{ type: "MESSAGES", id: userId }];
      },
    }),
    sendMessage: builder.mutation({
      query: ({ message, receiver }) => ({
        url: "/messages/create",
        method: "POST",
        body: { message, receiver },
      }),
      // invalidatesTags: (result, error, { receiver }) => [
      //   "CONVERSATIONS",
      //   { type: "MESSAGES", id: receiver },
      // ],
      async onQueryStarted(
        { message, receiver },
        { dispatch, queryFulfilled, getState },
      ) {
        const { auth } = getState();
        const currentUser = auth.userInfo;

        const tempId = crypto.randomUUID();
        const now = new Date().toISOString();

        const optimisticMessage = {
          seen: false,
          _id: tempId,
          message: message,
          sender: currentUser,
          receiver: {
            _id: receiver,
          },
          createdAt: now,
          updatedAt: now,
        };

        const messagesUpdatePath = dispatch(
          messageApi.util.updateQueryData(
            "getMessages",
            {
              userId: receiver,
            },
            (draft) => {
              if (draft.messages) {
                draft.messages.push(optimisticMessage);
              }
            },
          ),
        );

        const conversationUpdatePath = dispatch(
          rootApi.util.updateQueryData(
            "getConversations",
            undefined,
            (draft) => {
              let currentConversationIndex = draft.findIndex(
                (message) =>
                  message.sender._id === receiver ||
                  message.receiver._id === receiver,
              );

              let receiverInfo = {};

              if (currentConversationIndex !== -1) {
                receiverInfo = draft[currentConversationIndex].receiver;
                draft.splice(currentConversationIndex, 1);
              }

              draft.unshift({ ...optimisticMessage, receiver: receiverInfo });
            },
          ),
        );

        try {
          const response = await queryFulfilled;

          // update draft message with real message from backend
          dispatch(
            messageApi.util.updateQueryData(
              "getMessages",
              {
                userId: receiver,
              },
              (draft) => {
                if (draft.messages) {
                  const messageIndex = draft.messages.findIndex(
                    (msg) => msg._id === tempId,
                  );

                  if (messageIndex !== -1) {
                    draft.messages[messageIndex] = response.data;
                  }
                }
              },
            ),
          );

          dispatch(
            rootApi.util.updateQueryData(
              "getConversations",
              undefined,
              (draft) => {
                const conversationIndex = draft.findIndex(msg => msg._id === tempId);
                
                if(conversationIndex !== -1) {
                  draft[conversationIndex] = response.data;
                }

                // let currentConversationIndex = draft.findIndex(
                //   (message) =>
                //     message.sender._id === receiver ||
                //     message.receiver._id === receiver,
                // );

                // let receiverInfo = {};

                // if (currentConversationIndex !== -1) {
                //   receiverInfo = draft[currentConversationIndex].receiver;
                //   draft.splice(currentConversationIndex, 1);
                // }

                // draft.unshift({ ...optimisticMessage, receiver: receiverInfo });
              },
            ),
          );
        } catch (error) {
          messagesUpdatePath.undo();
          conversationUpdatePath.undo();

          console.log({ error });
        }
      },
    }),
    markConversationAsSeen: builder.mutation({
      query: (sender) => ({
        url: "/messages/update-seen",
        method: "PUT",
        body: { sender },
      }),
      invalidatesTags: () => ["CONVERSATIONS"],
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
  useMarkConversationAsSeenMutation,
} = messageApi;
