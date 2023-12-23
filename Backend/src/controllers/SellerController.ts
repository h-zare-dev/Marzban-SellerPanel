import { RequestHandler } from "express";
import { Types } from "mongoose";

import Seller from "../models/Seller";
import ConfigFile from "../utils/Config";

class SellerController {
  static GetSellerList: RequestHandler = async (req, res, next) => {
    try {
      const result = await Seller.find();
      res.status(200).json(result);
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
      const { Title, Username, Password } = req.body as {
        Title: string | undefined;
        Username: string | undefined;
        Password: string | undefined;
      };

      const sellerUsername = await ConfigFile.GetSellerUsername();

      if (Username?.toLowerCase() === sellerUsername.toLowerCase())
        throw new Error("Username already Exist!");

      const seller = new Seller({
        Title: Title,
        Username: Username,
        Password: Password,
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

      const { Title, Username, Password } = req.body as {
        Title: string | undefined;
        Username: string | undefined;
        Password: string | undefined;
      };
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

      const result = await Seller.deleteOne({ _id: new Types.ObjectId(id) });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
export default SellerController;
