import { createEntityAdapter } from "@reduxjs/toolkit";
import { rootApi } from "./rootApi";

const postAdapter = createEntityAdapter({
  selectId: (post) => post._id,
  sortComparer: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
});

const initialState = postAdapter.getInitialState();

export const postApi = rootApi.injectEndpoints({
  endpoints: (builder) => {
    return {
      createPost: builder.mutation({
        query: (formData) => {
          return {
            url: "/posts",
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
            content: args.get("content"),
            author: {
              notifications: [],
              _id: store.auth.userInfo._id,
              fullName: store.auth.userInfo.fullName,
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            __v: 0,
          };

          const userProfilePostsArgs = rootApi.util.selectCachedArgsForQuery(
            store,
            "getPostsByAuthorId",
          );
          const patchResults = [];
          const cachingPairs = [
            ...userProfilePostsArgs.map((arg) => [
              "getPostsByAuthorId",
              { userId: arg.userId },
            ]),
            ["getPosts", "allPosts"],
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
                  postAdapter.addOne(draft, data);
                }),
              );
            });
          } catch (error) {
            patchResults.forEach((patchResult) => patchResult.undo());
          }
        },
      }),
      getPosts: builder.query({
        query: ({ limit, offset } = {}) => {
          return {
            url: "/posts",
            params: { limit, offset },
          };
        },
        keepUnusedDataFor: 0,
        transformResponse: (response) => {
          return postAdapter.upsertMany(initialState, response);
        },
        serializeQueryArgs: () => "allPosts",
        merge: (currentCache, newItems) => {
          return postAdapter.upsertMany(currentCache, newItems.entities);
        },
        providesTags: [{ type: "POSTS" }],
      }),
      getPostsByAuthorId: builder.query({
        query: ({ limit, offset, userId } = {}) => {
          return {
            url: `/posts/author/${userId}`,
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
          userId: queryArgs.userId,
        }),
        merge: (currentCache, newItems) => {
          return postAdapter.upsertMany(currentCache, newItems.entities);
        },
        providesTags: (result) =>
          result?.posts
            ? [
                ...result.posts.map(({ _id }) => ({
                  type: "GET_POSTS_BY_AUTHOR_ID",
                  id: _id,
                })),
                { type: "GET_POSTS_BY_AUTHOR_ID", id: "LIST" },
              ]
            : [{ type: "GET_POSTS_BY_AUTHOR_ID", id: "LIST" }],
      }),
      likePost: builder.mutation({
        query: (postId) => {
          return {
            url: `/posts/${postId}/like`,
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
            "getPostsByAuthorId",
          );

          const patchResults = [];
          const cachingPairs = [
            ...userProfilePostsArgs.map((arg) => [
              "getPostsByAuthorId",
              { userId: arg.userId },
            ]),
            ["getPosts", "allPosts"],
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
      unlikePost: builder.mutation({
        query: (postId) => {
          return {
            url: `/posts/${postId}/like`,
            method: "DELETE",
          };
        },
      }),
      createComment: builder.mutation({
        query: ({ postId, comment }) => {
          return {
            url: `/posts/${postId}/comments`,
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
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          const userProfilePostsArgs = rootApi.util.selectCachedArgsForQuery(
            store,
            "getPostsByAuthorId",
          );
          const patchResults = [];
          const cachingPairs = [
            ...userProfilePostsArgs.map((arg) => [
              "getPostsByAuthorId",
              { userId: arg.userId },
            ]),
            ["getPosts", "allPosts"],
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
                      currentPost.comments[commentIndex] = data;
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
  useCreatePostMutation,
  useGetPostsQuery,
  useLikePostMutation,
  useUnlikePostMutation,
  useCreateCommentMutation,
  useGetPostsByAuthorIdQuery,
} = postApi;
