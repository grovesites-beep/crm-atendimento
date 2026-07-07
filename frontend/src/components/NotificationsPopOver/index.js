import React, { useState, useRef, useEffect, useContext } from "react";
import { useTheme, makeStyles } from "@material-ui/core/styles";
import { useHistory } from "react-router-dom";
import { format } from "date-fns";
import useSound from "use-sound";
import Popover from "@material-ui/core/Popover";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Badge from "@material-ui/core/Badge";
import TicketListItem from "../TicketListItem";
import useTickets from "../../hooks/useTickets";
import alertSound from "../../assets/sound.mp3";
import { AuthContext } from "../../context/Auth/AuthContext";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import useCompanySettings from "../../hooks/useSettings/companySettings";
import Favicon from "react-favicon";
import defaultLogoFavicon from "../../assets/favicon.ico";
import { TicketsContext } from "../../context/Tickets/TicketsContext";
import { MessageSquareText } from "lucide-react";

const useStyles = makeStyles((theme) => ({
  tabContainer: {
    overflowY: "auto",
    maxHeight: 350,
    ...theme.scrollbarStyles,
  },

  popoverPaper: {
    width: "100%",
    maxWidth: 350,
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(1),
    borderRadius: 12,
    paddingTop: 6,
    paddingBottom: 6,
    boxShadow:
      "0px 4px 12px rgba(0, 0, 0, 0.1), 0px 1px 4px rgba(0, 0, 0, 0.05)",
    [theme.breakpoints.down("sm")]: {
      maxWidth: 270,
    },
  },

  iconButton: {
    color: "white",
    transition: "0.2s ease",
    "&:hover": {
      color: theme.palette.secondary.light,
      transform: "scale(1.08)",
    },
  },

  listItem: {
    borderRadius: 8,
    margin: "4px 6px",
    padding: "6px 10px",
    transition: "0.2s ease",
    "&:hover": {
      background: theme.palette.action.hover,
    },
  },
}));

