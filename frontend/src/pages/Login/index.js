import React, { useState, useEffect, useContext } from "react";
import { Mail, Lock, Eye, EyeOff, BotMessageSquare } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";

import { Helmet } from "react-helmet";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import { i18n } from "../../translate/i18n";
import defaultLoginLogo from "../../assets/login-logo-default.png";

const backendUrl = process.env.REACT_APP_BACKEND_URL || "";

const resolveImageUrl = (value, fallback) => {
  if (!value) return fallback;
  if (value.startsWith("http")) return value;
  if (!backendUrl) return value;
  const base = backendUrl.replace(/\/+$/, "");
  const clean = value.replace(/^\/+/, "");
  return `${base}/${clean}`;
};

const Login = () => {
  const { handleLogin } = useContext(AuthContext);

  const [branding, setBranding] = useState({
    loginLogo: "/logo.png",
    loginBackground: "#91eeffff",
    loginWhatsapp: "https://wa.me/5519997530219",
  });
  const [user, setUser] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [userCreationEnabled, setUserCreationEnabled] = useState(true);

  useEffect(() => {
    try {
      localStorage.setItem("theme", "light");
    } catch { }
    document.documentElement.classList.remove("dark");
    document.body.classList.add("login-page");

    return () => document.body.classList.remove("login-page");
  }, []);

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const { data } = await api.get("/global-config/public-branding");
        setBranding({
          loginLogo: data.loginLogo || "/logo.png",
          loginBackground: "#e8f1f5ff",
          loginWhatsapp: data.loginWhatsapp || "https://wa.me/5541992098329",
        });
      } catch (err) {
        console.error("Erro ao carregar branding:", err);
      }
    };

    fetchBranding();
  }, []);

  useEffect(() => {
    const fetchUserCreationStatus = async () => {
      try {
        const { data } = await api.get("/settings/userCreation");
        setUserCreationEnabled(data.userCreation === "enabled");
      } catch {
        setUserCreationEnabled(false);
      }
    };

    fetchUserCreationStatus();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const lang = localStorage.getItem("i18nextLng") || "pt";
    i18n.changeLanguage(lang);
    handleLogin(user);
  };

  return (
    <>
      <Helmet>
        <title>Login - AtendeTicket</title>
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      </Helmet>
      <div className="min-h-screen bg-[#f5f5f5] flex flex-col">
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg shadow-lg overflow-hidden flex flex-col lg:flex-row max-w-4xl w-full">
            <div
              className="p-8 lg:p-12 flex flex-col itemss-center justify-center lg:w-1/2"
              style={{ backgroundColor: branding.loginBackground }}
            >
              <div className="w-full max-w-[300px] mb-6 bg-white/80 p-3 rounded-xl shadow">
                <img
                  src={resolveImageUrl(branding.loginLogo, defaultLoginLogo)}
                  alt="Logo"
                  className="w-full h-auto"
                />
              </div>
              <h2 className="text-xl font-bold text-[#333] text-center mb-2">
                Bem-vindo de volta!
              </h2>
              <p className="text-[#444] text-center text-sm">
                Acesse sua conta para continuar utilizando o nosso sistema
              </p>
            </div>

            <div className="p-8 lg:p-12 lg:w-1/2 flex flex-col">
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-medium text-[#333] mb-2">
                    E-mail
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999] w-5 h-5" />
                    <input
                      type="email"
                      value={user.email}
                      onChange={(e) => setUser({ ...user, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-[#ddd] rounded-lg focus:outline-none focus:border-[#0b88e8]"
                      placeholder="Digite seu e-mail"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-[#333]">
                      Senha
                    </label>
                    <RouterLink
                      to="/forgot-password"
                      className="text-sm text-[#0b88e8] hover:underline"
                    >
                      Esqueceu sua senha?
                    </RouterLink>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999] w-5 h-5" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={user.password}
                      onChange={(e) => setUser({ ...user, password: e.target.value })}
                      className="w-full pl-10 pr-12 py-3 border border-[#ddd] rounded-lg focus:outline-none focus:border-[#0b88e8]"
                      placeholder="Digite sua senha"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999]"
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={user.remember}
                    onChange={(e) =>
                      setUser({ ...user, remember: e.target.checked })
                    }
                  />
                  <span className="text-[#333]">Lembrar de mim</span>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#0b88e8] hover:bg-[#0b68b0] text-white font-medium py-3 rounded-lg transition"
                >
                  Entrar
                </button>
              </form>

              {userCreationEnabled && (
                <p className="text-center text-[#666] text-sm mt-6">
                  É novo aqui?{" "}
                  <RouterLink
                    to="/signup"
                    className="text-[#0b88e8] hover:underline font-medium"
                  >
                    Crie sua conta
                  </RouterLink>
                </p>
              )}
            </div>
          </div>
        </main>

        <button
          onClick={() => window.open(branding.loginWhatsapp)}
          className="fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-xl flex items-center justify-center text-white hover:scale-110 transition animate-pulse bg-customBlue"
        >
          <BotMessageSquare size={32} />
        </button>

        <footer className="py-4 text-center text-[#666] text-sm border-t border-[#ddd] bg-background">
          AtendeTicket 2025 © Todos os direitos reservados
        </footer>
      </div>
    </>
  );
};

export default Login;
