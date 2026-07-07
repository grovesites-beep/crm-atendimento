import { Request, Response } from "express";
import axios from "axios";
// Verifica se há atualização no pacote remoto
export const checkPackageUpdate = async (req: Request, res: Response): Promise<Response> => {
  try {
    // 🔹 versão atual vinda do frontend
    const currentVersion = req.headers["x-app-version"] as string || req.query.version as string;

    if (!currentVersion) {
      return res.status(400).json({
        error: "Versão atual não informada"
      });
    }

    const { data } = await axios.get(
      "https://atendeticket-version.felipeferronatokrokoiz.workers.dev/version.json",
      { timeout: 5000 }
    );

    const latestVersion = data.version;

    return res.json({
      hasUpdate: currentVersion !== latestVersion,
      currentVersion,
      latestVersion,
      mandatory: data.mandatory || false,
      changelog: data.changelog || []
    });

  } catch (error: any) {
    console.error("Erro ao verificar atualização:", error.message);

    return res.status(500).json({
      error: "Não foi possível verificar atualizações"
    });
  }
};
