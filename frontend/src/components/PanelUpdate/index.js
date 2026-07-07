import React, { useState } from "react";
import { Button, Tooltip, CircularProgress } from "@material-ui/core";
import { Download } from "lucide-react";
import { toast } from "react-toastify";

import api from "../../services/api";
import toastError from "../../errors/toastError";

const PanelUpdate = () => {
  const [loading, setLoading] = useState(false);

  const handleCheckUpdate = async () => {
    try {
      setLoading(true);

      const { data } = await api.get("/version/package", {
        headers: {
          "X-App-Version": process.env.REACT_APP_VERSION
        }
      });

      if (data.hasUpdate) {
        toast.info(
          <>
            🚀 <strong>Nova versão disponível!</strong><br />
            Atual: {data.currentVersion}<br />
            Nova: {data.latestVersion}
          </>
        );
      } else {
        toast.success("✅ Seu painel já está atualizado!");
      }

    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tooltip title="Verificar atualizações" arrow>
      <span>
        <Button
          color="inherit"
          onClick={handleCheckUpdate}
          disabled={loading}
          style={{ color: "white" }}
        >
          {loading ? (
            <CircularProgress size={22} color="inherit" />
          ) : (
            <Download />
          )}
        </Button>
      </span>
    </Tooltip>
  );
};

export default PanelUpdate;
