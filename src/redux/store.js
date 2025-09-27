import authReducer from "@redux/slices/authSlice";
import dialogReducer from "@redux/slices/dialogSlice";
import settingsReducer from "@redux/slices/settingsSlice";
import snackbarReducer from "@redux/slices/snackbarSlice";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { rootApi } from "@services/rootApi";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
} from "redux-persist";
import persistReducer from "redux-persist/es/persistReducer";
import persistStore from "redux-persist/es/persistStore";
import storage from "redux-persist/lib/storage";
import { logoutMiddleware } from "./middleware";

const persistConfig = {
  key: "root",
  version: 1,
  storage,
  blacklist: [
    rootApi.reducerPath,
    "dialog",
    "settings",
    // dialogReducer.reducerPath,
    // settingsReducer.reducerPath,
  ],
};

const persistedReducer = persistReducer(
  persistConfig,
  combineReducers({
    auth: authReducer,
    snackbar: snackbarReducer,
    settings: settingsReducer,
    dialog: dialogReducer,
    [rootApi.reducerPath]: rootApi.reducer,
  }),
);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware({
      serializableCheck: {
        ignoreActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(logoutMiddleware, rootApi.middleware);
  },
});

setupListeners(store.dispatch);

export const persistor = persistStore(store);
