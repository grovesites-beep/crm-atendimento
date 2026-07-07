import React, { useState, useEffect, useReducer, useContext } from "react";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";

import { makeStyles, useTheme } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import SearchIcon from "@material-ui/icons/Search";

import {
  Button,
  CircularProgress,
  Grid,
  Menu,
  MenuItem,
  Stack
} from "@mui/material";

import {
  AddCircle,
  Build,
  ContentCopy,
  DevicesFold,
  MoreVert,
  Edit,
  DeleteOutline
} from "@mui/icons-material";

import api from "../../services/api";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import MainContainer from "../../components/MainContainer";
import ConfirmationModal from "../../components/ConfirmationModal";
import FlowBuilderModal from "../../components/FlowBuilderModal";
import NewTicketModal from "../../components/NewTicketModal";

import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import { i18n } from "../../translate/i18n";

/* 🎨 Paleta */
const CYAN = "#00E5FF";
const CYAN_DARK = "#00B8D4";
const TEXT_DARK = "#0F172A";

const reducer = (state, action) => {
  switch (action.type) {
    case "LOAD":
      return action.payload;
    case "RESET":
      return [];
    default:
      return state;
  }
};

const useStyles = makeStyles(theme => ({
  mainPaper: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: theme.spacing(1.5),
    overflowY: "auto"
  }
}));

const FlowBuilder = () => {
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();

  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [flows, dispatch] = useReducer(reducer, []);

  const [reload, setReload] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmDuplicate, setConfirmDuplicate] = useState(false);

  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  useEffect(() => {
    setLoading(true);
    api.get("/flowbuilder")
      .then(res => {
        dispatch({ type: "LOAD", payload: res.data.flows });
      })
      .catch(toastError)
      .finally(() => setLoading(false));
  }, [reload]);

  const handleMenuOpen = (e, flow) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
    setSelectedFlow(flow);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/flowbuilder/${selectedFlow.id}`);
      toast.success("Fluxo excluído com sucesso");
      setReload(v => !v);
    } catch (err) {
      toastError(err);
    }
  };

  const handleDuplicate = async () => {
    try {
      await api.post("/flowbuilder/duplicate", {
        flowId: selectedFlow.id
      });
      toast.success("Fluxo duplicado com sucesso");
      setReload(v => !v);
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <MainContainer>
      <FlowBuilderModal
        open={modalOpen}
        flowId={selectedFlow?.id}
        nameWebhook={selectedFlow?.name}
        onClose={() => setModalOpen(false)}
        onSave={() => setReload(v => !v)}
      />

      <ConfirmationModal
        open={confirmDelete}
        onClose={setConfirmDelete}
        onConfirm={handleDelete}
        title={`Excluir fluxo ${selectedFlow?.name}?`}
      >
        Essa ação não poderá ser desfeita.
      </ConfirmationModal>

      <ConfirmationModal
        open={confirmDuplicate}
        onClose={setConfirmDuplicate}
        onConfirm={handleDuplicate}
        title={`Duplicar fluxo ${selectedFlow?.name}?`}
      >
        Um novo fluxo será criado com os mesmos dados.
      </ConfirmationModal>

      <MainHeader>
        <Title style={{ color: CYAN_DARK, fontWeight: 700 }}>
          Fluxos de conversa
        </Title>

        <MainHeaderButtonsWrapper>
          <TextField
            placeholder={i18n.t("contacts.searchPlaceholder")}
            value={searchParam}
            onChange={e => setSearchParam(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />

          <Button
            variant="contained"
            sx={{
              backgroundColor: CYAN,
              color: "#00363A",
              fontWeight: 600,
              borderRadius: "10px",
              "&:hover": { backgroundColor: CYAN_DARK }
            }}
            onClick={() => {
              setSelectedFlow(null);
              setModalOpen(true);
            }}
          >
            <AddCircle sx={{ mr: 1 }} />
            Adicionar Fluxo
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Paper className={classes.mainPaper}>
        {loading ? (
          <Stack alignItems="center" justifyContent="center" minHeight="50vh">
            <CircularProgress />
          </Stack>
        ) : (
          flows.map(flow => (
            <Grid
              container
              key={flow.id}
              onClick={() => history.push(`/flowbuilder/${flow.id}`)}
              sx={{
                padding: "14px 16px",
                backgroundColor: "#FFFFFF",
                borderRadius: "14px",
                marginBottom: "10px",
                cursor: "pointer",
                border: "1px solid #E0F7FA",
                transition: "all .2s ease",
                "&:hover": {
                  borderColor: CYAN,
                  boxShadow: "0 6px 20px rgba(0,229,255,.25)",
                  transform: "translateY(-2px)"
                }
              }}
            >
              <Grid item xs={4}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <DevicesFold sx={{ color: CYAN }} />
                  <strong style={{ color: TEXT_DARK }}>
                    {flow.name}
                  </strong>
                </Stack>
              </Grid>

              <Grid item xs={4} align="center">
                <span
                  style={{
                    padding: "4px 12px",
                    borderRadius: "999px",
                    fontSize: 12,
                    fontWeight: 600,
                    backgroundColor: flow.active ? "#E0F7FA" : "#F1F5F9",
                    color: flow.active ? CYAN_DARK : "#64748B"
                  }}
                >
                  {flow.active ? "Ativo" : "Desativado"}
                </span>
              </Grid>

              <Grid item xs={4} align="end">
                <Button
                  onClick={(e) => handleMenuOpen(e, flow)}
                  sx={{
                    minWidth: 36,
                    height: 36,
                    borderRadius: "50%",
                    "&:hover": { backgroundColor: "#E0F7FA" }
                  }}
                >
                  <MoreVert sx={{ color: CYAN_DARK }} />
                </Button>
              </Grid>
            </Grid>
          ))
        )}
      </Paper>

      <Menu
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: "14px",
            boxShadow: "0 10px 30px rgba(0,0,0,.15)"
          }
        }}
      >
        <MenuItem onClick={() => {
          setModalOpen(true);
          handleMenuClose();
        }}>
          <Edit fontSize="small" sx={{ mr: 1 }} />
          Editar nome
        </MenuItem>

        <MenuItem onClick={() => {
          history.push(`/flowbuilder/${selectedFlow.id}`);
        }}>
          <Build fontSize="small" sx={{ mr: 1 }} />
          Editar fluxo
        </MenuItem>

        <MenuItem onClick={() => {
          setConfirmDuplicate(true);
          handleMenuClose();
        }}>
          <ContentCopy fontSize="small" sx={{ mr: 1 }} />
          Duplicar
        </MenuItem>

        <MenuItem
          onClick={() => {
            setConfirmDelete(true);
            handleMenuClose();
          }}
          sx={{ color: "error.main" }}
        >
          <DeleteOutline fontSize="small" sx={{ mr: 1 }} />
          Excluir
        </MenuItem>
      </Menu>
    </MainContainer>
  );
};

export default FlowBuilder;
