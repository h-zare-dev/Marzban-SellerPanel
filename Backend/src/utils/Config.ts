import path from "path";
import { promises as fs } from "fs";

interface ConfigType {
  MARZBAN_URL: string;
  SUBSCRIPTION_URL: string;
  NOSUDO_MARZBAN_USERNAME: string;
  NOSUDO_MARZBAN_PASSWORD: string;
  SELLER_ADMIN_USERNAME: string;
  SELLER_ADMIN_PASSWORD: string;
  SERIALKEY: string;
}

class ConfigFile {
  private static config: ConfigType | undefined = undefined;

  static async GetConfigFromFile() {
    const filepath = path.join(process.cwd(), "data", "config.json");
    const fileContents = await fs.readFile(filepath, "utf8");
    this.config = JSON.parse(fileContents);
  }

  static async GetMarzbanURL() {
    if (!this.config) await this.GetConfigFromFile();

    if (this.config && this.config.MARZBAN_URL) return this.config.MARZBAN_URL;

    throw new Error("MARZBAN_URL doesn't exist in config File!");
  }

  static async GetSubscriptionURL() {
    if (!this.config) await this.GetConfigFromFile();

    if (this.config && this.config.SUBSCRIPTION_URL)
      return this.config.SUBSCRIPTION_URL;

    throw new Error("SUBSCRIPTION_URL doesn't exist in config File!");
  }

  static async GetMarzbanUsername() {
    if (!this.config) await this.GetConfigFromFile();

    if (this.config && this.config.NOSUDO_MARZBAN_USERNAME)
      return this.config.NOSUDO_MARZBAN_USERNAME;

    throw new Error("NOSUDO_MARZBAN_USERNAME doesn't exist in config File!");
  }

  static async GetMarzbanPassword() {
    if (!this.config) await this.GetConfigFromFile();

    if (this.config && this.config.NOSUDO_MARZBAN_PASSWORD)
      return this.config.NOSUDO_MARZBAN_PASSWORD;

    throw new Error("NOSUDO_MARZBAN_PASSWORD doesn't exist in config File!");
  }

  static async GetSellerUsername() {
    if (!this.config) await this.GetConfigFromFile();

    if (this.config && this.config.SELLER_ADMIN_USERNAME)
      return this.config.SELLER_ADMIN_USERNAME;

    throw new Error("SELLER_ADMIN_USERNAME doesn't exist in config File!");
  }

  static async GetSellerPassword() {
    if (!this.config) await this.GetConfigFromFile();

    if (this.config && this.config.SELLER_ADMIN_PASSWORD)
      return this.config.SELLER_ADMIN_PASSWORD;

    throw new Error("SELLER_ADMIN_PASSWORD doesn't exist in config File!");
  }

  static async GetSerialKey() {
    if (!this.config) await this.GetConfigFromFile();

    if (this.config && this.config.SERIALKEY) return this.config.SERIALKEY;

    throw new Error("SERIALKEY doesn't exist in config File!");
  }
}
export default ConfigFile;
