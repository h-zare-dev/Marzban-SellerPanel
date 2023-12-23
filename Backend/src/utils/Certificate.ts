import fs from "fs";

class Certificate {
  static GetCredential() {
    const privateKey = fs.readFileSync("certs/key.pem");
    const certificate = fs.readFileSync("certs/fullchain.pem");
    return { key: privateKey, cert: certificate };
  }
}

export default Certificate;
