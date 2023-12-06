import { RequestHandler } from "express";
import { Types } from "mongoose";

import Account from "../models/Account";

class AccountController {
  static GetAccountList: RequestHandler = async (req, res, next) => {
    try {
      const result = await Account.find();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  static GetAccount: RequestHandler = async (req, res, next) => {
    try {
      const id: string = req.params.id;

      const account = await Account.findOne({ _id: new Types.ObjectId(id) });

      if (!account) throw new Error("Account not found!");

      res.status(200).json(account);
    } catch (error) {
      next(error);
    }
  };

  static AddAccount: RequestHandler = async (req, res, next) => {
    try {
      const { Username, Tariff, SellerID } = req.body as {
        Username: string | undefined;
        Tariff: string | undefined;
        SellerID: string | undefined;
      };
      const account = new Account({
        Username: Username,
        Tariff: Tariff,
        Seller: new Types.ObjectId(SellerID),
      });

      const result = await account.save();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
  static RemoveAccount: RequestHandler = async (req, res, next) => {
    try {
      const id: string = req.params.id;

      const result = await Account.deleteOne({ _id: new Types.ObjectId(id) });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
  static PayAccount: RequestHandler = async (req, res, next) => {
    try {
      const accountNames = req.body as {
        Username: string;
      }[];

      for (const acc of accountNames) {
        const accounts = await Account.find({
          Username: acc.Username,
          Payed: false,
        });

        if (accounts)
          for (const account of accounts) {
            account.Payed = true;
            await account.save();
          }
      }

      res.status(200).json("Pay Success!");
    } catch (error) {
      next(error);
    }
  };
}
export default AccountController;
