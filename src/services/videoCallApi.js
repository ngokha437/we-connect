import { rootApi } from "./rootApi";

export const videoCallApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    initialCall: builder.mutation({
      query: (receiverId) => ({
        url: "video-calls/initiate",
        method: "POST",
        body: { receiverId },
      }),
    }),
    endCall: builder.mutation({
      query: (callId) => ({
        url: `video-calls/${callId}/end`,
        method: "PATCH",
        body: { callId },
      }),
    }),
    answerCall: builder.mutation({
      query: (callId) => ({
        url: `video-calls/${callId}/end`,
        method: "PATCH",
        body: { callId },
      }),
    }),
    rejectCall: builder.mutation({
      query: (callId) => ({
        url: `video-calls/${callId}/reject`,
        method: "PATCH",
        body: { callId },
      }),
    }),
  }),
});

export const {
  useInitialCallMutation,
  useEndCallMutation,
  useAnswerCallMutation,
  useRejectCallMutation,
} = videoCallApi;
