import FormField from "@components/FormField";
import TextInput from "@components/FormInput/TextInput";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button, CircularProgress } from "@mui/material";
import { openSnackbar } from "@redux/slices/snackbarSlice";
import { useLoginMutation } from "@services/rootApi";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import * as yup from "yup";

const LoginPage = () => {
  const [login, { data = {}, isLoading, error, isSuccess, isError }] =
    useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const formSchema = yup.object().shape({
    email: yup
      .string()
      .matches(
        /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
        "Email is not valid",
      )
      .required(),
    password: yup.string().required(),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: yupResolver(formSchema),
  });

  function onSubmit(formData) {
    login(formData);
  }

  useEffect(() => {
    if (isError) {
      dispatch(openSnackbar({ type: "error", message: error?.data?.message }));
    }
    if (isSuccess) {
      dispatch(openSnackbar({ message: data?.message }));
      navigate("/verify-otp", {
        state: {
          email: getValues("email"),
        },
      });
    }
  }, [isError, error, dispatch, navigate, data.message, isSuccess, getValues]);

  return (
    <div>
      <p className="mb-5 text-center text-2xl font-bold">Login</p>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <FormField
          name="email"
          label="Email"
          control={control}
          Component={TextInput}
          error={errors["email"]}
        />
        <FormField
          name="password"
          label="Password"
          control={control}
          type="password"
          Component={TextInput}
          error={errors["password"]}
        />
        <Button variant="contained" type="submit">
          {isLoading && <CircularProgress size={20} className="mr-4" />}
          Sign in
        </Button>
      </form>
      <p className="mt-4">
        New on our platform? <Link to="/register">Create an account</Link>
      </p>
    </div>
  );
};

export default LoginPage;
