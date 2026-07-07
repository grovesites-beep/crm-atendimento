import React, { useState, useEffect } from "react";
import { Mail, ArrowLeft, BotMessageSquare, Loader2, CheckCircle } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import { Helmet } from "react-helmet";
import api from "../../services/api";
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

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [branding, setBranding] = useState({
    loginLogo: "/logo.png",
    loginBackground: "#e8f1f5ff",
    loginWhatsapp: "https://wa.me/5541992098329",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setProgress(20);

    const interval = setInterval(() => {
      setProgress((old) => (old < 90 ? old + 10 : old));
    }, 300);

    try {
      await api.post("/auth/forgot-password", { email });
      setProgress(100);
      setSuccess(true);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    } catch (err) {
      console.error("Erro ao solicitar redefinição de senha", err);
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Redefinir Senha - AtendeTicket</title>
      </Helmet>

      <div className="min-h-screen bg-[#f5f5f5] flex flex-col">
        <main className="flex-1 flex items-center justify-center p-4 relative">
          <div className="bg-background rounded-lg shadow-lg overflow-hidden flex flex-col lg:flex-row max-w-4xl w-full">
            <div
              className="p-8 lg:p-12 flex flex-col items-center justify-center lg:w-1/2"
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
                Esqueceu sua senha?
              </h2>
              <p className="text-[#444] text-center text-sm">
                Informe seu e-mail para receber as instruções de redefinição
              </p>
            </div>

            <div className="p-8 lg:p-12 lg:w-1/2 flex flex-col justify-center">
              {!success ? (
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <label className="block text-sm font-medium text-[#333] mb-2">
                      E-mail
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999] w-5 h-5" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-[#ddd] rounded-lg focus:outline-none focus:border-[#0b88e8]"
                        placeholder="Digite seu e-mail"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#0b88e8] hover:bg-[#0b68b0] text-white font-medium py-3 rounded-lg transition disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Enviando e-mail...
                      </>
                    ) : (
                      "Enviar instruções"
                    )}
                  </button>

                  {loading && (
                    <div className="w-full h-2 bg-[#ddd] rounded overflow-hidden">
                      <div
                        className="h-full bg-[#0b88e8] transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}

                  <RouterLink
                    to="/login"
                    className="flex items-center justify-center gap-2 text-sm text-[#0b88e8] hover:underline"
                  >
                    <ArrowLeft size={16} /> Voltar para o login
                  </RouterLink>
                </form>
              ) : (
                <div className="text-center space-y-4 flex flex-col items-center">
                  <CheckCircle className="w-16 h-16 text-green-500" />
                  <p className="text-[#333] font-medium">
                    Se o e-mail estiver cadastrado, você receberá as instruções em breve.
                  </p>
                  <RouterLink
                    to="/login"
                    className="text-[#0b88e8] hover:underline"
                  >
                    Voltar para o login
                  </RouterLink>
                </div>
              )}
            </div>
          </div>

          {loading && (
            <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded-xl shadow flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#0b88e8]" />
                <span className="text-sm text-[#333]">Enviando e-mail...</span>
              </div>
            </div>
          )}
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

        {showToast && (
          <div className="fixed top-6 right-6 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50">
            <CheckCircle size={20} />
            E-mail enviado com sucesso!
          </div>
        )}
      </div>
    </>
  );
};

export default ResetPassword;