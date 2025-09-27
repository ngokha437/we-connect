import Dialog from "@components/Dialog";
import Loading from "@components/Loading";
import VideoCallProvider from "@context/VideoCallProvider";
import { ThemeProvider } from "@mui/material";
import { persistor, store } from "@redux/store";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";
import theme from "./configs/muiConfig";
import "./index.css";
import router from "./routers";

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <PersistGate loading={<Loading />} persistor={persistor}>
      <ThemeProvider theme={theme}>
        <VideoCallProvider>
          <RouterProvider router={router} />
          <Dialog />
        </VideoCallProvider>
      </ThemeProvider>
    </PersistGate>
  </Provider>,
);
