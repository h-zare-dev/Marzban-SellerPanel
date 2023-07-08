import { RequestHandler } from "express";
import Helper from "../utils/Helper";
import axios from "axios";

class MarzbanController {
  static LoginToMarzbanAPI: RequestHandler = async (req, res, next) => {
    try {
      const apiURL = Helper.GetMarzbanURL() + "/api/admin/token";

      const config = {
        headers: { "content-type": "application/x-www-form-urlencoded" },
      };

      const result: { data: { access_token: string } } = await axios.post(
        apiURL,
        {
          username: Helper.GetMarzbanUsername(),
          password: Helper.GetMarzbanPassword(),
        },
        config
      );

      Helper.SetMarzbanToken(result.data.access_token);
      res.status(200).json({ Message: "Login Success!" });
    } catch (error) {
      next(error);
    }
  };

  static GetAccounts: RequestHandler = async (req, res, next) => {
    try {
      const apiURL = Helper.GetMarzbanURL() + "/api/users";

      const config = {
        headers: { Authorization: "Bearer " + Helper.GetMarzbanToken() },
        params: {
          offset: req.params.offset,
          limit: req.params.limit,
        },
      };

      const result: { data: [] } = await axios.get(apiURL, config);

      res.status(200).json(result.data);
    } catch (error) {
      next(error);
    }
  };

  static AddAccount: RequestHandler = async (req, res, next) => {
    try {
      const apiURL = Helper.GetMarzbanURL() + "/api/user";

      const currentDate = new Date();

      const expireTimestamp = Math.floor(
        new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDay() + 2,
          23,
          59,
          59
        ).getTime() / 1000
      );

      await axios.post(
        apiURL,
        {
          username: "userapi",
          proxies: {
            vmess: {
              id: "b791a8e8-bcc3-49ec-923c-65284fca74c0",
            },
            vless: {
              id: "fbaefe7e-0f63-41e2-8560-9f154626009e",
            },
            trojan: {
              password: "J54mN&h#Ys0N",
            },
          },
          inbounds: {
            vmess: ["VMESS_NoTLS_WS", "VLESS_HTTP_NoTLS_WS"],
            vless: [
              "VLESS_INBOUND_REALITY_balance",
              "VLESS_REALITY_NODE3",
              "VLESS_REALITY_NODE4",
            ],
            trojan: ["TROJAN_TLS_GRPC"],
          },
          expire: expireTimestamp,
          data_limit: 1073741824,
        },
        {
          headers: { Authorization: "Bearer " + Helper.GetMarzbanToken() },
        }
      );
      res.status(200).json("Account Added!");
    } catch (error) {
      next(error);
    }
  };

  static RemoveAccount: RequestHandler = async (req, res, next) => {
    try {
      const apiURL =
        Helper.GetMarzbanURL() + "/api/user/" + req.params.username;
      await axios.delete(apiURL, {
        headers: { Authorization: "Bearer " + Helper.GetMarzbanToken() },
      });
      res.status(200).json({ message: "Delete Success!" });
    } catch (error) {
      next(error);
    }
  };
}
export default MarzbanController;
