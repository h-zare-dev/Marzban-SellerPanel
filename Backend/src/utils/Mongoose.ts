import mongoose from "mongoose";
import Account, { AccountSchema } from "../models/Account";
import Seller, { SellerSchema } from "../models/Seller";
import Tariff, { TariffSchema } from "../models/Tariff";
import { WholeSalerSchema } from "../models/WholeSaler";

class Mongoose {
  static ConnectionString =
    "mongodb+srv://##USERNAME##:##PASSWORD##@##CLUSTER##.mongodb.net/##DB##?retryWrites=true&w=majority";

  static DbWholeSalerConnectionString: string = "";

  static GetDbPanelConnectionString() {
    return this.ConnectionString.replace(
      "##CLUSTER##",
      "marzbanseller01.xrbygjz"
    )
      .replace("##DB##", "MarzbanSellerPanel")
      .replace("##USERNAME##", "marzbansellerpanel")
      .replace("##PASSWORD##", "ZioVwUWNWcBb2LG6");
  }

  static SetDbWholeSalerConnectionString(
    Cluster: string,
    Database: string,
    DbUsername: string,
    DbPassword: string
  ) {
    this.DbWholeSalerConnectionString = this.ConnectionString.replace(
      "##CLUSTER##",
      Cluster
    )
      .replace("##DB##", Database)
      .replace("##USERNAME##", DbUsername)
      .replace("##PASSWORD##", DbPassword);
  }

  static GetDbWholeSalerConnectionString() {
    return this.DbWholeSalerConnectionString;
  }

  static async ConnectDbWholeSaler() {
    if (this.GetDbWholeSalerConnectionString() == "")
      console.log("DbWholeSaler connection String Not Found");
    else {
      mongoose.set("strictQuery", true);
      await mongoose.connect(this.GetDbWholeSalerConnectionString());
      return true;
    }
    return false;
  }

  static async CheckLicense(marzbanUrl: string, sn: string) {
    const connection = await this.ConnectToDatabase(
      this.GetDbPanelConnectionString()
    );

    if (connection) {
      const WholeSaler = connection.model("WholeSaler", WholeSalerSchema);

      const wholeSaler = await WholeSaler.findOne({
        MarzbanUrl: marzbanUrl,
        SN: sn,
      });

      if (wholeSaler) {
        this.SetDbWholeSalerConnectionString(
          wholeSaler.Cluster,
          wholeSaler.Database,
          wholeSaler.DbUsername,
          wholeSaler.DbPassword
        );
        return true;
      }
      return false;
    }
  }

  static async AddWholeSaler() {
    const connection = await this.ConnectToDatabase(
      this.GetDbPanelConnectionString()
    );

    if (connection) {
      const WholeSaler = connection.model("WholeSaler", WholeSalerSchema);

      const wholeSaler = new WholeSaler();
      wholeSaler.Owner = "@fairinternet_admin";
      wholeSaler.MarzbanUrl = "https://main.fairinternet.cloud:2053";
      wholeSaler.SN = "gatrupe2lke-";
      wholeSaler.Cluster = "marzbanseller01.xrbygjz";
      wholeSaler.Database = "FairInternet";
      wholeSaler.DbUsername = "marzbansellerpanel";
      wholeSaler.DbPassword = "ZioVwUWNWcBb2LG6";

      wholeSaler.save();
    }
  }

  static async ConnectToDatabase(connectionString: string) {
    if (!connectionString && connectionString == "")
      console.log("MongoDb connection String Not Found");
    else return await mongoose.createConnection(connectionString);
  }

  static async CopyDatabase(destinatioConnectionString: string) {
    const connection = await this.ConnectToDatabase(destinatioConnectionString);

    if (connection) {
      //Copy Accounts
      const accounts = await Account.find();
      const AccountNew = connection.model("Account", AccountSchema);
      if (accounts && AccountNew)
        for (const account of accounts) {
          const accountnew = new AccountNew();
          accountnew._id = account._id;
          accountnew.Username = account.Username;
          accountnew.Seller = account.Seller;
          accountnew.Tariff = account.Tariff;
          accountnew.TariffId = account.TariffId;
          accountnew.Payed = account.Payed;
          accountnew.save();
        }
      //Copy Sellers
      const sellers = await Seller.find();
      const SellerNew = connection.model("Seller", SellerSchema);
      if (sellers && SellerNew)
        for (const seller of sellers) {
          const sellernew = new SellerNew();
          sellernew._id = seller._id;
          sellernew.Title = seller.Title;
          sellernew.Username = seller.Username;
          sellernew.Password = seller.Password;
          sellernew.Counter = seller.Counter;
          sellernew.Limit = seller.Limit;
          seller.Status = seller.Status;
          sellernew.save();
        }
      //Copy Tariffs
      const tariffs = await Tariff.find();
      const TariffNew = connection.model("Tariff", TariffSchema);
      if (tariffs && TariffNew)
        for (const tariff of tariffs) {
          const tariffnew = new TariffNew();
          tariffnew._id = tariff._id;
          tariffnew.Title = tariff.Title;
          tariffnew.DataLimit = tariff.DataLimit;
          tariffnew.Duration = tariff.Duration;
          tariffnew.IsFree = tariff.IsFree;
          tariffnew.IsVisible = tariff.IsVisible;
          tariffnew.save();
        }
    }
  }
}

export default Mongoose;
