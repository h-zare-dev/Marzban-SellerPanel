class Helper {
  private static marzbanURL = "";
  private static subscriptionURL = "";
  private static marzbanUsername = "";
  private static marzbanPassword = "";

  static GetMarzbanURL() {
    if (this.marzbanURL == "") {
      if (process.env.MARZBAN_URL && process.env.MARZBAN_URL != "") {
        this.marzbanURL = process.env.MARZBAN_URL;
        return this.marzbanURL;
      }
      throw new Error("Marzban_URL doestnt Exist in env File!");
    }
    return this.marzbanURL;
  }

  static GetSubscriptionURL() {
    if (this.subscriptionURL == "") {
      if (process.env.SUBSCRIPTION_URL && process.env.SUBSCRIPTION_URL != "") {
        this.subscriptionURL = process.env.SUBSCRIPTION_URL;
        return this.subscriptionURL;
      }
      throw new Error("Marzban_URL doestnt Exist in env File!");
    }
    return this.marzbanURL;
  }

  static GetMarzbanUsername() {
    if (this.marzbanUsername == "") {
      if (
        process.env.NOSUDO_MARZBAN_USERNAME &&
        process.env.NOSUDO_MARZBAN_USERNAME != ""
      ) {
        this.marzbanUsername = process.env.NOSUDO_MARZBAN_USERNAME;
        return this.marzbanUsername;
      }
      throw new Error("NOSUDO_MARZBAN_USERNAME doestnt Exist in env File!");
    }
    return this.marzbanUsername;
  }

  static GetMarzbanPassword() {
    if (this.marzbanPassword == "") {
      if (
        process.env.NOSUDO_MARZBAN_PASSWORD &&
        process.env.NOSUDO_MARZBAN_PASSWORD != ""
      ) {
        this.marzbanPassword = process.env.NOSUDO_MARZBAN_PASSWORD;
        return this.marzbanPassword;
      }
      throw new Error("NOSUDO_MARZBAN_PASSWORD doestnt Exist in env File!");
    }
    return this.marzbanPassword;
  }

  static CalculateRemainDate(expire: number) {
    if (expire != null) {
      const diffDate = new Date(expire * 1000).getTime() - new Date().getTime();
      const remainDay = Math.ceil(diffDate / (1000 * 3600 * 24)) - 1;
      if (remainDay >= 0) return remainDay.toString() + " Day Left";
      return Math.abs(remainDay).toString() + " Day Expired";
    }
    return "Never";
  }

  static CalculateTraffic(volume: number) {
    if (volume < 1024) return volume.toString() + " B";
    else if (volume < 1024 * 1024) return (volume / 1024).toFixed(2) + " KB";
    else if (volume < 1024 * 1024 * 1024)
      return (volume / (1024 * 1024)).toFixed(2) + " MB";
    else if (volume < 1024 * 1024 * 1024 * 1024)
      return (volume / (1024 * 1024 * 1024)).toFixed(2) + " GB";
    else if (volume < 1024 * 1024 * 1024 * 1024 * 1024)
      return (volume / (1024 * 1024 * 1024 * 1024)).toFixed(2) + " TB";
  }

  static GenerateRandomPassword(length: number) {
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789~!@#$%^&";
    let password = "";

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }

    return password;
  }
}
export default Helper;
