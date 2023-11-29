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

      username = username.trim();
      password = password.trim();

      const seller = await Seller.findOne({
        Username: username,
      });

      if (seller) {
        const accounts = await Account.find({ Seller: seller, Payed: false });

        let totalUnpaid = 0;
        accounts.map((account) => {
          const limit = +account.Tariff.split("GB")[0];
          if (limit) totalUnpaid += limit;
        });

        const resultLogin: { data: { access_token: string } } =
          await axios.post(
            apiURL,
            {
              username: Helper.GetMarzbanUsername(),
              password: Helper.GetMarzbanPassword(),
            },
            config
          );

        res.status(200).json({
          Token: resultLogin.data.access_token,
          Username: seller.Title,
          Limit: seller.Limit - totalUnpaid,
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
            online_at: string;
            sub_updated_at: string;
            sub_last_user_agent: string;
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
          tarif: resultpayed[0].Tariff,
          data_limit: item.data_limit,
          data_limit_string: Helper.CalculateTraffic(item.data_limit),
          used_traffic: item.used_traffic,
          used_traffic_string: Helper.CalculateTraffic(item.used_traffic),
          expire: item.expire,
          expire_string: Helper.CalculateRemainDate(item.expire),
          status: item.status,
          subscription_url: Helper.GetSubscriptionURL() + item.subscription_url,
          online: Helper.IsOnline(item.online_at),
          online_at: Helper.CalculateOnlineDate(item.online_at),
          sub_updated_at: Helper.CalculateOnlineDate(item.sub_updated_at),
          sub_last_user_agent: item.sub_last_user_agent,
          payed: resultpayed[0]
            ? resultpayed[0].Payed
              ? "Paid"
              : "Unpaid"
            : "Unpaid",
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

  static EditAccount: RequestHandler = async (req, res, next) => {
    try {
      const apiURL =
        Helper.GetMarzbanURL() + "/api/user/" + req.params.username;

      const { status } = req.body as {
        status: string;
      };

      if (req.params.username && req.params.username === "") {
        res.status(404).json("Username not Found");
        return;
      }

      const result = await axios.put(
        apiURL,
        {
          // proxies: {},
          // inbounds: {},
          status: status,
          // note: "",
          // data_limit_reset_strategy: "no_reset",
          // on_hold_timeout: "",
          // on_hold_expire_duration: 0,
        },
        {
          headers: { Authorization: req.headers.authorization },
        }
      );

      res.status(200).json(result.data);
    } catch (error) {
      next(error);
    }
  };

  static DisableAccount: RequestHandler = async (req, res, next) => {
    try {
      const apiURL =
        Helper.GetMarzbanURL() + "/api/user/" + req.params.username;

      const { status } = req.body as {
        status: string;
      };

      if (req.params.username && req.params.username === "") {
        res.status(404).json("Username not Found");
        return;
      }

      const result = await axios.put(
        apiURL,
        {
          status: status,
        },
        {
          headers: { Authorization: req.headers.authorization },
        }
      );

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

        if (used_traffic < 1.2) {
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
