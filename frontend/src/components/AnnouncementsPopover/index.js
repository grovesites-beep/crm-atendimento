import React, { useEffect, useReducer, useState, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import toastError from "../../errors/toastError";
import Popover from "@material-ui/core/Popover";
import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import {
  Avatar,
  Badge,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Dialog,
  Paper,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@material-ui/core";
import api from "../../services/api";
import { isArray } from "lodash";
import moment from "moment";
import { Megaphone } from "lucide-react";

// Modern link parser
const LinkText = ({ text = "", variant = "body2" }) => {
  const Typography = require("@material-ui/core/Typography").default;

  const urlRegex = /((https?:\/\/|www\.)[^\s)]+|mailto:[^\s)]+)/gi;

  const PRIMARY = "#007bff";
  const parts = [];
  let last = 0,
    m;
  while ((m = urlRegex.exec(text)) !== null) {
    const [raw] = m,
      start = m.index;
    if (start > last) parts.push(text.slice(last, start));
    const href = raw.startsWith("www.") ? `https://${raw}` : raw;
    parts.push(
      <a
        key={`${start}-${href}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer nofollow"
        style={{
          color: PRIMARY,
          fontWeight: 500,
          textDecoration: "underline",
          wordBreak: "break-word",
        }}
      >
        {raw}
      </a>
    );
    last = start + raw.length;
  }
  if (last < text.length) parts.push(text.slice(last));

  return (
    <Typography variant={variant} style={{ whiteSpace: "pre-line", opacity: 0.9 }}>
      {parts}
    </Typography>
  );
};

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    maxHeight: 350,
    maxWidth: 420,
    padding: theme.spacing(1),
    overflowY: "auto",
    borderRadius: 12,
    boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
    ...theme.scrollbarStyles,
  },
  listItem: {
    background: "#fafafa",
    marginBottom: 8,
    borderRadius: 10,
    border: "1px solid #eee",
    transition: "0.25s ease",
    "&:hover": {
      transform: "translateY(-3px)",
      boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
      background: "#fff",
    },
  },
}));

function AnnouncementDialog({ announcement, open, handleClose }) {
  return (
    <Dialog open={open} onClose={() => handleClose()} maxWidth="sm" fullWidth>
      <DialogTitle style={{ fontWeight: "bold", fontSize: 20 }}>
        {announcement.title}
      </DialogTitle>

      <DialogContent>
        {announcement.mediaPath && (
          <div
            style={{
              borderRadius: 12,
              overflow: "hidden",
              marginBottom: 20,
              border: "1px solid #f1f1f1",
            }}
          >
            <img
              alt="announcement"
              src={announcement.mediaPath}
              style={{ width: "100%", height: 300, objectFit: "cover" }}
            />
          </div>
        )}

        <LinkText text={announcement.text || ""} variant="body1" />
      </DialogContent>

      <DialogActions>
        <Button onClick={() => handleClose()} color="primary" autoFocus>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const reducer = (state, action) => {
  if (action.type === "LOAD_ANNOUNCEMENTS") {
    const announcements = action.payload;
    const newState = [...state];

    if (isArray(announcements)) {
      announcements.forEach((a) => {
        const index = newState.findIndex((u) => u.id === a.id);
        if (index !== -1) newState[index] = a;
        else newState.push(a);
      });
    }
    return newState;
  }

  if (action.type === "UPDATE_ANNOUNCEMENTS") {
    const a = action.payload;
    const index = state.findIndex((u) => u.id === a.id);
    if (index !== -1) {
      const updated = [...state];
      updated[index] = a;
      return updated;
    }
    return [a, ...state];
  }

  if (action.type === "DELETE_ANNOUNCEMENT") {
    return state.filter((u) => u.id !== action.payload);
  }

  if (action.type === "RESET") return [];
};

export default function AnnouncementsPopover() {
  const classes = useStyles();

  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchParam] = useState("");
  const [announcements, dispatch] = useReducer(reducer, []);
  const [invisible, setInvisible] = useState(false);
  const [announcement, setAnnouncement] = useState({});
  const [showAnnouncementDialog, setShowAnnouncementDialog] = useState(false);

  const { user, socket } = useContext(AuthContext);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delay = setTimeout(() => fetchAnnouncements(), 500);
    return () => clearTimeout(delay);
  }, [searchParam, pageNumber]);

  useEffect(() => {
    if (!user.companyId) return;

    const onCompanyAnnouncement = (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_ANNOUNCEMENTS", payload: data.record });
        setInvisible(false);
      }
      if (data.action === "delete") {
        dispatch({ type: "DELETE_ANNOUNCEMENT", payload: +data.id });
      }
    };

    socket.on(`company-announcement`, onCompanyAnnouncement);
    return () => socket.off(`company-announcement`, onCompanyAnnouncement);
  }, [user]);

  const fetchAnnouncements = async () => {
    try {
      const { data } = await api.get("/announcements/", {
        params: { searchParam, pageNumber },
      });
      dispatch({ type: "LOAD_ANNOUNCEMENTS", payload: data.records });
      setHasMore(data.hasMore);
      setLoading(false);
    } catch (err) {
      toastError(err);
    }
  };

  const loadMore = () => setPageNumber((prev) => prev + 1);

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) loadMore();
  };

  const handleClick = (e) => {
    setAnchorEl(e.currentTarget);
    setInvisible(true);
  };

  const handleClose = () => setAnchorEl(null);

  const borderPriority = (priority) => {
    if (priority === 1) return "4px solid #e53935";
    if (priority === 2) return "4px solid #fb8c00";
    return "4px solid #9e9e9e";
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <div>
      <AnnouncementDialog
        announcement={announcement}
        open={showAnnouncementDialog}
        handleClose={() => setShowAnnouncementDialog(false)}
      />

      <IconButton aria-describedby={id} onClick={handleClick} style={{ color: "white" }}>
        <Badge color="error" variant="dot" invisible={invisible || announcements.length < 1}>
          <Megaphone size={22} />
        </Badge>
      </IconButton>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
        PaperProps={{ style: { borderRadius: 14 } }}
      >
        <Paper variant="outlined" onScroll={handleScroll} className={classes.mainPaper}>
          <List style={{ minWidth: 300 }}>
            {announcements.map((item, key) => (
              <ListItem
                key={key}
                className={classes.listItem}
                style={{ borderLeft: borderPriority(item.priority) }}
                onClick={() => {
                  setAnnouncement(item);
                  setShowAnnouncementDialog(true);
                  setAnchorEl(null);
                }}
              >
                {item.mediaPath && (
                  <ListItemAvatar>
                    <Avatar src={item.mediaPath} />
                  </ListItemAvatar>
                )}

                <ListItemText
                  primary={
                    <Typography style={{ fontWeight: 600, fontSize: 15 }}>
                      {item.title}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography style={{ fontSize: 12, opacity: 0.7 }}>
                        {moment(item.createdAt).format("DD/MM/YYYY")}
                      </Typography>
                      <LinkText text={item.text || ""} />
                    </>
                  }
                />
              </ListItem>
            ))}

            {announcements.length === 0 && (
              <ListItemText primary={i18n.t("mainDrawer.appBar.notRegister")} />
            )}
          </List>
        </Paper>
      </Popover>
    </div>
  );
}
