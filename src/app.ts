import express, { Request, Response } from "express";
import cors from "cors";



import cookieParser from "cookie-parser";
import { envVariables } from "./config/env";
import { router } from "./routes";


const app = express();


app.use(cookieParser());
app.use(express.json());
app.set("trust proxy", 1);
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: envVariables.FRONTEND_URL,
    credentials: true,
  })
);

app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "This is a Hidden Dependency Risk Tracker Server",
  });
});

// app.use(globalErrorHandler);
// app.use(notFound);
export default app;
