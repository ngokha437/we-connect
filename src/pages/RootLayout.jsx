import { Suspense } from "react";
import { Outlet } from "react-router-dom";
// Supports weights 100-900
import Dialog from "@components/Dialog";
import Loading from "@components/Loading";
import "@fontsource-variable/public-sans";
import { Alert, Snackbar } from "@mui/material";
import { closeSnackbar } from "@redux/slices/snackbarSlice";
import { useDispatch, useSelector } from "react-redux";

const RootLayout = () => {
  const dispatch = useDispatch();
  const { open, type, message } = useSelector((state) => {
    return state.snackbar;
  });

  return (
    <div className="text-dark-100">
      <Suspense fallback={<Loading />}>
        <Outlet />
      </Suspense>
      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={() => dispatch(closeSnackbar())}
      >
        <Alert
          // onClose={handleClose}
          severity={type}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {message}
        </Alert>
      </Snackbar>
      <Dialog />
    </div>
  );
};
export default RootLayout;
