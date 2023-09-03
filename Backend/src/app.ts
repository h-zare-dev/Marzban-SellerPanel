import express, {
  NextFunction,
  Request,
  Response,
  ErrorRequestHandler,
} from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import fs from "fs";
import http from "http";
import https from "https";

import marzbanRouter from "./routes/MarzbanRouter";
import sellerRouter from "./routes/SellerRouter";
import tariffRouter from "./routes/TariffRouter";
import accountRouter from "./routes/AccountRouter";

const privateKey = fs.readFileSync("certs/key.pem");
const certificate = fs.readFileSync("certs/fullchain.pem");
const credentials = { key: privateKey, cert: certificate };

const app = express();

const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);

app.use(bodyParser.json());

dotenv.config();

const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
};

app.use("/api/marzban", cors(corsOptions), marzbanRouter);

app.use("/api", cors(corsOptions), sellerRouter);

app.use("/api", cors(corsOptions), tariffRouter);

app.use("/api", cors(corsOptions), accountRouter);

app.use(
  (
    err: ErrorRequestHandler,
    _req: Request,
    res: Response,
    next: NextFunction
  ) => {
    console.log(err); //replace with logger later
    if (res.headersSent) {
      return next(err);
    }
    res.status(500);
    res.json(err.toString());
  }
);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "app is running!" });
});

let connectionString = "";

if (
  process.env.MONGODB_CONNECTION_STRING &&
  process.env.MONGODB_CONNECTION_STRING != ""
)
  connectionString = process.env.MONGODB_CONNECTION_STRING;

if (connectionString == "") console.log(`MongoDb connection String Not Found`);

mongoose.set("strictQuery", true);

mongoose
  .connect(connectionString)
  .then(() => {
    httpServer.listen(8080);
    httpsServer.listen(8443);
    console.log(`Server is Startig at http://localhost:8080`);
    console.log(`Server is Startig at https://localhost:8443`);
  })
  .catch((err: Error) => {
    console.log(`MongoDb Connection :  ${err.message}`);
  });