const NotificationsPopOver = (volume) => {
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();

  const { user, socket } = useContext(AuthContext);
  const { setCurrentTicket, setTabOpen } = useContext(TicketsContext);
  const { profile, queues } = user;
  const queueIds = queues.map((q) => q.id);

  const ticketIdUrl = +history.location.pathname.split("/")[2];
  const ticketIdRef = useRef(ticketIdUrl);

  const anchorEl = useRef();
  const [isOpen, setIsOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);

  const { get: getSetting } = useCompanySettings();
  const [showTicketWithoutQueue, setShowTicketWithoutQueue] = useState(false);
  const [showNotificationPending, setShowNotificationPending] = useState(false);
  const [showGroupNotification, setShowGroupNotification] = useState(false);

  const [, setDesktopNotifications] = useState([]);
  const { tickets } = useTickets({ withUnreadMessages: "true" });

  const [play] = useSound(alertSound, volume);
  const soundAlertRef = useRef();
  const historyRef = useRef(history);

  /* ---------------------- CONFIGURAÇÕES INICIAIS ---------------------- */
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const setting = await getSetting({ column: "showNotificationPending" });
        if (setting.showNotificationPending === true) {
          setShowNotificationPending(true);
        }
        if (user.allTicket === "enable") setShowTicketWithoutQueue(true);
        if (user.allowGroup === true) setShowGroupNotification(true);

      } catch (err) {
        toastError(err);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    soundAlertRef.current = play;
    if ("Notification" in window) Notification.requestPermission();
  }, [play]);

  useEffect(() => {
    setNotifications(tickets);
  }, [tickets]);

  useEffect(() => {
    ticketIdRef.current = ticketIdUrl;
  }, [ticketIdUrl]);

  /* ---------------------- SOCKET LISTENERS ---------------------- */
  useEffect(() => {
    const companyId = user.companyId;

    if (user.id) {
      const onConnect = () => socket.emit("joinNotification");

      const onTicketUpdate = (data) => {
        if (["updateUnread", "delete"].includes(data.action)) {
          setNotifications((prev) => prev.filter((t) => t.id !== data.ticketId));
        }
      };

      const onMessage = (data) => {
        if (
          data.action === "create" &&
          !data.message.fromMe &&
          !data.message.read &&
          (data.ticket?.userId === user?.id || !data.ticket?.userId) &&
          (user?.queues?.some((q) => q.id === data.ticket.queueId) ||
            (!data.ticket.queueId && showTicketWithoutQueue)) &&
          (!["pending", "lgpd", "nps", "group"].includes(data.ticket?.status) ||
            (data.ticket?.status === "pending" && showNotificationPending) ||
            (data.ticket?.status === "group" &&
              data.ticket?.whatsapp?.groupAsTicket === "enabled" &&
              showGroupNotification))
        ) {
          setNotifications((prev) => {
            const exists = prev.findIndex((t) => t.id === data.ticket.id);
            if (exists !== -1) {
              prev[exists] = data.ticket;
              return [...prev];
            }
            return [data.ticket, ...prev];
          });

          const shouldIgnore =
            (data.message.ticketId === ticketIdRef.current &&
              document.visibilityState === "visible") ||
            (data.ticket.userId && data.ticket.userId !== user?.id) ||
            (data.ticket.isGroup &&
              data.ticket?.whatsapp?.groupAsTicket === "disabled" &&
              !showGroupNotification);

          if (!shouldIgnore) handleNotifications(data);
        }
      };

      socket.on("connect", onConnect);
      socket.on(`company-${companyId}-ticket`, onTicketUpdate);
      socket.on(`company-${companyId}-appMessage`, onMessage);

      return () => {
        socket.off("connect", onConnect);
        socket.off(`company-${companyId}-ticket`, onTicketUpdate);
        socket.off(`company-${companyId}-appMessage`, onMessage);
      };
    }
  }, [user, queues, showTicketWithoutQueue, showNotificationPending, showGroupNotification]);

  /* ---------------------- DESKTOP NOTIFICATIONS ---------------------- */
  const handleNotifications = (data) => {
    const { message, contact, ticket } = data;

    const notification = new Notification(
      `${i18n.t("tickets.notification.message")} ${contact.name}`,
      {
        body: `${message.body} - ${format(new Date(), "HH:mm")}`,
        icon: contact.urlPicture,
        tag: ticket.id,
        renotify: true,
      }
    );

    notification.onclick = (e) => {
      e.preventDefault();
      window.focus();
      setTabOpen(ticket.status);
      historyRef.current.push(`/tickets/${ticket.uuid}`);
    };

    soundAlertRef.current();
  };

  /* ---------------------- UI HANDLERS ---------------------- */
  const handleClick = () => setIsOpen((p) => !p);
  const handleClickAway = () => setIsOpen(false);

  const browserNotification = () => {
    const numbers = "⓿➊➋➌➍➎➏➐➑➒➓⓫⓬⓭⓮⓯⓰⓱⓲⓳⓴";
    if (notifications.length > 0) {
      if (notifications.length < 21) {
        document.title =
          numbers.substring(notifications.length, notifications.length + 1) +
          " - " +
          (theme.appName || "...");
      } else {
        document.title =
          "(" + notifications.length + ")" + (theme.appName || "...");
      }
    } else {
      document.title = theme.appName || "...";
    }

    return (
      <Favicon
        animated
        url={theme?.appLogoFavicon || defaultLogoFavicon}
        alertCount={notifications.length}
        iconSize={195}
      />
    );
  };

  /* ---------------------- RENDER ---------------------- */
  return (
    <>
      {browserNotification()}

      <IconButton
        onClick={handleClick}
        ref={anchorEl}
        aria-label="Open Notifications"
        className={classes.iconButton}
      >
        <Badge
          overlap="rectangular"
          badgeContent={notifications.length}
          color="secondary"
        >
          <MessageSquareText size={22} />
        </Badge>
      </IconButton>

      <Popover
        disableScrollLock
        open={isOpen}
        anchorEl={anchorEl.current}
        onClose={handleClickAway}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        classes={{ paper: classes.popoverPaper }}
      >
        <List dense className={classes.tabContainer}>
          {notifications.length === 0 ? (
            <ListItem>
              <ListItemText>{i18n.t("notifications.noTickets")}</ListItemText>
            </ListItem>
          ) : (
            notifications.map((ticket) => (
              <div onClick={handleClickAway} key={ticket.id}>
                <ListItem className={classes.listItem}>
                  <TicketListItem ticket={ticket} />
                </ListItem>
              </div>
            ))
          )}
        </List>
      </Popover>
    </>
  );
};

export default NotificationsPopOver;
