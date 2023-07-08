import { Router } from "express";

import MarzbanController from "../controllers/MarzbanController";

const router = Router();

router.get("/logintomarzban", MarzbanController.LoginToMarzbanAPI);
router.get("/accounts", MarzbanController.GetAccounts);
router.post("/account", MarzbanController.AddAccount);
router.delete("/account/:username", MarzbanController.RemoveAccount);

export default router;
