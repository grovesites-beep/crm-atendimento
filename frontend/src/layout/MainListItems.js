import React, { useContext, useEffect, useReducer, useState } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import useHelps from "../hooks/useHelps";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import Divider from "@material-ui/core/Divider";
import Avatar from "@material-ui/core/Avatar";
import Badge from "@material-ui/core/Badge";
import Collapse from "@material-ui/core/Collapse";
import List from "@material-ui/core/List";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import Chip from "@material-ui/core/Chip";
import {
  BookOpenText,
  Zap,
  ArrowUp,
  ArrowDown,
  Wallet,
  SquareKanban,
  MessageCircle,
  AppWindow,
  LayoutDashboard,
  Users,
  CalendarClock,
  Tags,
  UserCog,
  Megaphone,
  ClipboardList,
  FileUser,
  CalendarCog,
  Network,
  Share2,
  GitFork,
  MessageCircleWarning,
  DatabaseZap,
  UserPen,
  GitGraph,
  Brain,
  Plug,
  FolderOpen,
  Signal,
  MessageCircleCode,
  EarthLock,
  Settings,
  Phone,
  MessageCircleReply
} from 'lucide-react';
import { WhatsAppsContext } from "../context/WhatsApp/WhatsAppsContext";
import { AuthContext } from "../context/Auth/AuthContext";
import { useActiveMenu } from "../context/ActiveMenuContext";
import { Can } from "../components/Can";
import { isArray } from "lodash";
import api from "../services/api";
import toastError from "../errors/toastError";
import usePlans from "../hooks/usePlans";
import useVersion from "../hooks/useVersion";
import { i18n } from "../translate/i18n";

