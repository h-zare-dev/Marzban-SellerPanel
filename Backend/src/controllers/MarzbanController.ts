import { RequestHandler } from "express";
import axios, { Axios, AxiosResponse } from "axios";
import { Document, Types } from "mongoose";
import { v4 as uuidv4 } from "uuid";

import Helper from "../utils/Helper";
import Account from "../models/Account";
import Seller, { ISeller } from "../models/Seller";
import Tariff from "../models/Tariff";
import ConfigFile from "../utils/Config";
import Mongoose from "../utils/Mongoose";

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
  note: string;
}

class MarzbanController {
  static MarzbanAccountsList: Record<string, MarzbanAccount[]> = {};

  static LoginToMarzbanAPI: RequestHandler = async (req, res, next) => {
    try {
      // console.log("Start Login to Marzban ", new Date().toLocaleTimeString());

      const apiURL = (await ConfigFile.GetMarzbanURL()) + "/api/admin/token";

      const config = {
        headers: { "content-type": "application/x-www-form-urlencoded" },
      };

      let { username, password } = req.body as {
        username: string;
        password: string;
      };

      username = username.trim();
      password = password.trim();

      const sellerUsername = await ConfigFile.GetSellerAdminUsername();
      const sellerPassword = await ConfigFile.GetSellerAdminPassword();

      //Login Admin Seller Panel
      if (username.toLowerCase() == sellerUsername.toLowerCase()) {
        if (password !== sellerPassword) {
          res.status(500).json({ Message: "Invalid Account Information" });
          return;
        }
        try {
          const resultLogin = await axios.post(
            apiURL,
            {
              username: await ConfigFile.GetMarzbanUsername(),
              password: await ConfigFile.GetMarzbanPassword(),
            },
            config
          );

          const totalUnpaid = await this.GetTotalUnpaid(undefined, true);

          res.status(200).json({
            Token: resultLogin.data.access_token,
            Username: sellerUsername,
            IsAdmin: true,
            Limit: 0,
            TotalPrice: totalUnpaid.TotalPriceUnpaid,
          });
          return;
        } catch (AxiosError) {
          res.status(500).json({ Message: "Invalid Account Information" });
          return;
        }
      }

      //Login Seller
      const seller = await Seller.findOne({
        Username: username,
        Password: password,
        Status: "Active",
      });

      if (seller) {
        try {
          const resultLogin = await axios.post(
            apiURL,
            {
              username: seller.MarzbanUsername,
              password: seller.MarzbanPassword,
            },
            config
          );

          const totalUnpaid = await this.GetTotalUnpaid(seller, false);

          res.status(200).json({
            Token: resultLogin.data.access_token,
            Username: seller.Title,
            IsAdmin: false,
            Limit: seller.Limit - totalUnpaid.TotalLimitUnpaid,
            TotalPrice: totalUnpaid.TotalPriceUnpaid,
          });
        } catch (AxiosError) {
          res.status(500).json({ Message: "Invalid Account Information" });
          return;
        }
      } else {
        res.status(500).json({ Message: "Invalid Account Information" });
      }
    } catch (error) {
      next(error);
    }
    // finally {
    //   console.log("End Login to Marzban ", new Date().toLocaleTimeString());
    // }
  };

