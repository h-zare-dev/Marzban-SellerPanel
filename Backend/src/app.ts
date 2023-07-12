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

import marzbanRouter from "./routes/MarzbanRouter";
import sellerRouter from "./routes/SellerRouter";
import tariffRouter from "./routes/TariffRouter";

const app = express();

app.use(bodyParser.json());

dotenv.config();

const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
};

app.use("/api/marzban", cors(corsOptions), marzbanRouter);

app.use("/api", cors(corsOptions), sellerRouter);

app.use("/api", cors(corsOptions), tariffRouter);

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

const portNumber = 8080;
let host = "localhost";
let connectionString = "";

if (process.env.UVICORN_HOST && process.env.UVICORN_HOST != "")
  host = process.env.UVICORN_HOST;

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
    app.listen(portNumber);
    console.log(`Server is Startig at http://${host}:${portNumber}`);
  })
  .catch((err: Error) => {
    console.log(`MongoDb Connection :  ${err.message}`);
  });
