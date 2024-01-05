import { RequestHandler } from "express";
import Tariff from "../models/Tariff";
import { Types } from "mongoose";

class TariffController {
  static GetTariffList: RequestHandler = async (req, res, next) => {
    try {
      let condition = {};
      if (req.params.isall === "false") condition = { IsVisible: true };
      const result = await Tariff.find(condition);
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
      const { Title, DataLimit, Duration, IsFree, IsVisible } = req.body as {
        Title: string | undefined;
        DataLimit: number | undefined;
        Duration: number | undefined;
        IsFree: boolean | undefined;
        IsVisible: boolean | undefined;
      };
      const tariff = new Tariff({
        Title: Title,
        DataLimit: DataLimit,
        Duration: Duration,
        IsFree: IsFree,
        IsVisible: IsVisible,
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

  static DisableTariff: RequestHandler = async (req, res, next) => {
    try {
      const _id = new Types.ObjectId(req.params.id);

      const tariff = await Tariff.findOne({ _id: _id });

      if (tariff) {
        tariff.IsVisible = !tariff.IsVisible;
        await tariff.save();

        res.status(200).json({ result: "Tariff Disabled!" });
      }
    } catch (error) {
      next(error);
    }
  };
}
export default TariffController;
