import { RequestHandler } from "express";
import axios from "axios";
import { Types } from "mongoose";
import { v4 as uuidv4 } from "uuid";

import Helper from "../utils/Helper";
import Account from "../models/Account";
import Seller from "../models/Seller";
import Tariff from "../models/Tariff";

interface MarzbanAccount {
  username: string;
  data_limit: number;
  used_traffic: number;
  expire: number;
  status: string;
  subscription_url: string;
  online_at: string;
  sub_updated_at: string;
  sub_last_user_agent: string;
}

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
        Password: password,
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
        res.status(500).json({ Message: "Invalid Account Information" });
      }
    } catch (error) {
      next(error);
    }
  };

  static GetAccounts: RequestHandler = async (req, res, next) => {
    try {
      const apiURL = Helper.GetMarzbanURL() + "/api/users";

      console.log(
        "Start Getting From Marzban",
        new Date().toLocaleTimeString()
      );

      const config = {
        headers: { Authorization: req.headers.authorization },
        params: {
          // offset: 0,
          // limit: 10,
          username: req.params.seller,
        },
      };

      const result: {
        data: {
          users: MarzbanAccount[];
        };
      } = await axios.get(apiURL, config);

      console.log("End Getting From Marzban", new Date().toLocaleTimeString());

      console.log(
        "Start Getting From MongoDB",
        new Date().toLocaleTimeString()
      );
      const seller = await Seller.findOne({ Title: req.params.seller });

      const sellerAccounts = await Account.find({
        Seller: new Types.ObjectId(seller?._id),
      });

      console.log("End Getting From MongoDB", new Date().toLocaleTimeString());
      const accounts = sellerAccounts.map((item) => {
        const marzbanAccount = result.data.users.filter(
          (account) => account.username == item.Username
        )[0];

        if (!marzbanAccount)
          return {
            id: item._id,
            username: item.Username,
            tarif: item.Tariff,
            payed: item.Payed ? "Paid" : "Unpaid",
          };

        return {
          id: item._id,
          counter: +marzbanAccount.username.replace(req.params.seller, ""),
          username: marzbanAccount.username,
          tarif: item.Tariff,
          data_limit: marzbanAccount.data_limit,
          data_limit_string: Helper.CalculateTraffic(marzbanAccount.data_limit),
          used_traffic: marzbanAccount.used_traffic,
          used_traffic_string: Helper.CalculateTraffic(
            marzbanAccount.used_traffic
          ),
          expire: marzbanAccount.expire,
          expire_string: Helper.CalculateRemainDate(marzbanAccount.expire),
          status: marzbanAccount.status,
          subscription_url: marzbanAccount.subscription_url.includes("https")
            ? marzbanAccount.subscription_url
            : Helper.GetSubscriptionURL() + marzbanAccount.subscription_url,
          online: Helper.IsOnline(marzbanAccount.online_at),
          online_at: Helper.CalculateOnlineDate(marzbanAccount.online_at),
          sub_updated_at: Helper.CalculateOnlineDate(
            marzbanAccount.sub_updated_at
          ),
          sub_last_user_agent: marzbanAccount.sub_last_user_agent,
          payed: item.Payed ? "Paid" : "Unpaid",
        };
      });

      const filteredAccounts = accounts
        .filter((acc) => acc.data_limit)
        .sort((a, b) => {
          if (a.counter && b.counter) {
            if (a.counter > b.counter) return -1;
            if (a.counter < b.counter) return 1;
          }
          return 0;
        });

      console.log(
        "End Getting All --------------------",
        new Date().toLocaleTimeString()
      );
      res.status(200).json(filteredAccounts);
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

  static RenewAccount: RequestHandler = async (req, res, next) => {
    try {
      const { tariffId, username } = req.body as {
        tariffId: string;
        username: string;
      };

      if (username && username === "") {
        res.status(404).json("Username not Found");
        return;
      }

      if (tariffId && tariffId === "") {
        res.status(404).json("TariffId not Found");
        return;
      }

      const tariff = await Tariff.findOne({
        _id: new Types.ObjectId(tariffId),
      });

      if (!tariff) {
        res.status(404).json("Tariff not Found");
        return;
      }

      const seller = await Seller.findOne({ Title: req.params.seller });

      if (!seller) {
        res.status(404).json("Seller not Found");
        return;
      }

      const currentDate = new Date();

      currentDate.setDate(currentDate.getDate() + (tariff.Duration ?? 0));
      currentDate.setHours(23, 59, 59);

      const expireTimestamp = Math.floor(currentDate.getTime() / 1000);

      let apiURL = Helper.GetMarzbanURL() + "/api/user/" + username;
      const result = await axios.put(
        apiURL,
        {
          expire: expireTimestamp,
          data_limit: (tariff?.DataLimit ?? 0) * 1024 * 1024 * 1024,
        },
        {
          headers: { Authorization: req.headers.authorization },
        }
      );

      apiURL = Helper.GetMarzbanURL() + "/api/user/" + username + "/reset";
      const resultReset = await axios.post(
        apiURL,
        {},
        {
          headers: { Authorization: req.headers.authorization },
        }
      );

      const account = new Account();
      account.Username = username;
      account.Seller = seller._id;
      account.Tariff = tariff.Title;
      account.Payed = false;
      await account.save();

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
