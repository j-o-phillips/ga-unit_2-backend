import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import serverless from "serverless-http";

import dotenv from "dotenv";
dotenv.config();

import router from "./routes/routes.js";

mongoose.connect(`${process.env.DATABASE_URL}`);

const app = express();

app.use(
  cors({
    origin: "http://localhost:8080", // Replace with your client's origin
    credentials: true, // Enable credentials (cookies) in CORS
  })
);
app.use(bodyParser.json());
app.use(cookieParser());

app.use("/", router);

// const port = process.env.PORT || 4000;

// app.listen(port, () => {
//   console.log(`Listening on port: ${port}`);
// });

export const handler = serverless(api);
