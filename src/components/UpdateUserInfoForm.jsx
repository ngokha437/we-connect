import { yupResolver } from "@hookform/resolvers/yup";
import { useUserInfo } from "@hooks/index";
import { openSnackbar } from "@redux/slices/snackbarSlice";
import { useUpdateUserProfileMutation } from "@services/userApi";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import * as yup from "yup";
import Button from "./Button";
import FormField from "./FormField";
import TextAreaInput from "./FormInput/TextAreaInput";
import TextInput from "./FormInput/TextInput";

const UpdateUserInfoForm = () => {
  const [updateUserProfile, { isLoading }] = useUpdateUserProfileMutation();
  const { about, fullName } = useUserInfo();
  const dispatch = useDispatch();

  const formSchema = yup.object().shape({
    about: yup.string(),
    fullName: yup.string().required(),
  });

  const {
    control,
    reset,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm({
    resolver: yupResolver(formSchema),
    defaultValues: {
      about,
      fullName,
    },
  });

  async function onSubmit(formValues) {
    try {
      await updateUserProfile(formValues).unwrap();
      reset(formValues);
      dispatch(openSnackbar({ message: "Update User Profile successfully" }));
    } catch (error) {
      dispatch(openSnackbar({ type: "error", message: error?.data?.message }));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-4">
        <FormField
          name="fullName"
          label="Fullname"
          control={control}
          Component={TextInput}
          error={errors["fullName"]}
        />
        <FormField
          name="about"
          label="About"
          control={control}
          type="textarea"
          Component={TextAreaInput}
          error={errors["about"]}
        />
      </div>
      <Button
        variant="contained"
        isLoading={isLoading}
        inputProps={{ disabled: !isDirty, type: "submit" }}
        className="!mt-4"
      >
        Save changes
      </Button>
    </form>
  );
};

export default UpdateUserInfoForm;
