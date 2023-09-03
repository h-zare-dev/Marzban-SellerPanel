import { RequestHandler } from "express";
import axios from "axios";
import { Types } from "mongoose";
import { v4 as uuidv4 } from "uuid";

import Helper from "../utils/Helper";
import Account from "../models/Account";
import Seller from "../models/Seller";
import Tariff from "../models/Tariff";

class MarzbanController {
  static LoginToMarzbanAPI: RequestHandler = async (req, res, next) => {
    try {
      const apiURL = Helper.GetMarzbanURL() + "/api/admin/token";

      const config = {
        headers: { "content-type": "application/x-www-form-urlencoded" },
      };

      let { username, password } = req.body as {
        username: string;
        password: string;
      };

      username = username.toLowerCase().trim();
      password = password.trim();

      const resultLogin = await Seller.findOne({
        Username: username,
        Password: password,
      });

      if (resultLogin) {
        const result: { data: { access_token: string } } = await axios.post(
          apiURL,
          {
            username: Helper.GetMarzbanUsername(),
            password: Helper.GetMarzbanPassword(),
          },
          config
        );

        res.status(200).json({
          Token: result.data.access_token,
          Username: resultLogin.Title,
        });
      } else {
        res.status(500).json({ Message: "something is wrong!" });
      }
    } catch (error) {
      next(error);
    }
  };

  static GetAccounts: RequestHandler = async (req, res, next) => {
    try {
      const apiURL = Helper.GetMarzbanURL() + "/api/users";

      const config = {
        headers: { Authorization: req.headers.authorization },
        params: {
          // offset: 0,
          // limit: 100,
          username: req.params.username,
        },
      };

      const result: {
        data: {
          users: {
            username: string;
            data_limit: number;
            used_traffic: number;
            expire: number;
            status: string;
            subscription_url: string;
          }[];
        };
      } = await axios.get(apiURL, config);

      const sellerAccount = await Account.find();

      const accounts = result.data.users.map((item) => {
        const resultpayed = sellerAccount.filter(
          (account) => account.Username == item.username
        );

        return {
          id: resultpayed[0] ? resultpayed[0]._id : Math.random().toString(),
          username: item.username,
          data_limit: Helper.CalculateTraffic(item.data_limit),
          used_traffic: Helper.CalculateTraffic(item.used_traffic),
          expire: Helper.CalculateRemainDate(item.expire),
          status: item.status,
          subscription_url: Helper.GetMarzbanURL() + item.subscription_url,
          payed: resultpayed[0]
            ? resultpayed[0].Payed
              ? "Payed"
              : "No Pay"
            : "No",
        };
      });

      res.status(200).json(accounts);
    } catch (error) {
      next(error);
    }
  };

  static AddAccount: RequestHandler = async (req, res, next) => {
    try {
      const apiURL = Helper.GetMarzbanURL() + "/api/user";

      const { username, tariffId } = req.body as {
        username: string;
        tariffId: string;
      };

      if (tariffId && tariffId === "") {
        res.status(404).json("TariffId not Found");
        return;
      }

      if (username && username === "") {
        res.status(404).json("Username not Found");
        return;
      }

      const vlessUUID = uuidv4();
      const vmessUUID = uuidv4();

      const getInbound = await this.GetInbounds(req.headers.authorization);

      const tariff = await Tariff.findOne({
        _id: new Types.ObjectId(tariffId),
      });

      if (!tariff) {
        res.status(404).json("Tariff not Found");
        return;
      }

      const seller = await Seller.findOne({ Title: username });

      if (!seller) {
        res.status(404).json("Seller not Found");
        return;
      }

      seller.Counter++;

      const currentDate = new Date();

      currentDate.setDate(currentDate.getDate() + (tariff.Duration ?? 0));
      currentDate.setHours(23, 59, 59);

      const expireTimestamp = Math.floor(currentDate.getTime() / 1000);

      const generateUsername =
        username + seller?.Counter.toString().padStart(3, "0");

      let inbounds: { vmess?: string[]; vless?: string[]; trojan?: string[] } =
        {};
      let proxies: {
        vmess?: { id: string };
        vless?: { id: string; flow: string };
        trojan?: { password: string };
      } = {};

      if (getInbound.vmess) {
        proxies = {
          ...proxies,
          vmess: {
            id: vmessUUID,
          },
        };
        inbounds = { ...inbounds, vmess: getInbound.vmess };
      }

      if (getInbound.vless) {
        proxies = {
          ...proxies,
          vless: {
            id: vlessUUID,
            flow: "xtls-rprx-vision",
          },
        };
        inbounds = { ...inbounds, vless: getInbound.vless };
      }

      if (getInbound.trojan) {
        proxies = {
          ...proxies,
          trojan: {
            password: Helper.GenerateRandomPassword(12),
          },
        };
        inbounds = { ...inbounds, trojan: getInbound.trojan };
      }

      const result = await axios.post(
        apiURL,
        {
          username: generateUsername,
          proxies: proxies,
          inbounds: inbounds,
          expire: expireTimestamp,
          data_limit: (tariff?.DataLimit ?? 0) * 1024 * 1024 * 1024,
        },
        {
          headers: { Authorization: req.headers.authorization },
        }
      );

      const account = new Account();
      account.Username = generateUsername;
      account.Seller = seller._id;
      account.Tariff = tariff.Title;
      account.Payed = false;
      await account.save();

      await seller.save();

      res.status(200).json(result.data);
    } catch (error) {
      next(error);
    }
  };

  static RemoveAccount: RequestHandler = async (req, res, next) => {
    try {
      const apiURL =
        Helper.GetMarzbanURL() + "/api/user/" + req.params.username;

      const resultget = await axios.get(apiURL, {
        headers: { Authorization: req.headers.authorization },
      });

      if (resultget.status == 200 && resultget.data) {
        const used_traffic =
          (resultget?.data?.used_traffic ?? 0) / (1024 * 1024 * 1024);

        if (used_traffic < 1.0) {
          const result = await axios.delete(apiURL, {
            headers: { Authorization: req.headers.authorization },
          });

          if (result.status == 200) {
            const result = await Account.findOneAndRemove({
              Username: req.params.username,
            });

            if (result?.Username !== req.params.username)
              throw new Error("User Not Found");
          }

          res.status(200).json({ message: "Delete Success!" });
        }
      }
    } catch (error) {
      next(error);
    }
  };

  static GetInbounds = async (authorization: string | undefined) => {
    let vmesses: string[] | undefined = undefined;
    let vlesses: string[] | undefined = undefined;
    let trojans: string[] | undefined = undefined;

    const apiURL = Helper.GetMarzbanURL() + "/api/inbounds";

    const result = await axios.get(apiURL, {
      headers: { Authorization: authorization },
    });
    if (result && result.status == 200) {
      const inbounds = result.data as {
        vmess: { tag: string }[];
        vless: { tag: string }[];
        trojan: { tag: string }[];
      };
      if (inbounds.vmess) vmesses = inbounds.vmess.map((vmess) => vmess.tag);
      if (inbounds.vless) vlesses = inbounds.vless.map((vless) => vless.tag);
      if (inbounds.trojan)
        trojans = inbounds.trojan.map((trojan) => trojan.tag);

      return { vmess: vmesses, vless: vlesses, trojan: trojans };
    }
    throw new Error("No Inbound Found!!");
  };
}

export default MarzbanController;
