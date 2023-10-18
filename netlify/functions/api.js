import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import serverless from "serverless-http";

import dotenv from "dotenv";
dotenv.config();

import router from "../../routes/routes.js";

mongoose.connect(`${process.env.DATABASE_URL}`);

const api = express();

api.use(cors());
api.use(bodyParser.json());
api.use(cookieParser());

api.use("/api/", router);

export const handler = serverless(api);
