import React, { useContext, useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
  Paper,
  Stack,
  SvgIcon,
  Tab,
  Tabs,
  Grid,
  IconButton,
  Divider
} from "@mui/material";
import { Star, Users, PhoneCall, Hourglass, CheckCircle, Mic, UserPlus, Save } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import { isArray } from "lodash";
import { AuthContext } from "../../context/Auth/AuthContext";
import useDashboard from "../../hooks/useDashboard";
import TableAttendantsStatus from "../../components/Dashboard/TableAttendantsStatus";
import { ChatsUser } from "./ChartsUser";
import ChartDonut from "./ChartDonut";
import { ChartsDate } from "./ChartsDate";
import ForbiddenPage from "../../components/ForbiddenPage";
import { i18n } from "../../translate/i18n";

import { useTheme as useThemeV4 } from "@material-ui/core/styles";
import { useTheme as useThemeV5 } from "@mui/material/styles";

// StatCard modernizado
const StatCard = ({ title, value, icon, color }) => (
  <Card
    sx={{
      height: "100%",
      borderRadius: 4,
      boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
      transition: "0.3s",
      "&:hover": { transform: "translateY(-5px)", boxShadow: "0 10px 30px rgba(0,0,0,0.12)" },
      background: "#fff"
    }}
  >
    <CardContent>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography
            variant="overline"
            sx={{
              fontWeight: 600,
              color: "text.secondary",
              fontFamily: "Inter, sans-serif"
            }}
          >
            {title}
          </Typography>

          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              color: "text.primary",
              fontFamily: "Inter, sans-serif"
            }}
          >
            {value}
          </Typography>
        </Box>
        <Avatar
          sx={{
            bgcolor: color,
            width: 60,
            height: 60,
            boxShadow: `0 4px 12px ${color}55`,
          }}
        >
          <SvgIcon fontSize="large">{icon}</SvgIcon>
        </Avatar>
      </Stack>
    </CardContent>
  </Card>
);

// NPS Card modernizado
const NpsMetricCard = ({ title, value, color }) => (
  <Card
    sx={{
      height: "100%",
      textAlign: "center",
      p: 2,
      borderRadius: 4,
      boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
      transition: "0.3s",
      "&:hover": { transform: "translateY(-2px)", boxShadow: "0 8px 20px rgba(0,0,0,0.1)" }
    }}
  >
    <Typography variant="overline" color="text.secondary">{title}</Typography>
    <Typography variant="h3" fontWeight="bold" sx={{ color, my: 1 }}>{value}%</Typography>
    <Box sx={{ height: 10, backgroundColor: "grey.200", borderRadius: 2, overflow: "hidden" }}>
      <Box sx={{ height: "100%", width: `${value}%`, backgroundColor: color, transition: "width 0.5s ease" }} />
    </Box>
  </Card>
);

