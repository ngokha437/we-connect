import Button from "@components/Button";
import { useUserInfo } from "@hooks/index";
import { GroupAddOutlined } from "@mui/icons-material";
import { Chip, Stack } from "@mui/material";
import { openDialog } from "@redux/slices/dialogSlice";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useDispatch } from "react-redux";

export const ImageUploader = ({ image, setImage }) => {
  const onDrop = useCallback((acceptedFiles) => {
    setImage(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    maxFiles: 1,
    accept: ".jpg,.jpeg,.png",
  });

  return (
    <div>
      <div
        {...getRootProps({
          className:
            "border rounded py-4 px-6 text-center bg-slate-100 cursor-pointer h-20 flex items-center justify-center",
        })}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <p>Drag 'n' drop some files here, or click to select files</p>
        )}
      </div>
      {image?.name && (
        <Stack className="mt-2">
          <Chip
            label={image.name}
            onDelete={() => setImage(null)}
            className="font-bold"
          />
        </Stack>
      )}
    </div>
  );
};

const GroupCreation = () => {
  const userInfo = useUserInfo();
  const dispatch = useDispatch();

  return (
    <Button
      variant="contained"
      icon={<GroupAddOutlined fontSize="14px" />}
      onClick={() =>
        dispatch(
          openDialog({
            title: "Create Group",
            contentType: "NEW_GROUP_DIALOG",
            additionalData: userInfo,
          }),
        )
      }
    >
      Create New Group
    </Button>
  );
};

export default GroupCreation;
