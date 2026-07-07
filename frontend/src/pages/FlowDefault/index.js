import React, { useState, useEffect, useReducer, useContext } from "react";

import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import TextField from "@material-ui/core/TextField";

import api from "../../services/api";
import ConfirmationModal from "../../components/ConfirmationModal";

import { i18n } from "../../translate/i18n";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainContainer from "../../components/MainContainer";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import NewTicketModal from "../../components/NewTicketModal";
import { SocketContext } from "../../context/Socket/SocketContext";

import {
  AddCircle,
  Build,
  ContentCopy,
  DevicesFold,
  MoreVert,
  WebhookOutlined
} from "@mui/icons-material";
import {
  Autocomplete,
  Button,
  Chip,
  CircularProgress,
  Grid,
  Menu,
  MenuItem,
  Stack,
  Typography
} from "@mui/material";
import FlowBuilderModal from "../../components/FlowBuilderModal";
import {
  colorBackgroundTable,
  colorLineTable,
  colorLineTableHover,
  colorPrimary,
  colorTitleTable,
  colorTopTable
} from "../../styles/styles";

const reducer = (state, action) => {
  if (action.type === "LOAD_CONTACTS") {
    const contacts = action.payload;
    const newContacts = [];

    contacts.forEach(contact => {
      const contactIndex = state.findIndex(c => c.id === contact.id);
      if (contactIndex !== -1) {
        state[contactIndex] = contact;
      } else {
        newContacts.push(contact);
      }
    });

    return [...state, ...newContacts];
  }

  if (action.type === "UPDATE_CONTACTS") {
    const contact = action.payload;
    const contactIndex = state.findIndex(c => c.id === contact.id);

    if (contactIndex !== -1) {
      state[contactIndex] = contact;
      return [...state];
    } else {
      return [contact, ...state];
    }
  }

  if (action.type === "DELETE_CONTACT") {
    const contactId = action.payload;

    const contactIndex = state.findIndex(c => c.id === contactId);
    if (contactIndex !== -1) {
      state.splice(contactIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const GlassSection = ({ icon, title, description, children }) => (
  <Stack
    spacing={2}
    sx={{
      padding: 3,
      borderRadius: 20,
      background:
        "linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))",
      backdropFilter: "blur(14px)",
      border: "1px solid rgba(255,255,255,0.12)",
      boxShadow: "0 15px 40px rgba(0,0,0,0.35)"
    }}
  >
    <Stack direction="row" spacing={1.5} alignItems="center">
      {icon}
      <Typography fontSize={18} fontWeight={700}>
        {title}
      </Typography>
    </Stack>

    <Typography fontSize={13} color="#94a3b8">
      {description}
    </Typography>

    {children}
  </Stack>
);


const useStyles = makeStyles(theme => ({
  mainPaper: {
    flex: 1,
    borderRadius: 24,
    padding: theme.spacing(3),
    background: "rgba(15, 23, 42, 0.6)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 20px 45px rgba(0,0,0,0.4)",
    overflow: "hidden"
  }
}));


const FlowDefault = () => {
  const classes = useStyles();
  const history = useHistory();

  const [loading, setLoading] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam, setSearchParam] = useState("");
  const [contacts, dispatch] = useReducer(reducer, []);
  const [webhooks, setWebhooks] = useState([]);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [selectedWebhookName, setSelectedWebhookName] = useState(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [contactTicket, setContactTicket] = useState({});
  const [deletingContact, setDeletingContact] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmDuplicateOpen, setConfirmDuplicateOpen] = useState(false);

  const [configExist, setConfigExist] = useState(false)

  const [flowsData, setFlowsData] = useState([]);
  const [flowsDataObj, setFlowsDataObj] = useState([]);

  const [flowSelectedWelcome, setFlowSelectedWelcome] = useState(null);

  const [flowSelectedPhrase, setFlowSelectedPhrase] = useState(null);

  const [hasMore, setHasMore] = useState(false);
  const [reloadData, setReloadData] = useState(false);

  const { user, socket } = useContext(AuthContext);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  const getFlows = async () => {
    return await api.get("/flowbuilder").then(res => {
      setFlowsData(res.data.flows.map(flow => flow.name));
      setFlowsDataObj(res.data.flows);
      return res.data.flows
    });
  };

  const getFlowsDefault = async (flowData) => {
    await api.get("/flowdefault").then(res => {
      if (res.data.flow?.companyId) {
        setConfigExist(true)
      }
      if (res.data.flow?.flowIdWelcome) {
        const flowName = flowData.filter(item => item.id === res.data.flow.flowIdWelcome)
        if (flowName.length > 0) {
          setFlowSelectedWelcome(flowName[0].name);
        } else {
          setFlowSelectedWelcome()
        }

      }
      if (res.data.flow?.flowIdNotPhrase) {
        const flowName = flowData.filter(item => item.id === res.data.flow.flowIdNotPhrase)
        if (flowName.length > 0) {
          setFlowSelectedPhrase(flowName[0].name);
        } else {
          setFlowSelectedPhrase();
        }

      }
      setLoading(false)
    });
  };

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");

    const onContact = (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_CONTACTS", payload: data.contact });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_CONTACT", payload: +data.contactId });
      }
    }

    socket.on(`company-${companyId}-contact`, onContact);

    getFlows().then(res => {
      getFlowsDefault(res)
    })

    return () => {
      socket.disconnect();
    };
  }, []);



  const handleCloseContactModal = () => {
    setSelectedContactId(null);
    setContactModalOpen(false);
  };

  const handleCloseOrOpenTicket = ticket => {
    setNewTicketModalOpen(false);
    if (ticket !== undefined && ticket.uuid !== undefined) {
      history.push(`/tickets/${ticket.uuid}`);
    }
  };

  const handleDeleteWebhook = async webhookId => {
    try {
      await api.delete(`/flowbuilder/${webhookId}`).then(res => {
        setDeletingContact(null);
        setReloadData(old => !old);
      });
      toast.success("Fluxo excluído com sucesso");
    } catch (err) {
      toastError(err);
    }
  };

  const handleSaveDefault = async () => {
    console.log(configExist)

    let idWelcome = flowsDataObj.filter(item => item.name === flowSelectedWelcome)
    let idPhrase = flowsDataObj.filter(item => item.name === flowSelectedPhrase)
    if (idWelcome.length === 0) {
      idWelcome = null
    } else {
      idWelcome = idWelcome[0].id
    }
    if (idPhrase.length === 0) {
      idPhrase = null
    } else {
      idPhrase = idPhrase[0].id
    }

    if (configExist) {
      try {
        await api.put(`/flowdefault`, { flowIdWelcome: idWelcome, flowIdPhrase: idPhrase }).then(res => {
          setDeletingContact(null);
          setReloadData(old => !old);
        });
        toast.success("Fluxos padrões atualizados");
      } catch (err) {
        toastError(err);
      }
    } else {
      try {
        await api.post(`/flowdefault`, { flowIdWelcome: idWelcome, flowIdPhrase: idPhrase }).then(res => {
          setDeletingContact(null);
          setReloadData(old => !old);
        });
        toast.success("Fluxos padrões atualizados");
      } catch (err) {
        toastError(err);
      }
    }

  };

  const loadMore = () => {
    setPageNumber(prevState => prevState + 1);
  };

  return (
    <MainContainer className={classes.mainContainer}>
      <NewTicketModal
        modalOpen={newTicketModalOpen}
        initialContact={contactTicket}
        onClose={ticket => {
          handleCloseOrOpenTicket(ticket);
        }}
      />
      <FlowBuilderModal
        open={contactModalOpen}
        onClose={handleCloseContactModal}
        aria-labelledby="form-dialog-title"
        flowId={selectedContactId}
        nameWebhook={selectedWebhookName}
        onSave={() => setReloadData(old => !old)}
      ></FlowBuilderModal>
      <ConfirmationModal
        title={
          deletingContact
            ? `${i18n.t("contacts.confirmationModal.deleteTitle")} ${deletingContact.name
            }?`
            : `${i18n.t("contacts.confirmationModal.importTitlte")}`
        }
        open={confirmOpen}
        onClose={setConfirmOpen}
        onConfirm={e =>
          deletingContact ? handleDeleteWebhook(deletingContact.id) : () => { }
        }
      >
        {deletingContact
          ? `Tem certeza que deseja deletar este fluxo? Todas as integrações relacionados serão perdidos.`
          : `${i18n.t("contacts.confirmationModal.importMessage")}`}
      </ConfirmationModal>
      <MainHeader
        style={{
          backdropFilter: "blur(14px)",
          background: "rgba(15,23,42,0.55)",
          borderRadius: 20,
          padding: "14px 20px",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 12px 30px rgba(0,0,0,0.35)"
        }}
      >
        <Title
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontWeight: 700
          }}
        >
          <WebhookOutlined sx={{ color: "#38bdf8" }} />
          Fluxos padrão
        </Title>
      </MainHeader>
      <Paper
        className={classes.mainPaper}
        variant="outlined"
      >
        <Stack sx={{ padding: '12px', position: 'relative' }}>
          <Stack sx={{ position: 'absolute', right: 0 }}>
            <Button
              onClick={handleSaveDefault}
              sx={{
                borderRadius: 14,
                px: 3,
                py: 1.2,
                textTransform: "none",
                fontWeight: 600,
                background:
                  "linear-gradient(135deg, #38bdf8, #0ea5e9)",
                boxShadow: "0 12px 30px rgba(14,165,233,0.45)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #0ea5e9, #0284c7)",
                  boxShadow: "0 16px 40px rgba(14,165,233,0.65)"
                }
              }}
            >
              Salvar configurações
            </Button>
          </Stack>
          <GlassSection
            icon={<DevicesFold sx={{ color: "#22c55e" }} />}
            title="Fluxo de boas-vindas"
            description="Disparado apenas para novos contatos que nunca interagiram."
          >
            {!loading ? (
              <Autocomplete
                value={flowSelectedWelcome}
                options={flowsData}
                onChange={(e, v) => setFlowSelectedWelcome(v)}
                renderInput={params => (
                  <TextField
                    {...params}
                    placeholder="Escolha um fluxo"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 14,
                        background: "rgba(255,255,255,0.08)",
                        backdropFilter: "blur(10px)",
                        "& fieldset": { border: "none" }
                      }
                    }}
                  />
                )}
              />
            ) : (
              <CircularProgress />
            )}
          </GlassSection>

          <GlassSection
            icon={<Build sx={{ color: "#facc15" }} />}
            title="Fluxo de resposta padrão"
            description="Enviado quando a mensagem não corresponde a nenhuma palavra-chave."
          >
            {!loading ? (
              <Autocomplete
                value={flowSelectedPhrase}
                options={flowsData}
                onChange={(e, v) => setFlowSelectedPhrase(v)}
                renderInput={params => (
                  <TextField
                    {...params}
                    placeholder="Escolha um fluxo"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 14,
                        background: "rgba(255,255,255,0.08)",
                        backdropFilter: "blur(10px)",
                        "& fieldset": { border: "none" }
                      }
                    }}
                  />
                )}
              />
            ) : (
              <CircularProgress />
            )}
          </GlassSection>
        </Stack>
      </Paper>
    </MainContainer>
  );
};

export default FlowDefault;
