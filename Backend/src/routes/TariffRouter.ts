import { Router } from "express";

import TariffController from "../controllers/TariffController";

const router = Router();

router.get("/tariffs", TariffController.GetTariffList);
// router.get("/tariff:id", TariffController.GetTariff);
// router.post("/tariff", TariffController.AddTariff);
// router.put("/tariff:id", TariffController.EditTariff);
// router.delete("/tariff:id", TariffController.RemoveTariff);

export default router;
