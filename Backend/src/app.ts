import express, {
  NextFunction,
  Request,
  Response,
  ErrorRequestHandler,
} from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";

import marzbanRouter from "./routes/MarzbanRouter";

const app = express();

app.use(bodyParser.json());

dotenv.config();

const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
};

app.use("/api/marzban", cors(corsOptions), marzbanRouter);

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

if (process.env.UVICORN_HOST && process.env.UVICORN_HOST != "")
  host = process.env.UVICORN_HOST;

app.listen(portNumber);
console.log(`Server is Startig at http://${host}:${portNumber}`);
