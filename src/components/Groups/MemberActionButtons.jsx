import { MoreVert, Person, PersonRemove } from "@mui/icons-material";
import {
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import { openDialog } from "@redux/slices/dialogSlice";
import { openSnackbar } from "@redux/slices/snackbarSlice";
import {
  useRemoveMemberMutation,
  useUpdateMemberMutation,
} from "@services/groupApi";
import { useState } from "react";
import { useDispatch } from "react-redux";

const ROLES = {
  Member: {
    value: "Member",
    label: "Member",
    level: 1,
    color: "text-gray-600",
  },
  Moderator: {
    value: "Moderator",
    label: "Moderator",
    level: 2,
    color: "text-green-600",
  },
  Admin: { value: "Admin", label: "Admin", level: 3, color: "text-blue-600" },
  Owner: { value: "Owner", label: "Owner", level: 4, color: "text-purple-600" },
};

const MemberActionButtons = ({
  groupId,
  targetUserId,
  currentUserRole,
  targetUserRole,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [roleMenuEl, setRoleMenuEl] = useState(null);
  const dispatch = useDispatch();

  const [updateMemberRole, { isLoading: isUpdatingRole }] =
    useUpdateMemberMutation();

  const [removeMember] = useRemoveMemberMutation();

  const handleMenuClick = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setRoleMenuEl(null);
  };

  const canChangeRole = () => {
    if (currentUserRole === "Owner") {
      return targetUserRole !== "Owner";
    }

    if (currentUserRole === "Admin") {
      return ["Member", "Moderator"].includes(targetUserRole);
    }

    return false;
  };

  const canRemoveMember = () => {
    if (currentUserRole === "Owner") {
      return targetUserRole !== "Owner";
    }

    return false;
  };

  if (!canRemoveMember() && !canChangeRole()) {
    return null;
  }

  const getAvailableRoles = () => {
    if (currentUserRole === "Owner") {
      return Object.values(ROLES).filter((r) => r.value !== "Owner");
    }

    if (currentUserRole === "Admin") {
      return Object.values(ROLES).filter((r) =>
        ["Member", "Moderator"].includes(r.value),
      );
    }

    return [];
  };

  const handleRoleMenuOpen = (e) => {
    e.stopPropagation();
    setRoleMenuEl(e.currentTarget);
  };

  const handleRoleChange = async (newRole) => {
    try {
      await updateMemberRole({ groupId, userId: targetUserId, role: newRole });
      dispatch(
        openSnackbar({
          message: "User role updated successfully!",
        }),
      );
    } catch (error) {
      dispatch(
        openSnackbar({
          type: "error",
          message: error?.data?.message || "Failed to update role",
        }),
      );
    }
  };

  const handleRemoveMember = () => {
    dispatch(
      openDialog({
        title: "Remove Member",
        contentType: "CONFIRM_DIALOG",
        additionalData: {
          message: `Are you sure you want to remove this user from group?`,
          onConfirm: async () => {
            try {
              await removeMember({ groupId, userId: targetUserId });
              dispatch(
                openSnackbar({
                  message: "User has been removed from the group",
                }),
              );
            } catch (error) {
              dispatch(
                openSnackbar({
                  type: "error",
                  message: error?.data?.message || "Failed to remove member",
                }),
              );
            }
          },
        },
      }),
    );
  };

  return (
    <div>
      <IconButton size="small" onClick={handleMenuClick}>
        <MoreVert fontSize="small" />
      </IconButton>

      <Menu
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={handleMenuClose}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        {canChangeRole() && (
          <MenuItem onClick={handleRoleMenuOpen}>
            <ListItemIcon>
              <Person fontSize="small" />
            </ListItemIcon>
            <ListItemText>Change Role</ListItemText>
          </MenuItem>
        )}
        {canRemoveMember() && (
          <MenuItem onClick={handleRemoveMember}>
            <ListItemIcon>
              <PersonRemove fontSize="small" sx={{ color: "error.main" }} />
            </ListItemIcon>
            <ListItemText>Remove from group</ListItemText>
          </MenuItem>
        )}
      </Menu>

      <Menu
        anchorEl={roleMenuEl}
        open={Boolean(roleMenuEl)}
        onClose={() => setRoleMenuEl(null)}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <MenuItem>
          <Typography>Current: {targetUserRole}</Typography>
        </MenuItem>
        {getAvailableRoles()
          .filter((role) => role.value !== targetUserRole)
          .map((role) => (
            <MenuItem
              key={role.value}
              onClick={() => handleRoleChange(role.value)}
            >
              <ListItemText>
                <p className={role.color}>{role.label}</p>
              </ListItemText>
            </MenuItem>
          ))}
      </Menu>
    </div>
  );
};

export default MemberActionButtons;