const Dashboard = () => {
  const themeV5 = useThemeV5();
  const themeV4 = useThemeV4();

  const PRIMARY_MAIN = themeV4?.palette?.primary?.main || "#1976d2";
  const PRIMARY_DARK = themeV4?.palette?.primary?.dark || "#115293";
  const PRIMARY_CONTRAST = themeV4?.palette?.primary?.contrastText || "#fff";

  const [counters, setCounters] = useState({});
  const [attendants, setAttendants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const { find } = useDashboard();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = {
          date_from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10),
          date_to: new Date().toISOString().slice(0, 10)
        };
        const data = await find(params);
        setCounters(data.counters);
        if (isArray(data.attendants)) setAttendants(data.attendants);
      } catch (error) {
        toast.error("Não foi possível carregar os dados do dashboard.");
        console.error(error);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const exportToExcel = () => {
    try {
      const table = document.getElementById("grid-attendants");
      const ws = XLSX.utils.table_to_sheet(table);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "RelatorioDeAtendentes");
      XLSX.writeFile(wb, "relatorio-de-atendentes.xlsx");
    } catch {
      toast.error("Erro ao exportar para Excel.");
    }
  };

  const getOnlineUsersCount = () => attendants.filter(u => u.online).length;

  if (user.profile === "user" && user.showDashboard === "disabled") {
    return <ForbiddenPage />;
  }

  const statCards = [
    { title: i18n.t("dashboard.cards.inAttendance"), value: counters.supportHappening || 0, icon: <PhoneCall />, color: PRIMARY_MAIN },
    { title: i18n.t("dashboard.cards.waiting"), value: counters.supportPending || 0, icon: <Hourglass />, color: themeV5.palette.info.main },
    { title: i18n.t("dashboard.cards.finalized"), value: counters.supportFinished || 0, icon: <CheckCircle />, color: themeV5.palette.success.main },
    { title: i18n.t("dashboard.cards.groups"), value: counters.supportGroups || 0, icon: <Users />, color: themeV5.palette.secondary.main },
    { title: i18n.t("dashboard.cards.activeAttendants"), value: `${getOnlineUsersCount()}/${attendants.length}`, icon: <Mic />, color: themeV5.palette.error.main },
    { title: i18n.t("dashboard.cards.newContacts"), value: counters.leads || 0, icon: <UserPlus />, color: themeV5.palette.warning.main }
  ];

  const npsData = {
    score: counters.npsScore || 0,
    promoters: counters.npsPromotersPerc || 0,
    passives: counters.npsPassivePerc || 0,
    detractors: counters.npsDetractorsPerc || 0,
    totalTickets: counters.tickets || 0,
    withRating: counters.withRating || 0,
    percRating: counters.percRating || 0
  };

  const npsColors = { Promotores: "#2EA85A", Detratores: "#F73A2C", Neutros: "#F7EC2C" };
  const npsChartData = [
    { name: "Promotores", value: npsData.promoters },
    { name: "Detratores", value: npsData.detractors },
    { name: "Neutros", value: npsData.passives }
  ].sort((a, b) => a.name.localeCompare(b.name));
  const sortedNpsColors = npsChartData.map(item => npsColors[item.name]);

  return (
    <Box sx={{ backgroundColor: "#f0f2f5", minHeight: "100vh", py: 5 }}>
      <Container maxWidth="xl">
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 4, color: PRIMARY_MAIN }}>
          {i18n.t("dashboard.title") || "Dashboard"}
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
              <StatCard {...card} />
            </Grid>
          ))}
        </Grid>

        <Paper elevation={0} sx={{ mb: 3, borderRadius: 4, bgcolor: "transparent" }}>
          <Tabs
            value={activeTab}
            onChange={(e, nv) => setActiveTab(nv)}
            variant="fullWidth"
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              "& .MuiTab-root": {
                fontWeight: 700,
                textTransform: "uppercase",
                fontSize: "0.95rem",
                color: "text.secondary",
                "&.Mui-selected": { color: PRIMARY_MAIN }
              },
              "& .MuiTabs-indicator": { backgroundColor: PRIMARY_MAIN, height: 4, borderRadius: "4px" }
            }}
          >
            <Tab label={i18n.t("dashboard.tabs.performance")} />
            <Tab label="NPS" />
            <Tab label={i18n.t("dashboard.tabs.attendants")} />
          </Tabs>
        </Paper>

        {/* Conteúdo Tabs */}
        <Box>
          {activeTab === 0 && (
            <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 4, boxShadow: "0 6px 20px rgba(0,0,0,0.06)" }}>
              <ChartsDate />
            </Paper>
          )}

          {activeTab === 1 && (
            <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 4, boxShadow: "0 6px 20px rgba(0,0,0,0.06)" }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Avatar sx={{ bgcolor: PRIMARY_MAIN + "33", color: PRIMARY_MAIN, mr: 2 }}><Star /></Avatar>
                <Typography variant="h6" fontWeight="bold">{i18n.t("dashboard.tabs.assessments")}</Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Card sx={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center", p: 3, borderRadius: 4, boxShadow: "0 6px 20px rgba(0,0,0,0.05)" }}>
                    <ChartDonut data={npsChartData} value={npsData.score} colors={sortedNpsColors} />
                  </Card>
                </Grid>

                <Grid item container xs={12} md={8} spacing={2}>
                  <NpsMetricCard title={i18n.t("dashboard.assessments.prosecutors")} value={npsData.promoters} color={npsColors["Promotores"]} />
                  <NpsMetricCard title={i18n.t("dashboard.assessments.neutral")} value={npsData.passives} color={npsColors["Neutros"]} />
                  <NpsMetricCard title={i18n.t("dashboard.assessments.detractors")} value={npsData.detractors} color={npsColors["Detratores"]} />
                </Grid>
              </Grid>
            </Paper>
          )}

          {activeTab === 2 && (
            <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 4, boxShadow: "0 6px 20px rgba(0,0,0,0.06)" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">{i18n.t("dashboard.tabs.attendants")}</Typography>
                <IconButton
                  onClick={exportToExcel}
                  size="small"
                  sx={{
                    backgroundColor: PRIMARY_MAIN,
                    color: PRIMARY_CONTRAST,
                    transition: "0.3s",
                    "&:hover": { backgroundColor: PRIMARY_DARK, transform: "translateY(-1px)", boxShadow: "0 6px 18px rgba(0,0,0,0.15)" }
                  }}
                >
                  <Save />
                </IconButton>
              </Box>
              <Divider sx={{ mb: 3 }} />
              <div id="grid-attendants">
                {attendants.length > 0 && <TableAttendantsStatus attendants={attendants} loading={loading} />}
              </div>
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>{i18n.t("dashboard.charts.userPerformance")}</Typography>
                <Divider sx={{ mb: 3 }} />
                <ChatsUser />
              </Box>
            </Paper>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default Dashboard;
