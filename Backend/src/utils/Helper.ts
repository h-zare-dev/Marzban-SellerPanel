class Helper {
  private static marzbanToken = "";
  private static marzbanURL = "";
  private static marzbanUsername = "";
  private static marzbanPassword = "";

  static GetMarzbanToken() {
    return this.marzbanToken;
  }
  static SetMarzbanToken(token: string) {
    this.marzbanToken = token;
    
  }

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
}
export default Helper;