const iconStyles = {
  dashboard: { color: "#6366f1", gradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" },
  tickets: { color: "#10b981", gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)" },
  messages: { color: "#f59e0b", gradient: "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)" },
  kanban: { color: "#8b5cf6", gradient: "linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)" },
  contacts: { color: "#06b6d4", gradient: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)" },
  schedules: { color: "#ec4899", gradient: "linear-gradient(135deg, #ec4899 0%, #be185d 100%)" },
  tags: { color: "#14b8a6", gradient: "linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)" },
  variables: { color: "#8b5cf6", gradient: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)" },
  chats: { color: "#f97316", gradient: "linear-gradient(135deg, #f97316 0%, #050302ff 100%)" },
  helps: { color: "#3b82f6", gradient: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" },
  campaigns: { color: "#ef4444", gradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)" },
  flowbuilder: { color: "#84cc16", gradient: "linear-gradient(135deg, #84cc16 0%, #65a30d 100%)" },
  announcements: { color: "#f59e0b", gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" },
  api: { color: "#06b6d4", gradient: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)" },
  users: { color: "#8b5cf6", gradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)" },
  queues: { color: "#10b981", gradient: "linear-gradient(135deg, #10b981 0%, #047857 100%)" },
  prompts: { color: "#ec4899", gradient: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)" },
  integrations: { color: "#f97316", gradient: "linear-gradient(135deg, #f97316 0%, #c2410c 100%)" },
  connections: { color: "#64748b", gradient: "linear-gradient(135deg, #64748b 0%, #475569 100%)" },
  files: { color: "#14b8a6", gradient: "linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)" },
  financial: { color: "#10b981", gradient: "linear-gradient(135deg, #10b981 0%, #065f46 100%)" },
  settings: { color: "#e7361fff", gradient: "linear-gradient(135deg, #e94117ff 0%, #4f46e5 100%)" },
  companies: { color: "#3b82f6", gradient: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)" },
  globalConfig: { color: "#a647f4ff", gradient: "linear-gradient(135deg, #8344d4ff 0%, #4842c1ff 100%)" },
  default: { color: "#6366f1", gradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" }
};

const useStyles = makeStyles((theme) => ({
  listItem: {
    height: "44px",
    width: "auto",
    "&:hover $iconHoverActive": {
      backgroundColor: theme.palette.action.hover,
    },
  },

  sectionTitle: {
    position: "sticky",
    top: 0,
    zIndex: 10,
    padding: "12px 16px",
    background: "#fff",
    fontSize: "0.75rem",
    fontWeight: 700,
    textTransform: "uppercase",
    color: "rgba(0,0,0,0.6)",
    letterSpacing: "0.5px",
  },

  listItemText: {
    fontSize: "14px",
    color: theme.mode === "light" ? "#666" : "#FFF",
  },
  avatarActive: {
    backgroundColor: "transparent",
  },
  avatarHover: {
    backgroundColor: "transparent",
  },
  iconHoverActive: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "50%",
    height: 36,
    width: 36,
    backgroundColor: "transparent",
    transition: "all 0.3s",
    "&:hover, &.active": {
      backgroundColor:
        theme.mode === "light"
          ? "rgba(0, 0, 0, 0.04)"
          : "rgba(255, 255, 255, 0.08)",
    },
    "& .MuiSvgIcon-root": {
      fontSize: "1.6rem",
      // Ícones mais nítidos no modo claro (sem blur),
      // mantendo o leve glow só no modo escuro
      filter:
        theme.mode === "dark"
          ? "drop-shadow(0 0 1px rgba(0,0,0,0.25))"
          : "none",
    },
  },
  versionChip: {
    background: iconStyles.dashboard.gradient,
    color: "white",
    fontWeight: 600,
    fontSize: "0.75rem",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: theme.palette.primary.main,
      transform: "scale(1.05)",
    },
  },
  listSubheader: {
    transition: "opacity 0.2s ease",
    whiteSpace: "nowrap",
    overflow: "hidden",
  }
}));

function ListItemLink(props) {
  const { icon, primary, to, tooltip, showBadge, iconKey, small } = props;
  const classes = useStyles();
  const { activeMenu } = useActiveMenu();
  const location = useLocation();
  const isActive = activeMenu === to || location.pathname === to;

  const renderLink = React.useMemo(
    () =>
      React.forwardRef((itemProps, ref) => (
        <RouterLink to={to} ref={ref} {...itemProps} />
      )),
    [to]
  );

  const iconStyle = iconStyles[iconKey] || iconStyles.default;

  const ConditionalTooltip = ({ children, tooltipEnabled }) =>
    tooltipEnabled ? (
      <Tooltip
        placement="right"
        arrow
        title={
          <Typography style={{ fontWeight: 700, fontSize: "0.9rem" }}>
            {primary}
          </Typography>
        }
      >
        {children}
      </Tooltip>
    ) : (
      children
    );

  return (
    <ConditionalTooltip tooltipEnabled={!!tooltip}>
      <li>
        <ListItem
          button
          component={renderLink}
          className={classes.listItem}
          style={small ? { paddingLeft: "32px" } : {}}
        >
          {icon ? (
            <ListItemIcon>
              {showBadge ? (
                <Badge
                  badgeContent="!"
                  color="error"
                  overlap="circular"
                  className={classes.badge}
                >
                  <Avatar
                    className={`${classes.iconHoverActive} ${isActive ? "active" : ""
                      }`}
                    style={{ color: iconStyle.color }}
                  >
                    {icon}
                  </Avatar>
                </Badge>
              ) : (
                <Avatar
                  className={`${classes.iconHoverActive} ${isActive ? "active" : ""
                    }`}
                  style={{ color: iconStyle.color }}
                >
                  {icon}
                </Avatar>
              )}
            </ListItemIcon>
          ) : null}
          <ListItemText
            primary={
              <Typography className={classes.listItemText}>
                {primary}
              </Typography>
            }
          />
        </ListItem>
      </li>
    </ConditionalTooltip>
  );
}

const reducer = (state, action) => {
  if (action.type === "LOAD_CHATS") {
    const chats = action.payload;
    const newChats = [];

    if (isArray(chats)) {
      chats.forEach((chat) => {
        const chatIndex = state.findIndex((u) => u.id === chat.id);
        if (chatIndex !== -1) {
          state[chatIndex] = chat;
        } else {
          newChats.push(chat);
        }
      });
    }

    return [...state, ...newChats];
  }

  if (action.type === "UPDATE_CHATS") {
    const chat = action.payload;
    const chatIndex = state.findIndex((u) => u.id === chat.id);

    if (chatIndex !== -1) {
      state[chatIndex] = chat;
      return [...state];
    } else {
      return [chat, ...state];
    }
  }

  if (action.type === "DELETE_CHAT") {
    const chatId = action.payload;

    const chatIndex = state.findIndex((u) => u.id === chatId);
    if (chatIndex !== -1) {
      state.splice(chatIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }

  if (action.type === "CHANGE_CHAT") {
    const changedChats = state.map((chat) => {
      if (chat.id === action.payload.chat.id) {
        return action.payload.chat;
      }
      return chat;
    });
    return changedChats;
  }
};

const MainListItems = ({ collapsed, drawerClose }) => {
  const theme = useTheme();
  const classes = useStyles();
  const { whatsApps } = useContext(WhatsAppsContext);
  const { user, socket } = useContext(AuthContext);
  const { setActiveMenu } = useActiveMenu();
  const location = useLocation();

  const [connectionWarning, setConnectionWarning] = useState(false);
  const [openCampaignSubmenu, setOpenCampaignSubmenu] = useState(false);
  const [openFlowSubmenu, setOpenFlowSubmenu] = useState(false);
  const [openDashboardSubmenu, setOpenDashboardSubmenu] = useState(false);
  const [showCampaigns, setShowCampaigns] = useState(false);
  const [showKanban, setShowKanban] = useState(false);
  const [showOpenAi, setShowOpenAi] = useState(false);
  const [showIntegrations, setShowIntegrations] = useState(false);

  const [showSchedules, setShowSchedules] = useState(false);
  const [showInternalChat, setShowInternalChat] = useState(false);
  const [showExternalApi, setShowExternalApi] = useState(false);

  const [invisible, setInvisible] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam] = useState("");
  const [chats, dispatch] = useReducer(reducer, []);
  const [version, setVersion] = useState(false);
  const [managementHover, setManagementHover] = useState(false);
  const [campaignHover, setCampaignHover] = useState(false);
  const [flowHover, setFlowHover] = useState(false);
  const { list } = useHelps();
  const [hasHelps, setHasHelps] = useState(false);

  useEffect(() => {
    async function checkHelps() {
      const helps = await list();
      setHasHelps(helps.length > 0);
    }
    checkHelps();
  }, []);

  const isManagementActive =
    location.pathname === "/" ||
    location.pathname.startsWith("/reports") ||
    location.pathname.startsWith("/moments");

  const isCampaignRouteActive =
    location.pathname === "/campaigns" ||
    location.pathname.startsWith("/contact-lists") ||
    location.pathname.startsWith("/campaigns-config");

  const isFlowbuilderRouteActive =
    location.pathname.startsWith("/phrase-lists") ||
    location.pathname.startsWith("/flowbuilders");

  useEffect(() => {
    if (location.pathname.startsWith("/tickets")) {
      setActiveMenu("/tickets");
    } else {
      setActiveMenu("");
    }
  }, [location, setActiveMenu]);

  const { getPlanCompany } = usePlans();

  const { getVersion } = useVersion();

  useEffect(() => {
    async function fetchVersion() {
      const _version = await getVersion();
      setVersion(_version.version);
    }
    fetchVersion();
  }, []);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    async function fetchData() {
      const companyId = user.companyId;
      const planConfigs = await getPlanCompany(undefined, companyId);

      setShowCampaigns(planConfigs.plan.useCampaigns);
      setShowKanban(planConfigs.plan.useKanban);
      setShowOpenAi(planConfigs.plan.useOpenAi);
      setShowIntegrations(planConfigs.plan.useIntegrations);
      setShowSchedules(planConfigs.plan.useSchedules);
      setShowInternalChat(planConfigs.plan.useInternalChat);
      setShowExternalApi(planConfigs.plan.useExternalApi);
    }
    fetchData();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchChats();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  useEffect(() => {
    if (user.id) {
      const companyId = user.companyId;
      const onCompanyChatMainListItems = (data) => {
        if (data.action === "new-message") {
          dispatch({ type: "CHANGE_CHAT", payload: data });
        }
        if (data.action === "update") {
          dispatch({ type: "CHANGE_CHAT", payload: data });
        }
      };

      socket.on(`company-${companyId}-chat`, onCompanyChatMainListItems);
      return () => {
        socket.off(`company-${companyId}-chat`, onCompanyChatMainListItems);
      };
    }
  }, [socket]);

  useEffect(() => {
    let unreadsCount = 0;
    if (chats.length > 0) {
      for (let chat of chats) {
        for (let chatUser of chat.users) {
          if (chatUser.userId === user.id) {
            unreadsCount += chatUser.unreads;
          }
        }
      }
    }
    if (unreadsCount > 0) {
      setInvisible(false);
    } else {
      setInvisible(true);
    }
  }, [chats, user.id]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (whatsApps.length > 0) {
        const offlineWhats = whatsApps.filter((whats) => {
          return (
            whats.status === "qrcode" ||
            whats.status === "PAIRING" ||
            whats.status === "DISCONNECTED" ||
            whats.status === "TIMEOUT" ||
            whats.status === "OPENING"
          );
        });
        if (offlineWhats.length > 0) {
          setConnectionWarning(true);
        } else {
          setConnectionWarning(false);
        }
      }
    }, 2000);
    return () => clearTimeout(delayDebounceFn);
  }, [whatsApps]);

  const fetchChats = async () => {
    try {
      const { data } = await api.get("/chats/", {
        params: { searchParam, pageNumber },
      });
      dispatch({ type: "LOAD_CHATS", payload: data.records });
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <div onClick={drawerClose}>
      <Can
        role={
          (user.profile === "user" && user.showDashboard === "enabled") ||
            user.allowRealTime === "enabled"
            ? "admin"
            : user.profile
        }
        perform={"drawer-admin-items:view"}
        yes={() => (
          <>
            <Tooltip
              placement="right"
              arrow
              title={
                collapsed ? (
                  <Typography
                    style={{ fontWeight: 700, fontSize: "0.9rem" }}
                  >
                    {i18n.t("mainDrawer.listItems.management")}
                  </Typography>
                ) : (
                  ""
                )
              }
            >
              <ListItem
                dense
                button
                onClick={() =>
                  setOpenDashboardSubmenu((prev) => !prev)
                }
                onMouseEnter={() => setManagementHover(true)}
                onMouseLeave={() => setManagementHover(false)}
              >
                <ListItemIcon>
                  <Avatar
                    className={`${classes.iconHoverActive} ${isManagementActive || managementHover
                      ? "active"
                      : ""
                      }`}
                    style={{ color: iconStyles.dashboard.color }}
                  >
                    <UserCog />
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography className={classes.listItemText}>
                      {i18n.t("mainDrawer.listItems.management")}
                    </Typography>
                  }
                />
                {openDashboardSubmenu ? (
                  <ArrowDown />
                ) : (
                  <ArrowUp />
                )}
              </ListItem>
            </Tooltip>
            <Collapse
              in={openDashboardSubmenu}
              timeout="auto"
              unmountOnExit
              style={{
                backgroundColor:
                  theme.mode === "light"
                    ? "rgba(120,120,120,0.1)"
                    : "rgba(120,120,120,0.5)",
              }}
            >
              <Can
                role={
                  user.profile === "user" &&
                    user.showDashboard === "enabled"
                    ? "admin"
                    : user.profile
                }
                perform={"drawer-admin-items:view"}
                yes={() => (
                  <>
                    <ListItemLink
                      small
                      to="/"
                      primary="Dashboard"
                      icon={<LayoutDashboard />}
                      iconKey="dashboard"
                      tooltip={collapsed}
                    />
                    <ListItemLink
                      small
                      to="/reports"
                      primary={i18n.t(
                        "mainDrawer.listItems.reports"
                      )}
                      icon={<BookOpenText />}
                      iconKey="dashboard"
                      tooltip={collapsed}
                    />
                  </>
                )}
              />
              <Can
                role={
                  user.profile === "user" &&
                    user.allowRealTime === "enabled"
                    ? "admin"
                    : user.profile
                }
                perform={"drawer-admin-items:view"}
                yes={() => (
                  <ListItemLink
                    to="/moments"
                    primary={i18n.t(
                      "mainDrawer.listItems.chatsTempoReal"
                    )}
                    icon={<AppWindow />}
                    iconKey="dashboard"
                    tooltip={collapsed}
                  />
                )}
              />
            </Collapse>
          </>
        )}
      />
      <ListItemLink
        to="/tickets"
        primary={i18n.t("mainDrawer.listItems.tickets")}
        icon={<MessageCircle />}
        iconKey="tickets"
        tooltip={collapsed}
      />

      <ListItemLink
        to="/quick-messages"
        primary={i18n.t("mainDrawer.listItems.quickMessages")}
        icon={<Zap />}
        iconKey="messages"
        tooltip={collapsed}
      />

      {showKanban && (
        <>
          <ListItemLink
            to="/kanban"
            primary={i18n.t("mainDrawer.listItems.kanban")}
            icon={<SquareKanban />}
            iconKey="kanban"
            tooltip={collapsed}
          />
        </>
      )}

      <ListItemLink
        to="/contacts"
        primary={i18n.t("mainDrawer.listItems.contacts")}
        icon={<Users />}
        iconKey="contacts"
        tooltip={collapsed}
      />

      {showSchedules && (
        <>
          <ListItemLink
            to="/schedules"
            primary={i18n.t("mainDrawer.listItems.schedules")}
            icon={<CalendarClock />}
            iconKey="schedules"
            tooltip={collapsed}
          />
        </>
      )}

      <ListItemLink
        to="/tags"
        primary={i18n.t("mainDrawer.listItems.tags")}
        icon={<Tags />}
        iconKey="tags"
        tooltip={collapsed}
      />

      <ListItemLink
        to="/variables"
        primary={i18n.t("mainDrawer.listItems.variables")}
        icon={<MessageCircleReply />}
        iconKey="variables"
        tooltip={collapsed}
      />

      {showInternalChat && (
        <>
          <ListItemLink
            to="/chats"
            primary={i18n.t("mainDrawer.listItems.chats")}
            icon={<MessageCircleCode />}
            iconKey="chats"
            tooltip={collapsed}
          />
        </>
      )}

      {hasHelps && (
        <ListItemLink
          to="/helps"
          primary={i18n.t("mainDrawer.listItems.helps")}
          icon={<Phone />}
          iconKey="helps"
          tooltip={collapsed}
        />
      )}
      <Divider />
      <Typography
        className={classes.sectionTitle}
      >
        {i18n.t("mainDrawer.listItems.administration")}
      </Typography>


      <Can
        role={
          user.profile === "user" &&
            user.allowConnections === "enabled"
            ? "admin"
            : user.profile
        }
        perform="dashboard:view"
        yes={() => (
          <>
            {showCampaigns && (
              <Can
                role={user.profile}
                perform="dashboard:view"
                yes={() => (
                  <>
                    <Tooltip
                      placement="right"
                      arrow
                      title={
                        collapsed ? (
                          <Typography
                            style={{
                              fontWeight: 700,
                              fontSize: "0.9rem",
                            }}
                          >
                            {i18n.t(
                              "mainDrawer.listItems.campaigns"
                            )}
                          </Typography>
                        ) : (
                          ""
                        )
                      }
                    >
                      <ListItem
                        dense
                        button
                        onClick={() =>
                          setOpenCampaignSubmenu((prev) => !prev)
                        }
                        onMouseEnter={() => setCampaignHover(true)}
                        onMouseLeave={() => setCampaignHover(false)}
                      >
                        <ListItemIcon>
                          <Avatar
                            className={`${classes.iconHoverActive} ${isCampaignRouteActive ||
                              campaignHover
                              ? "active"
                              : ""
                              }`}
                            style={{
                              color: iconStyles.campaigns.color,
                            }}
                          >
                            <Megaphone />
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography
                              className={classes.listItemText}
                            >
                              {i18n.t(
                                "mainDrawer.listItems.campaigns"
                              )}
                            </Typography>
                          }
                        />
                        {openCampaignSubmenu ? (
                          <ArrowDown />
                        ) : (
                          <ArrowUp />
                        )}
                      </ListItem>
                    </Tooltip>
                    <Collapse
                      in={openCampaignSubmenu}
                      timeout="auto"
                      unmountOnExit
                      style={{
                        backgroundColor:
                          theme.mode === "light"
                            ? "rgba(120,120,120,0.1)"
                            : "rgba(120,120,120,0.5)",
                      }}
                    >
                      <List dense component="div" disablePadding>
                        <ListItemLink
                          to="/campaigns"
                          primary={i18n.t(
                            "campaigns.subMenus.list"
                          )}
                          icon={<ClipboardList />}
                          iconKey="campaigns"
                          tooltip={collapsed}
                        />
                        <ListItemLink
                          to="/contact-lists"
                          primary={i18n.t(
                            "campaigns.subMenus.listContacts"
                          )}
                          icon={<FileUser />}
                          iconKey="campaigns"
                          tooltip={collapsed}
                        />
                        <ListItemLink
                          to="/campaigns-config"
                          primary={i18n.t(
                            "campaigns.subMenus.settings"
                          )}
                          icon={<CalendarCog />}
                          iconKey="campaigns"
                          tooltip={collapsed}
                        />
                      </List>
                    </Collapse>
                  </>
                )}
              />
            )}

            <Can
              role={user.profile}
              perform="dashboard:view"
              yes={() => (
                <>
                  <Tooltip
                    placement="right"
                    arrow
                    title={
                      collapsed ? (
                        <Typography
                          style={{
                            fontWeight: 700,
                            fontSize: "0.9rem",
                          }}
                        >
                          {i18n.t(
                            "mainDrawer.listItems.flowbuilder"
                          )}
                        </Typography>
                      ) : (
                        ""
                      )
                    }
                  >
                    <ListItem
                      dense
                      button
                      onClick={() =>
                        setOpenFlowSubmenu((prev) => !prev)
                      }
                      onMouseEnter={() => setFlowHover(true)}
                      onMouseLeave={() => setFlowHover(false)}
                    >
                      <ListItemIcon>
                        <Avatar
                          className={`${classes.iconHoverActive} ${isFlowbuilderRouteActive || flowHover
                            ? "active"
                            : ""
                            }`}
                          style={{
                            color: iconStyles.flowbuilder.color,
                          }}
                        >
                          <Network />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography
                            className={classes.listItemText}
                          >
                            {i18n.t(
                              "mainDrawer.listItems.flowbuilder"
                            )}
                          </Typography>
                        }
                      />
                      {openFlowSubmenu ? (
                        <ArrowDown />
                      ) : (
                        <ArrowUp />
                      )}
                    </ListItem>
                  </Tooltip>

                  <Collapse
                    in={openFlowSubmenu}
                    timeout="auto"
                    unmountOnExit
                    style={{
                      backgroundColor:
                        theme.mode === "light"
                          ? "rgba(120,120,120,0.1)"
                          : "rgba(120,120,120,0.5)",
                    }}
                  >
                    <List dense component="div" disablePadding>
                      <ListItemLink
                        to="/phrase-lists"
                        primary={i18n.t(
                          "flowbuilder.subMenus.campaign"
                        )}
                        icon={<Share2 />}
                        iconKey="flowbuilder"
                        tooltip={collapsed}
                      />

                      <ListItemLink
                        to="/flowbuilders"
                        primary={i18n.t(
                          "flowbuilder.subMenus.conversation"
                        )}
                        icon={<GitFork />}
                        iconKey="flowbuilder"
                        tooltip={collapsed}
                      />
                    </List>
                  </Collapse>
                </>
              )}
            />

            {user.super && (
              <ListItemLink
                to="/announcements"
                primary={i18n.t(
                  "mainDrawer.listItems.annoucements"
                )}
                icon={<MessageCircleWarning />}
                iconKey="announcements"
                tooltip={collapsed}
              />
            )}

            {showExternalApi && (
              <>
                <Can
                  role={user.profile}
                  perform="dashboard:view"
                  yes={() => (
                    <ListItemLink
                      to="/messages-api"
                      primary={i18n.t(
                        "mainDrawer.listItems.messagesAPI"
                      )}
                      icon={<DatabaseZap />}
                      iconKey="api"
                      tooltip={collapsed}
                    />
                  )}
                />
              </>
            )}
            <Can
              role={user.profile}
              perform="dashboard:view"
              yes={() => (
                <ListItemLink
                  to="/users"
                  primary={i18n.t("mainDrawer.listItems.users")}
                  icon={<UserPen />}
                  iconKey="users"
                  tooltip={collapsed}
                />
              )}
            />
            <Can
              role={user.profile}
              perform="dashboard:view"
              yes={() => (
                <ListItemLink
                  to="/queues"
                  primary={i18n.t("mainDrawer.listItems.queues")}
                  icon={<GitGraph />}
                  iconKey="queues"
                  tooltip={collapsed}
                />
              )}
            />

            {showOpenAi && (
              <Can
                role={user.profile}
                perform="dashboard:view"
                yes={() => (
                  <ListItemLink
                    to="/prompts"
                    primary={i18n.t(
                      "mainDrawer.listItems.prompts"
                    )}
                    icon={<Brain />}
                    iconKey="prompts"
                    tooltip={collapsed}
                  />
                )}
              />
            )}

            {showIntegrations && (
              <Can
                role={user.profile}
                perform="dashboard:view"
                yes={() => (
                  <ListItemLink
                    to="/queue-integration"
                    primary={i18n.t(
                      "mainDrawer.listItems.queueIntegration"
                    )}
                    icon={<Plug />}
                    iconKey="integrations"
                    tooltip={collapsed}
                  />
                )}
              />
            )}
            <Can
              role={
                user.profile === "user" &&
                  user.allowConnections === "enabled"
                  ? "admin"
                  : user.profile
              }
              perform={"drawer-admin-items:view"}
              yes={() => (
                <ListItemLink
                  to="/connections"
                  primary={i18n.t(
                    "mainDrawer.listItems.connections"
                  )}
                  icon={
                    <Signal />
                  }
                  iconKey="connections"
                  showBadge={connectionWarning}
                  tooltip={collapsed}
                />
              )}
            />
            <Can
              role={user.profile}
              perform="dashboard:view"
              yes={() => (
                <ListItemLink
                  to="/files"
                  primary={i18n.t("mainDrawer.listItems.files")}
                  icon={<FolderOpen />}
                  iconKey="files"
                  tooltip={collapsed}
                />
              )}
            />
            <Can
              role={user.profile}
              perform="dashboard:view"
              yes={() => (
                <ListItemLink
                  to="/financeiro"
                  primary={i18n.t(
                    "mainDrawer.listItems.financeiro"
                  )}
                  icon={<Wallet />}
                  iconKey="financial"
                  tooltip={collapsed}
                />
              )}
            />
            <Can
              role={user.profile}
              perform="dashboard:view"
              yes={() => (
                <ListItemLink
                  to="/settings"
                  primary={i18n.t(
                    "mainDrawer.listItems.settings"
                  )}
                  icon={<Settings />}
                  iconKey="settings"
                  tooltip={collapsed}
                />
              )}
            />

            {user.super && (
              <ListItemLink
                to="/global-config"
                primary={i18n.t(
                  "globalConfig.title",
                  "Configurações Globais"
                )}
                icon={<EarthLock />}
                iconKey="globalConfig"
                tooltip={collapsed}
              />
            )}
          </>
        )}
      />
      {!collapsed && (
        <React.Fragment>
          <Divider />
          <Box style={{ padding: "16px", textAlign: "center" }}>
            <Chip
              label="V2.0.0"
              size="small"
              className={classes.versionChip}
            />
          </Box>
        </React.Fragment>
      )}
    </div>
  );
};

export default MainListItems;
