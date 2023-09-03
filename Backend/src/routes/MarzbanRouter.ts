import { Router } from "express";

import MarzbanController from "../controllers/MarzbanController";

const router = Router();

router.post("/logintomarzban", MarzbanController.LoginToMarzbanAPI);
router.get("/accounts/:username", MarzbanController.GetAccounts);
router.post("/account", MarzbanController.AddAccount);
router.delete("/account/:username", MarzbanController.RemoveAccount);

export default router;
