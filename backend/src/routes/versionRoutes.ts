import { Router } from "express";
import axios from "axios";
import * as VerssionController from "../controllers/VersionController";
import * as VerssionJSONController from "../controllers/VersionJSONController";

const versionRouter = Router();

// ✅ ROTAS EXISTENTES (NÃO MEXER)
versionRouter.get("/version", VerssionController.index);
versionRouter.post("/version", VerssionController.store);

// ✅ NOVA ROTA – versão vinda da requisição
versionRouter.get("/version/package", VerssionJSONController.checkPackageUpdate);

export default versionRouter;
