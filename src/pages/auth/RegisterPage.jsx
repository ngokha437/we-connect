import FormField from "@components/FormField";
import TextInput from "@components/FormInput/TextInput";
import { yupResolver } from "@hookform/resolvers/yup";
import { Alert, Button } from "@mui/material";
import { openSnackbar } from "@redux/slices/snackbarSlice";
import { useRegisterMutation } from "@services/rootApi";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import * as yup from "yup";

const RegisterPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [register, { data = {}, isLoading, error, isSuccess, isError }] =
    useRegisterMutation();

  const formSchema = yup.object().shape({
    fullName: yup.string().required(),
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
  } = useForm({
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
    resolver: yupResolver(formSchema),
  });

  function onSubmit(formData) {
    register(formData);
  }

  useEffect(() => {
    if (isSuccess) {
      dispatch(
        openSnackbar({
          message: data.message,
        }),
      );
      navigate("/login");
    }
  }, [data.message, dispatch, isSuccess, navigate]);

  return (
    <div>
      <p className="mb-5 text-center text-2xl font-bold">Register</p>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <FormField
          name="fullName"
          label="Full Name"
          control={control}
          Component={TextInput}
          error={errors["fullName"]}
        />
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
          Sign up
        </Button>
        {isError && <Alert severity="error">{error?.data?.message}</Alert>}
      </form>
      <p className="mt-4">
        Already have an account? <Link to="/login">Sign in instead</Link>
      </p>
    </div>
  );
};

export default RegisterPage;
