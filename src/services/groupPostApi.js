import { createEntityAdapter } from "@reduxjs/toolkit";
import { rootApi } from "./rootApi";

const postAdapter = createEntityAdapter({
  selectId: (post) => post._id,
  sortComparer: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
});

const initialState = postAdapter.getInitialState();

export const groupPostApi = rootApi.injectEndpoints({
  endpoints: (builder) => {
    return {
      createGroupPost: builder.mutation({
        query: ({ groupId, formData }) => {
          return {
            url: `/groups/${groupId}/posts`,
            method: "POST",
            body: formData,
          };
        },
        onQueryStarted: async (
          args,
          { dispatch, queryFulfilled, getState },
        ) => {
          const store = getState();
          const tempId = crypto.randomUUID();
          const newPost = {
            _id: tempId,
            likes: [],
            comments: [],
            content: args.formData?.get("content"),
            author: {
              notifications: [],
              _id: store.auth.userInfo._id,
              fullName: store.auth.userInfo.fullName,
              image: store.auth.userInfo.image,
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            __v: 0,
          };

          const userProfilePostsArgs = rootApi.util.selectCachedArgsForQuery(
            store,
            "getPostsByGroupId",
          );
          const patchResults = [];
          const cachingPairs = [
            ...userProfilePostsArgs.map((arg) => [
              "getPostsByGroupId",
              { groupId: arg.groupId },
            ]),
          ];

          cachingPairs.forEach(([endpoint, key]) => {
            const patchResult = dispatch(
              rootApi.util.updateQueryData(endpoint, key, (draft) => {
                postAdapter.addOne(draft, newPost);
              }),
            );
            patchResult.push(patchResult);
          });

          try {
            const { data } = await queryFulfilled;

            cachingPairs.forEach(([endpoint, key]) => {
              dispatch(
                rootApi.util.updateQueryData(endpoint, key, (draft) => {
                  postAdapter.removeOne(draft, tempId);
                  postAdapter.addOne(draft, {
                    ...data,
                    author: newPost.author,
                  });
                }),
              );
            });
          } catch (error) {
            patchResults.forEach((patchResult) => patchResult.undo());
          }
        },
      }),
      getPostsByGroupId: builder.query({
        query: ({ limit, offset, groupId } = {}) => {
          return {
            url: `/groups/${groupId}/posts`,
            params: { limit, offset },
          };
        },
        keepUnusedDataFor: 0,
        transformResponse: (response) => {
          const postNormalize = postAdapter.upsertMany(
            initialState,
            response.posts,
          );

          return {
            ...postNormalize,
            meta: {
              total: response.total,
              limit: response.limit,
              offset: response.offset,
            },
          };
        },
        serializeQueryArgs: ({ queryArgs }) => ({
          groupId: queryArgs.groupId,
        }),
        merge: (currentCache, newItems) => {
          return postAdapter.upsertMany(currentCache, newItems.entities);
        },
        providesTags: (result) =>
          result?.posts
            ? [
                ...result.posts.map(({ _id }) => ({
                  type: "GET_POSTS_BY_GROUP_ID",
                  id: _id,
                })),
                { type: "GET_POSTS_BY_GROUP_ID", id: "LIST" },
              ]
            : [{ type: "GET_POSTS_BY_GROUP_ID", id: "LIST" }],
      }),
      likeGroupPost: builder.mutation({
        query: (postId) => {
          return {
            url: `groups/posts/${postId}/likes`,
            method: "POST",
          };
        },
        onQueryStarted: async (
          args,
          { dispatch, queryFulfilled, getState },
        ) => {
          const store = getState();
          const tempId = crypto.randomUUID();

          const userProfilePostsArgs = rootApi.util.selectCachedArgsForQuery(
            store,
            "getPostsByGroupId",
          );

          const patchResults = [];
          const cachingPairs = [
            ...userProfilePostsArgs.map((arg) => [
              "getPostsByGroupId",
              { groupId: arg.groupId },
            ]),
          ];

          cachingPairs.forEach(([endpoint, key]) => {
            const patchResult = dispatch(
              rootApi.util.updateQueryData(endpoint, key, (draft) => {
                const currentPost = draft.entities[args];
                if (currentPost) {
                  currentPost.likes.push({
                    author: {
                      _id: store.auth.userInfo._id,
                      fullName: store.auth.userInfo.fullName,
                    },
                    _id: tempId,
                  });
                }
              }),
            );

            patchResults.push(patchResult);
          });

          try {
            const { data } = await queryFulfilled;

            cachingPairs.forEach(([endpoint, key]) => {
              dispatch(
                rootApi.util.updateQueryData(endpoint, key, (draft) => {
                  const currentPost = draft.entities[args];
                  if (currentPost) {
                    currentPost.likes = currentPost.likes.map((like) => {
                      if (like._id === tempId) {
                        return {
                          author: {
                            _id: store.auth.userInfo._id,
                            fullName: store.auth.userInfo.fullName,
                          },
                          createdAt: data.createdAt,
                          updatedAt: data.updatedAt,
                          _id: data._id,
                        };
                      }
                      return like;
                    });
                  }
                }),
              );
            });
          } catch (error) {
            patchResults.forEach((patchResult) => patchResult.undo());
          }
        },
      }),
      unlikeGroupPost: builder.mutation({
        query: (postId) => {
          return {
            url: `groups/posts/${postId}/likes`,
            method: "DELETE",
          };
        },
      }),
      createGroupComment: builder.mutation({
        query: ({ postId, comment }) => {
          return {
            url: `groups/posts/${postId}/comments`,
            method: "POST",
            body: { comment },
          };
        },
        onQueryStarted: async (
          params,
          { dispatch, queryFulfilled, getState },
        ) => {
          const tempId = crypto.randomUUID();
          const store = getState();

          const optimisticComment = {
            _id: tempId,
            comment: params.comment,
            author: {
              _id: store.auth.userInfo._id,
              fullName: store.auth.userInfo.fullName,
              image: store.auth.userInfo.image,
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          const userProfilePostsArgs = rootApi.util.selectCachedArgsForQuery(
            store,
            "getPostsByGroupId",
          );
          const patchResults = [];
          const cachingPairs = [
            ...userProfilePostsArgs.map((arg) => [
              "getPostsByGroupId",
              { groupId: arg.groupId },
            ]),
          ];

          cachingPairs.forEach(([endpoint, key]) => {
            const patchResult = dispatch(
              rootApi.util.updateQueryData(endpoint, key, (draft) => {
                const currentPost = draft.entities[params.postId];

                if (currentPost) {
                  currentPost.comments.push(optimisticComment);
                }
              }),
            );
            patchResults.push(patchResult);
          });

          try {
            const { data } = await queryFulfilled;

            cachingPairs.forEach(([endpoint, key]) => {
              dispatch(
                rootApi.util.updateQueryData(endpoint, key, (draft) => {
                  const currentPost = draft.entities[params.postId];
                  if (currentPost) {
                    const commentIndex = currentPost.comments.findIndex(
                      (comment) => comment._id === tempId,
                    );
                    if (commentIndex !== -1) {
                      currentPost.comments[commentIndex] = {
                        ...data.comment,
                        author: optimisticComment.author,
                      };
                    }
                  }
                }),
              );
            });
          } catch (error) {
            console.log({ error });
            patchResults.forEach((patchResult) => patchResult.undo());
          }
        },
      }),
    };
  },
});

export const {
  useCreateGroupPostMutation,
  useGetPostsByGroupIdQuery,
  useLikeGroupPostMutation,
  useUnlikeGroupPostMutation,
  useCreateGroupCommentMutation,
} = groupPostApi;
