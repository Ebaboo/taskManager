import express from "express";
import errorMiddleware from "./middlewares/error.middleware";
import routes from "./routes";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

const app = express();
dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(routes);

app.use(errorMiddleware);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
