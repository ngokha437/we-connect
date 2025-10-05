import FormField from "@components/FormField";
import TextInput from "@components/FormInput/TextInput";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Button,
  CircularProgress,
  DialogActions,
  DialogContent,
  TextareaAutosize,
} from "@mui/material";
import { closeDialog } from "@redux/slices/dialogSlice";
import { openSnackbar } from "@redux/slices/snackbarSlice";
import { useCreateGroupMutation } from "@services/groupApi";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";

const Textarea = (props) => {
  return (
    <TextareaAutosize
      minRows={3}
      className="w-full rounded border border-gray-400 p-2"
      {...props}
    />
  );
};

const NewGroupDialog = () => {
  const [createGroup, { isLoading }] = useCreateGroupMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const formSchema = yup.object().shape({
    name: yup.string().max(100, "Max length is 100 characters").required(),
    description: yup.string().required(),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
    },
    resolver: yupResolver(formSchema),
  });

  const onSubmit = async (formData) => {
    const response =await createGroup(formData);

    dispatch(closeDialog());
    dispatch(openSnackbar({ message: "Create Group Successfully!" }));
    navigate(`/groups/${response?.data._id}`)
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent className="flex flex-col gap-4">
          <FormField
            name="name"
            label="Group Name"
            control={control}
            Component={TextInput}
            error={errors["name"]}
          />
          <FormField
            name="description"
            label="Group Description"
            control={control}
            Component={Textarea}
            error={errors["description"]}
          />
          {/* <ImageUploader image={image} setImage={setImage} /> */}
        </DialogContent>
        <DialogActions className="!px-6 !pt-0 !pb-5">
          <Button
            fullWidth
            // disabled={!isValid}
            variant="contained"
            type="submit"
          >
            {isLoading && <CircularProgress size={20} className="mr-4" />}
            Create Group
          </Button>
        </DialogActions>
      </form>
    </div>
  );
};

export default NewGroupDialog;
