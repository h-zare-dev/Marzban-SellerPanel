import { RequestHandler } from "express";
import Tariff from "../models/Tariff";

class TariffController {
  static GetTariffList: RequestHandler = async (req, res, next) => {
    try {
      const result = await Tariff.find({ IsVisible: true });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  static GetTariff: RequestHandler = (req, res, next) => {
    try {
      res.status(200).json({ result: "Not Implimented!" });
    } catch (error) {
      next(error);
    }
  };

  static AddTariff: RequestHandler = async (req, res, next) => {
    try {
      const { Title, DataLimit, Duration } = req.body as {
        Title: string | undefined;
        DataLimit: number | undefined;
        Duration: number | undefined;
      };
      const tariff = new Tariff({
        Title: Title,
        DataLimit: DataLimit,
        Duration: Duration,
      });

      const result = await tariff.save();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  static EditTariff: RequestHandler = (req, res, next) => {
    try {
      res.status(200).json({ result: "" });
    } catch (error) {
      next(error);
    }
  };

  static RemoveTariff: RequestHandler = (req, res, next) => {
    try {
      res.status(200).json({ result: "" });
    } catch (error) {
      next(error);
    }
  };
}
export default TariffController;
