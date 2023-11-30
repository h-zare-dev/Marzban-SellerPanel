import { Router } from "express";

import MarzbanController from "../controllers/MarzbanController";

const router = Router();

router.post("/logintomarzban", MarzbanController.LoginToMarzbanAPI);
router.get("/accounts/:seller", MarzbanController.GetAccounts);
router.post("/account", MarzbanController.AddAccount);
router.put("/account", MarzbanController.EditAccount);
router.post("/disableaccount/:username", MarzbanController.DisableAccount);
router.post("/renewaccount/:seller", MarzbanController.RenewAccount);
router.delete("/account/:username", MarzbanController.RemoveAccount);

export default router;
