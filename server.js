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

app.use(
  session({
    secret: "spotify-pods",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/", router);

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});
