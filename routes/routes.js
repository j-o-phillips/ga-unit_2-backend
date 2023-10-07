import express from "express";
import cors from "cors";
import passport from "passport";
const router = express.Router();
import cookieParser from "cookie-parser";
import cookies from "js-cookie";

import { searchSpotify } from "../controllers/searchSpotify.js";

router.use(
  cors({
    origin: "http://localhost:8080", // Replace with your client's origin
    credentials: true, // Enable credentials (cookies) in CORS
  })
);

router.use(cookieParser());

//! ROUTES
//? Login
//login
router.get("/auth/spotify", passport.authenticate("spotify"));

//callback
router.get(
  "/callback",
  passport.authenticate("spotify", {
    failureRedirect: "/",
    scope: ["playlist-read-private", "playlist-read-collaborative"],
  }),
  function (req, res, next) {
    //successful authentication, redirect to client
    let data = JSON.stringify(req.user);
    res.cookie("userCred", data, { httpOnly: false });
    res.redirect("http://localhost:8080/home");
  }
);
//logout
router.get("/logout", (req, res) => {
  console.log("logout hit");
  req.logout(() => {
    res.redirect("http://localhost:8080");
  });
});

//? Spotify Search
//search
router.get("/search/:track", async (req, res) => {
  const { track } = req.params;
  const cookieJson = JSON.parse(req.cookies.userCred);
  const accessToken = cookieJson.accessToken;

  const result = await searchSpotify(track, accessToken);
  res.json(result);
});

export default router;
