import { RequestHandler } from "express";
import { Types } from "mongoose";

import Seller from "../models/Seller";
import ConfigFile from "../utils/Config";
import axios from "axios";
import AccountHelpers from "../utils/AccountHelpers";

class SellerController {
  static GetSellerList: RequestHandler = async (req, res, next) => {
    try {
      if (await AccountHelpers.CheckToken(req.headers.authorization)) {
        const result = await Seller.find();
        res.status(200).json(result);
        return;
      }
      res.status(404).json("Invalid Token");
    } catch (error) {
      next(error);
    }
  };

  static GetSeller: RequestHandler = async (req, res, next) => {
    try {
      const id: string = req.params.id;

      const seller = await Seller.findOne({ _id: new Types.ObjectId(id) });

      if (!seller) throw new Error("Seller not found!");

      res.status(200).json(seller);
    } catch (error) {
      next(error);
    }
  };

  static AddSeller: RequestHandler = async (req, res, next) => {
    try {
      const {
        Title,
        Limit,
        Username,
        Password,
        MarzbanUsername,
        MarzbanPassword,
      } = req.body as {
        Title: string | undefined;
        Limit: string;
        Username: string | undefined;
        Password: string | undefined;
        MarzbanUsername: string | undefined;
        MarzbanPassword: string | undefined;
      };

      if (!(await AccountHelpers.CheckToken(req.headers.authorization)))
        throw new Error("Invalid Token");

      try {
        const apiURL = (await ConfigFile.GetMarzbanURL()) + "/api/admin/token";

        const config = {
          headers: { "content-type": "application/x-www-form-urlencoded" },
        };

        const resultLogin = await axios.post(
          apiURL,
          {
            username: MarzbanUsername,
            password: MarzbanPassword,
          },
          config
        );
      } catch (AxiosError) {
        res.status(404).json({ Message: "Invalid Account Information" });
        return;
      }

      const seller = new Seller({
        Title: Title,
        Limit: +Limit,
        Username: Username,
        Password: Password,
        MarzbanUsername: MarzbanUsername,
        MarzbanPassword: MarzbanPassword,
      });

      const result = await seller.save();

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  static EditSeller: RequestHandler = async (req, res, next) => {
    try {
      const id: string = req.params.id;

      if (!(await AccountHelpers.CheckToken(req.headers.authorization)))
        throw new Error("Invalid Token");

      const { Title, Username, Password } = req.body as {
        Title: string | undefined;
        Username: string | undefined;
        Password: string | undefined;
      };

      const sellers = await Seller.find();

      const find = sellers.find((seller) =>
        Title?.toLowerCase().includes(seller.Title.toLowerCase())
      );

      if (find) {
        throw new Error("Title Is Exists!");
      }
      const seller = new Seller({
        Title: Title,
        Username: Username,
        Password: Password,
      });

      const error = seller.validateSync();

      if (error) throw new Error(error.message);

      await Seller.updateOne(
        { _id: id },
        {
          Title: Title,
          Username: Username,
          Password: Password,
        }
      );
    } catch (error) {
      next(error);
    }
  };

  static RemoveSeller: RequestHandler = async (req, res, next) => {
    try {
      const id: string = req.params.id;

      if (!(await AccountHelpers.CheckToken(req.headers.authorization)))
        throw new Error("Invalid Token");

      const result = await Seller.deleteOne({ _id: new Types.ObjectId(id) });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  static DisableSeller: RequestHandler = async (req, res, next) => {
    try {
      const _id = new Types.ObjectId(req.params.id);

      const seller = await Seller.findOne({ _id: _id });

      if (seller) {
        if (seller.Status == "Active") seller.Status = "Deactive";
        else seller.Status = "Active";

        await seller.save();

        res.status(200).json({ result: "Seller Changed!" });
      }
    } catch (error) {
      next(error);
    }
  };
}
export default SellerController;
