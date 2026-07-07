import React, { useState, useEffect } from "react";
import { useHistory, Link as RouterLink } from "react-router-dom";
import {
  Button,
  CssBaseline,
  TextField,
  Link,
  Grid,
  Box,
  Typography,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@material-ui/core";
import { Helmet } from "react-helmet";
import { makeStyles } from "@material-ui/core/styles";
import { toast, Toaster } from "sonner";
import { User, Mail, Phone, Lock, Building2, CreditCard, ArrowLeft } from "lucide-react";

import usePlans from "../../hooks/usePlans";
import { i18n } from "../../translate/i18n";
import { openApi } from "../../services/api";
import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: "100vh",
    background: "#f5f5f5",
    display: "flex",
    flexDirection: "column",
  },
  back: {
    padding: 16,
  },
  paper: {
    width: "100%",
    maxWidth: 900, // mais largo no desktop
    margin: "0 auto",
    background: "#fff",
    borderRadius: 16,
    padding: 32,
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",

    // ajuste fino para telas menores
    [theme.breakpoints.down("sm")]: {
      maxWidth: 520,
      padding: 24,
    },
  },
  title: {
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    color: "#666",
    fontSize: 14,
    marginBottom: 24,
  },
  fieldRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  icon: {
    color: "#999",
  },
  submit: {
    marginTop: 16,
    padding: 12,
    fontWeight: "bold",
    backgroundColor: "#0b88e8",
    color: "#fff",
  },
  footer: {
    marginTop: 32,
    textAlign: "center",
    color: "#666",
    fontSize: 13,
    borderTop: "1px solid #ddd",
    padding: 16,
  },
}));

const SignUp = () => {
  const classes = useStyles();
  const navigate = useHistory();
  const { getPlanList } = usePlans();

  const [plans, setPlans] = useState([]);
  const [userCreationEnabled, setUserCreationEnabled] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    companyId: null,
    companyName: "",
    planId: "",
  });

  const backendUrl =
    process.env.REACT_APP_BACKEND_URL === "https://localhost:8090"
      ? "https://localhost:8090"
      : process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const companyId = params.get("companyId");
    if (companyId) setForm((prev) => ({ ...prev, companyId }));
  }, []);

  useEffect(() => {
    const fetchUserCreationStatus = async () => {
      try {
        const response = await fetch(`${backendUrl}/settings/userCreation`);
        const data = await response.json();

        if (data.userCreation !== "enabled") {
          toast.info("Cadastro de novos usuários está desabilitado.");
          navigate("/login");
          setUserCreationEnabled(false);
        }
      } catch {
        toast.error("Erro ao verificar permissão de cadastro.");
        navigate("/login");
      }
    };

    fetchUserCreationStatus();
  }, [backendUrl, navigate]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const planList = await getPlanList({ listPublic: "false" });
        setPlans(planList);
      } catch (err) {
        console.error(err);
      }
    };

    fetchPlans();
  }, [getPlanList]);

  if (!userCreationEnabled) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.companyName || !form.planId) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    try {
      await openApi.post("/auth/signup", form);
      toast.success(i18n.t("signup.toasts.success"));
      navigate("/login");
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <div className={classes.root}>
      <Helmet>
        <title>Cadastre-se - AtendeTicket</title>
      </Helmet>
      <CssBaseline />
      <Toaster />

      {/* Botão Voltar */}
      <div className={classes.back}>
        <Link component={RouterLink} to="/">
          <ArrowLeft />
        </Link>
      </div>

      <Container>
        <div className={classes.paper}>
          <Typography variant="h5" className={classes.title}>
            Crie uma conta
          </Typography>
          <Typography className={classes.subtitle}>
            Digite seus dados abaixo para criar sua conta
          </Typography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {/* COLUNA ESQUERDA */}
              <Grid item xs={12} md={6}>
                {/* Empresa */}
                <div className={classes.fieldRow}>
                  <Building2 className={classes.icon} />
                  <TextField
                    fullWidth
                    label="Empresa"
                    name="companyName"
                    value={form.companyName}
                    onChange={handleChange}
                  />
                </div>

                {/* Nome */}
                <div className={classes.fieldRow}>
                  <User className={classes.icon} />
                  <TextField
                    fullWidth
                    label="Nome"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                  />
                </div>

                {/* Email */}
                <div className={classes.fieldRow}>
                  <Mail className={classes.icon} />
                  <TextField
                    fullWidth
                    label="E-mail"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>
              </Grid>

              {/* COLUNA DIREITA */}
              <Grid item xs={12} md={6}>
                {/* Senha */}
                <div className={classes.fieldRow}>
                  <Lock className={classes.icon} />
                  <TextField
                    fullWidth
                    label="Senha"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                  />
                </div>

                {/* Telefone */}
                <div className={classes.fieldRow}>
                  <Phone className={classes.icon} />
                  <TextField
                    fullWidth
                    label="Telefone"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>

                {/* Plano */}
                <div className={classes.fieldRow}>
                  <CreditCard className={classes.icon} />
                  <FormControl fullWidth>
                    <InputLabel>Plano</InputLabel>
                    <Select
                      name="planId"
                      value={form.planId}
                      onChange={handleChange}
                    >
                      {plans.map((plan) => (
                        <MenuItem key={plan.id} value={plan.id}>
                          {plan.name} | Atendentes: {plan.users} | Whats: {plan.connections} | Filas: {plan.queues} | R$ {plan.amount}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
              </Grid>
            </Grid>

            {/* BOTÃO */}
            <button
              type="submit"
              className="w-full bg-[#0b88e8] hover:bg-[#0b68b0] text-white font-medium py-3 rounded-lg transition mt-4"
            >
              Criar conta
            </button>

            <p className="text-center text-[#666] text-sm mt-6">
              Já possui uma conta?{" "}
              <RouterLink
                to="/login"
                className="text-[#0b88e8] hover:underline font-medium"
              >
                Entrar
              </RouterLink>
            </p>
          </form>
        </div>
      </Container>

      <footer className={classes.footer}>
        AtendeTicket 2025 © Todos os direitos reservados
      </footer>
    </div>
  );
};

export default SignUp;
