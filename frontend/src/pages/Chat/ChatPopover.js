import React, {
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { makeStyles } from "@material-ui/core/styles";
import toastError from "../../errors/toastError";
import Popover from "@material-ui/core/Popover";
import {
  Badge,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
} from "@material-ui/core";
import api from "../../services/api";
import { isArray } from "lodash";
import { useDate } from "../../hooks/useDate";
import { AuthContext } from "../../context/Auth/AuthContext";
import notifySound from "../../assets/chat_notify.mp3";
import useSound from "use-sound";
import { i18n } from "../../translate/i18n";
import { MessageSquareWarning } from "lucide-react";

/* ---------------------- ESTILOS MODERNOS ---------------------- */
const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    maxHeight: 340,
    maxWidth: 360,
    padding: theme.spacing(1),
    overflowY: "auto",
    borderRadius: 12,
    boxShadow:
      "0px 6px 18px rgba(0,0,0,0.1), 0px 2px 4px rgba(0,0,0,0.05)",
    ...theme.scrollbarStyles,
  },

  iconButton: {
    color: "white",
    transition: "all 0.2s ease",
    "&:hover": {
      transform: "scale(1.12)",
      color: theme.palette.secondary.light,
    },
  },

  popoverPaper: {
    borderRadius: 12,
    marginTop: 8,
    overflow: "hidden",
  },

  listItem: {
    borderRadius: 8,
    marginBottom: 6,
    border: "1px solid rgba(0,0,0,0.06)",
    transition: "0.2s ease",
    background: theme.palette.background.paper,
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
      transform: "translateX(2px)",
    },
  },

  messageText: {
    fontWeight: 500,
    fontSize: 14,
  },

  dateText: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
    display: "inline-block",
  },
}));

/* ---------------------- REDUCER ---------------------- */
const reducer = (state, action) => {
  if (action.type === "LOAD_CHATS") {
    const chats = action.payload;
    const newChats = [];

    if (isArray(chats)) {
      chats.forEach((chat) => {
        const idx = state.findIndex((u) => u.id === chat.id);
        if (idx !== -1) state[idx] = chat;
        else newChats.push(chat);
      });
    }
    return [...state, ...newChats];
  }

  if (action.type === "CHANGE_CHAT") {
    return state.map((c) =>
      c.id === action.payload.chat.id ? action.payload.chat : c
    );
  }

  if (action.type === "RESET") return [];

  return state;
};

/* ---------------------- COMPONENTE ---------------------- */
export default function ChatPopover() {
  const classes = useStyles();
  const { user, socket } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchParam] = useState("");
  const [chats, dispatch] = useReducer(reducer, []);
  const [invisible, setInvisible] = useState(true);
  const { datetimeToClient } = useDate();

  const [play] = useSound(notifySound);
  const soundAlertRef = useRef();

  /* ---------------------- NOTIFICAÇÃO DE SOM ---------------------- */
  useEffect(() => {
    soundAlertRef.current = play;
    if ("Notification" in window) Notification.requestPermission();
  }, [play]);

  /* ---------------------- RESET AO MUDAR BUSCA ---------------------- */
  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  /* ---------------------- FETCH DOS CHATS ---------------------- */
  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => fetchChats(), 350);
    return () => clearTimeout(timeout);
  }, [searchParam, pageNumber]);

  /* ---------------------- SOCKET ---------------------- */
  useEffect(() => {
    if (!user.companyId) return;

    const channel = `company-${user.companyId}-chat`;

    const handleSocket = (data) => {
      if (["new-message", "update"].includes(data.action)) {
        dispatch({ type: "CHANGE_CHAT", payload: data });

        if (data.newMessage && data.newMessage.senderId !== user.id) {
          soundAlertRef.current();
        }
      }
    };

    socket.on(channel, handleSocket);

    return () => socket.off(channel, handleSocket);
  }, [user]);

  /* ---------------------- UNREADS ---------------------- */
  useEffect(() => {
    let unread = 0;
    chats.forEach((chat) => {
      chat.users.forEach((usr) => {
        if (usr.userId === user.id) unread += usr.unreads;
      });
    });
    setInvisible(unread === 0);
  }, [chats, user.id]);

  /* ---------------------- FUNÇÕES ---------------------- */
  const fetchChats = async () => {
    try {
      const { data } = await api.get("/chats/", {
        params: { searchParam, pageNumber },
      });

      dispatch({ type: "LOAD_CHATS", payload: data.records });
      setHasMore(data.hasMore);
      setLoading(false);
    } catch (err) {
      toastError(err);
    }
  };

  const loadMore = () => setPageNumber((p) => p + 1);

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 50) loadMore();
  };

  const handleClick = (e) => {
    setAnchorEl(e.currentTarget);
    setInvisible(true);
  };

  const handleClose = () => setAnchorEl(null);

  const goToMessages = (chat) => {
    window.location.href = `/chats/${chat.uuid}`;
  };

  const open = Boolean(anchorEl);
  const id = open ? "chat-popover" : undefined;

  /* ---------------------- RENDER ---------------------- */
  return (
    <div>
      <IconButton
        aria-describedby={id}
        onClick={handleClick}
        className={classes.iconButton}
      >
        <Badge
          color="secondary"
          variant="dot"
          invisible={invisible}
          overlap="circle"
        >
          <MessageSquareWarning size={22} />
        </Badge>
      </IconButton>

      <Popover
        id={id}
        open={open}
        onClose={handleClose}
        anchorEl={anchorEl}
        classes={{ paper: classes.popoverPaper }}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Paper
          variant="outlined"
          className={classes.mainPaper}
          onScroll={handleScroll}
        >
          <List style={{ padding: 8 }}>
            {isArray(chats) &&
              chats.map((chat, index) => (
                <ListItem
                  key={index}
                  className={classes.listItem}
                  button
                  onClick={() => goToMessages(chat)}
                >
                  <ListItemText
                    primary={
                      <span className={classes.messageText}>
                        {chat.lastMessage || "(Sem mensagem)"}
                      </span>
                    }
                    secondary={
                      <Typography className={classes.dateText}>
                        {datetimeToClient(chat.updatedAt)}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}

            {isArray(chats) && chats.length === 0 && (
              <Typography style={{ padding: 16, opacity: 0.6 }}>
                {i18n.t("mainDrawer.appBar.notRegister")}
              </Typography>
            )}
          </List>
        </Paper>
      </Popover>
    </div>
  );
}