  static GetAccounts: RequestHandler = async (req, res, next) => {
    try {
      // console.log("Start GetAccounts ", new Date().toLocaleTimeString());

      // console.log("Start Getting From Marzban ## " + req.params.seller);
      // console.log(this.MarzbanAccountsList[req.params.seller]);

      if (
        !this.MarzbanAccountsList[req.params.seller] ||
        req.params.seller !== (await ConfigFile.GetSellerAdminUsername())
      )
        await this.GetMarzbanAccountsAndStore(
          req.headers.authorization,
          req.params.seller,
          +req.params.offset,
          +req.params.limit
        );

      const marzbanAccounts = this.MarzbanAccountsList[req.params.seller];

      // console.log("End Getting From Marzban -- " + marzbanAccounts.length);

      const isAll = req.params.isall === "true";

      const sellerAccounts = await this.GetSellerAccounts(
        req.params.seller,
        isAll
      );

      const sellerSubscriptionUrl = await ConfigFile.GetSubscriptionURL();

      const accounts = await Promise.all(
        sellerAccounts.map(async (item) => {
          const marzbanAccount = marzbanAccounts.filter(
            (account: MarzbanAccount) => account.username == item.Username
          )[0];

          const tarrif = await Tariff.findOne({ _id: item.TariffId });

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
            package: item.Tariff,
            price: tarrif?.Price,
            data_limit: marzbanAccount.data_limit,
            data_limit_string: Helper.CalculateTraffic(
              marzbanAccount.data_limit
            ),
            used_traffic: marzbanAccount.used_traffic,
            used_traffic_string: Helper.CalculateTraffic(
              marzbanAccount.used_traffic
            ),
            expire: marzbanAccount.expire,
            expire_string: Helper.CalculateRemainDate(marzbanAccount.expire),
            status: marzbanAccount.status,
            subscription_url: this.GetSubscriptionUrl(
              marzbanAccount.subscription_url,
              sellerSubscriptionUrl
            ),
            online: Helper.IsOnline(marzbanAccount.online_at),
            online_at: Helper.CalculateOnlineDate(marzbanAccount.online_at),
            sub_updated_at: Helper.CalculateUpdateSubscriptionDate(
              marzbanAccount.sub_updated_at
            ),
            sub_last_user_agent: marzbanAccount.sub_last_user_agent,
            payed: item.Payed ? "Paid" : "Unpaid",
            note: marzbanAccount.note,
          };
        })
      );

      const filteredAccounts = accounts
        .filter((acc) => acc.data_limit)
        .reverse();

      // console.log(`End Getting All for ${req.params.seller}`);
      res.status(200).json(filteredAccounts);
    } catch (error) {
      next(error);
    } finally {
      // console.log("End GetAccounts ", new Date().toLocaleTimeString());
    }
  };

  static AddAccount: RequestHandler = async (req, res, next) => {
    try {
      const isValidLicense = await Mongoose.CheckLicense();

      if (!isValidLicense)
        throw new Error("License is not Available or Expired!");

      const apiURL = (await ConfigFile.GetMarzbanURL()) + "/api/user";

      const { username, note, tariffId, onhold } = req.body as {
        username: string;
        note: string;
        tariffId: string;
        onhold: boolean;
      };

      if (!tariffId && tariffId === "") {
        res.status(404).json("TariffId not Found");
        return;
      }

      if (!username && username === "") {
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

      let data_limit: number | undefined = undefined;

      let expireTimestamp: number | undefined = undefined;
      const expireDate = new Date();

      let expireDuration: number | undefined = undefined;
      let onHoldTimeout: Date | undefined = undefined;

      let status: string | undefined = undefined;

      if (tariff.Duration && tariff.Duration > 0)
        if (onhold) {
          expireDuration = (tariff.Duration + 1) * (60 * 60 * 24);

          expireDate.setDate(expireDate.getDate() + 30);
          expireDate.setHours(20, 30, 0);

          onHoldTimeout = expireDate;
          status = "on_hold";
        } else {
          expireDate.setDate(expireDate.getDate() + tariff.Duration);
          expireDate.setHours(20, 30, 0);

          expireTimestamp = Math.floor(expireDate.getTime() / 1000);
        }

      if (tariff.DataLimit && tariff.DataLimit > 0)
        data_limit = tariff.DataLimit * 1024 * 1024 * 1024;

      const generateUsername = await this.GetUsernameAvailable(
        seller,
        username,
        req.headers.authorization
      );
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
        let flow = await ConfigFile.GetMarzbanFlow();
        proxies = {
          ...proxies,
          vless: {
            id: vlessUUID,
            flow: flow == "none" ? "" : flow,
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
          note: note,
          proxies: proxies,
          inbounds: inbounds,
          expire: expireTimestamp,
          data_limit: data_limit,
          on_hold_expire_duration: expireDuration,
          on_hold_timeout: onHoldTimeout,
          status: status,
        },
        {
          headers: { Authorization: req.headers.authorization },
        }
      );

      const account = new Account();
      account.Username = generateUsername;
      account.Seller = seller._id;
      account.Tariff = tariff.Title;
      account.TariffId = tariff._id;
      account.Payed = false;

      await account.save();

      await seller.save();

      delete this.MarzbanAccountsList[seller.Title];

      delete this.MarzbanAccountsList[
        await ConfigFile.GetSellerAdminUsername()
      ];

      res.status(200).json(result.data);
    } catch (error) {
      next(error);
    }
  };

  static EditAccount: RequestHandler = async (req, res, next) => {
    try {
      const apiURL =
        (await ConfigFile.GetMarzbanURL()) + "/api/user/" + req.params.username;

      const { status } = req.body as {
        status: string;
      };

      if (!req.params.username && req.params.username === "") {
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

      const account = await Account.findOne({ Username: req.params.username });

      const seller = await Seller.findOne({ _id: account?.Seller });

      if (seller) delete this.MarzbanAccountsList[seller.Title];

      delete this.MarzbanAccountsList[
        await ConfigFile.GetSellerAdminUsername()
      ];

      res.status(200).json(result.data);
    } catch (error) {
      next(error);
    }
  };

  static DisableAccount: RequestHandler = async (req, res, next) => {
    try {
      const apiURL =
        (await ConfigFile.GetMarzbanURL()) + "/api/user/" + req.params.username;

      const { status } = req.body as {
        status: string;
      };

      if (!req.params.username && req.params.username === "") {
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

      const account = await Account.findOne({ Username: req.params.username });

      const seller = await Seller.findOne({ _id: account?.Seller });

      if (seller) delete this.MarzbanAccountsList[seller.Title];

      delete this.MarzbanAccountsList[
        await ConfigFile.GetSellerAdminUsername()
      ];

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

      if (!username && username === "") {
        res.status(404).json("Username not Found");
        return;
      }

      if (!tariffId && tariffId === "") {
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

      let data_limit: number | undefined = undefined;

      let expireTimestamp: number | undefined = undefined;

      if (tariff.Duration && tariff.Duration > 0) {
        const currentDate = new Date();

        currentDate.setDate(currentDate.getDate() + tariff.Duration);
        currentDate.setHours(20, 30, 0);

        expireTimestamp = Math.floor(currentDate.getTime() / 1000);
      }

      if (tariff.DataLimit && tariff.DataLimit > 0)
        data_limit = tariff.DataLimit * 1024 * 1024 * 1024;

      let apiURL = (await ConfigFile.GetMarzbanURL()) + "/api/user/" + username;
      const result = await axios.put(
        apiURL,
        {
          expire: expireTimestamp,
          data_limit: data_limit,
        },
        {
          headers: { Authorization: req.headers.authorization },
        }
      );

      apiURL =
        (await ConfigFile.GetMarzbanURL()) + "/api/user/" + username + "/reset";
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
      account.TariffId = tariff._id;
      account.Payed = false;
      await account.save();

      delete this.MarzbanAccountsList[seller.Title];

      delete this.MarzbanAccountsList[
        await ConfigFile.GetSellerAdminUsername()
      ];

      res.status(200).json(result.data);
    } catch (error) {
      next(error);
    }
  };

  static RemoveAccount: RequestHandler = async (req, res, next) => {
    try {
      const apiURL =
        (await ConfigFile.GetMarzbanURL()) + "/api/user/" + req.params.username;

      const resultget = await axios.get(apiURL, {
        headers: { Authorization: req.headers.authorization },
      });

      if (resultget.data) {
        // const used_traffic =
        //   (resultget.data.used_traffic ?? 0) / (1024 * 1024 * 1024);

        // if (used_traffic < (await ConfigFile.GetIgnoreTrafficToRemove())) {
        await axios.delete(apiURL, {
          headers: { Authorization: req.headers.authorization },
        });

        const account = await Account.findOneAndRemove({
          Username: req.params.username,
          Payed: false,
        });

        const seller = await Seller.findOne({ _id: account?.Seller });

        if (seller) delete this.MarzbanAccountsList[seller.Title];

        delete this.MarzbanAccountsList[
          await ConfigFile.GetSellerAdminUsername()
        ];

        res.status(200).json({ message: "Delete Success!" });
        // }
      }
    } catch (error) {
      next(error);
    }
  };

  static GetInbounds = async (authorization: string | undefined) => {
    let vmesses: string[] | undefined = undefined;
    let vlesses: string[] | undefined = undefined;
    let trojans: string[] | undefined = undefined;

    const apiURL = (await ConfigFile.GetMarzbanURL()) + "/api/inbounds";

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

  static GetMarzbanAccountsAndStore = async (
    authorization: string | undefined,
    seller: string,
    offset: number = 0,
    limit: number = 0
  ) => {
    const resultMarzban = await this.GetMarzbanAccounts(
      authorization,
      offset,
      limit
    );

    this.MarzbanAccountsList = {
      ...this.MarzbanAccountsList,
      [seller]: resultMarzban.data.users,
    };

    // console.log("MarzbanAccountList Filled!!!!");
  };

  static GetMarzbanAccounts = async (
    authorization: string | undefined,
    offset: number,
    limit: number
  ) => {
    const apiURL = (await ConfigFile.GetMarzbanURL()) + "/api/users";

    // const params = {
    //   offset: offset,
    //   limit: limit,
    // };

    const config = {
      headers: { Authorization: authorization },
      // params: params,
      timeout: 120000,
    };

    return axios.get(apiURL, config);
  };

  static GetSellerAccounts = async (sellerTitle: string, IsAll: boolean) => {
    // console.log("Start Getting From MongoDB ## " + sellerTitle);

    const sellerUsername = await ConfigFile.GetSellerAdminUsername();

    const seller = await Seller.findOne({ Title: sellerTitle });

    let condition = {};

    if (sellerTitle.toLowerCase() !== sellerUsername.toLowerCase())
      condition = { ...condition, Seller: new Types.ObjectId(seller?._id) };

    if (!IsAll) condition = { ...condition, Payed: false };

    const accounts = await Account.find(condition);

    // console.log("End Getting From MongoDB -- Count : " + accounts.length);
    return accounts;
  };

  static GetTotalUnpaid = async (
    seller: Document | undefined,
    IsAdmin: boolean
  ) => {
    let totalLimitUnpaid = 0;
    let totalPriceUnpaid = 0;

    // console.log("Start Calculate totalUnpaid ## " + seller.Title);
    const accounts = IsAdmin
      ? await Account.find({
          Payed: false,
        })
      : await Account.find({
          Seller: seller,
          Payed: false,
        });

    const tariffs = await Tariff.find({ IsFree: false });

    accounts.map((account) => {
      const tariff = tariffs.find(
        (tariff) => tariff._id.toString() === account.TariffId?.toString()
      );
      if (tariff) {
        totalPriceUnpaid += tariff.Price ?? 0;
        totalLimitUnpaid += tariff.DataLimit ?? 0;
      }
    });

    // console.log("End Calculate totalUnpaid -- " + totalUnpaid);
    return {
      TotalLimitUnpaid: totalLimitUnpaid,
      TotalPriceUnpaid: totalPriceUnpaid,
    };
  };

  static GetUsernameAvailable = async (
    seller: ISeller,
    username: string,
    authorization: string | undefined
  ) => {
    const apiURL = (await ConfigFile.GetMarzbanURL()) + "/api/user/";
    let result: AxiosResponse;
    let generateUsername: string = "";

    try {
      do {
        seller.Counter++;
        generateUsername =
          username + seller.Counter.toString().padStart(3, "0");

        result = await axios.get(apiURL + generateUsername, {
          headers: { Authorization: authorization },
        });
      } while (true);
    } catch (AxiosError) {}

    if (generateUsername != "") return generateUsername;

    throw new Error("Username is Empty");
  };

  static GetSubscriptionUrl = (
    marzbanSubscriptionUrl: string,
    sellerSubscriptionUrl: string
  ) => {
    const url =
      sellerSubscriptionUrl.trim() !== ""
        ? sellerSubscriptionUrl +
          "/sub/" +
          marzbanSubscriptionUrl.split("/sub/")[1]
        : marzbanSubscriptionUrl;

    return url;
  };

  static CheckToken = async (authorization?: string) => {
    try {
      const apiURL = (await ConfigFile.GetMarzbanURL()) + "/api/admin";

      const config = {
        headers: { Authorization: authorization },
        params: {},
      };

      const resultMarzban = await axios.get(apiURL, config);

      return resultMarzban.status === 200;
    } catch (err) {}
  };
}

export default MarzbanController;
