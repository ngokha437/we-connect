import { useLogout, useUserInfo } from "@hooks";
import { useDetectLayout } from "@hooks/index";
import { Menu as MenuIcon, Search } from "@mui/icons-material";
import {
  AppBar,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Toolbar,
} from "@mui/material";
import { toggleDrawer } from "@redux/slices/settingsSlice";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import NotificationsPanel from "./NotificationsPanel";
import UserAvatar from "./UserAvatar";

const Header = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const userInfo = useUserInfo();
  const { logout } = useLogout();
  const { isMediumLayout } = useDetectLayout();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const renderMenu = (
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
      <MenuItem>
        <Link to={`/users/${userInfo._id}`} onClick={handleMenuClose}>
          Profile
        </Link>
      </MenuItem>
      <MenuItem onClick={() => logout()}>Logout</MenuItem>
    </Menu>
  );

  const handleUserProfileClick = (event) => {
    setAnchorEl(event.target);
  };

  return (
    <div>
      <AppBar color="white" position="static">
        <Toolbar className="container !min-h-fit justify-between">
          {isMediumLayout ? (
            <IconButton onClick={() => dispatch(toggleDrawer())}>
              <MenuIcon />
            </IconButton>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/">
                <img src="/weconnect-logo.png" className="h-8 w-8" />
              </Link>
              <div className="flex items-center gap-1">
                <Search />
                <TextField
                  variant="standard"
                  name="search"
                  placeholder="Search"
                  slotProps={{
                    input: {
                      className: "h-10 px-3 py-2",
                    },
                    htmlInput: {
                      className: "!p-0",
                    },
                  }}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      navigate("search/users", {
                        state: {
                          searchTerm,
                        },
                      });
                    }
                  }}
                  sx={{
                    ".MuiInputBase-root::before": {
                      display: "none",
                    },
                  }}
                />
              </div>
            </div>
          )}
          <div>
            {isMediumLayout && (
              <IconButton>
                <Search />
              </IconButton>
            )}
            <NotificationsPanel />
            <IconButton size="medium" onClick={handleUserProfileClick}>
              <UserAvatar isMyAvatar={true} />
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>
      {renderMenu}
    </div>
  );
};

export default Header;
