import { Router } from "express";
import { analizar, getAST, getSimbolos } from "../controllers/parser.controller";

const router = Router();

router.post("/analizar", analizar);
router.post("/ast", getAST);
router.post("/simbolos", getSimbolos);

export default router;