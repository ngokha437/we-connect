import { ImageUploader } from "@components/PostCreation";
import UserAvatar from "@components/UserAvatar";
import {
  Button,
  CircularProgress,
  DialogActions,
  DialogContent,
  TextareaAutosize,
} from "@mui/material";
import { closeDialog } from "@redux/slices/dialogSlice";
import { openSnackbar } from "@redux/slices/snackbarSlice";
import { useCreateGroupPostMutation } from "@services/groupPostApi";
import { useState } from "react";
import { useDispatch } from "react-redux";

const NewGroupPostDialog = ({ userInfo, groupId }) => {
  const [image, setImage] = useState(null);
  const [createNewPost, { isLoading }] = useCreateGroupPostMutation();

  const dispatch = useDispatch();

  const [content, setContent] = useState("");

  const handleCreateNewPost = async () => {
    try {
      const formData = new FormData();
      formData.append("content", content);
      formData.append("image", image);

      await createNewPost({ groupId, formData }).unwrap();
      dispatch(closeDialog());
      dispatch(openSnackbar({ message: "Create Post Successfully!" }));
    } catch (error) {
      dispatch(openSnackbar({ type: "error", message: error?.data?.message }));
    }
  };

  const isValid = !!(content || image);

  return (
    <div>
      <DialogContent>
        <div className="flex items-center gap-2">
          <UserAvatar isMyAvatar={true} className="!h-8 !w-8" />
          <p className="font-bold">{userInfo.fullName}</p>
        </div>
        <TextareaAutosize
          minRows={3}
          placeholder="What's on your mind?"
          className="mt-4 w-full p-2"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <ImageUploader image={image} setImage={setImage} />
      </DialogContent>
      <DialogActions className="!px-6 !pt-0 !pb-5">
        <Button
          fullWidth
          disabled={!isValid}
          variant="contained"
          onClick={handleCreateNewPost}
        >
          {isLoading && <CircularProgress size={20} className="mr-4" />}
          Post
        </Button>
      </DialogActions>
    </div>
  );
};

export default NewGroupPostDialog;
