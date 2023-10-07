import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";
import mongoose from "mongoose";
import SpotifyWebApi from "spotify-web-api-node";

import dotenv from "dotenv";
dotenv.config();

import router from "./routes/routes.js";
import "./config/passportConfig.js";

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());

app.use(
  session({
    secret: "spotify-pods",
    resave: true,
    saveUninitialized: true,
    name: "Jake",
    cookie: {
      maxAge: 1000 * 60 * 60, //1hr
      secure: false,
      httpOnly: true,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(`${process.env.DATABASE_URL}`);

app.use("/", router);

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});
