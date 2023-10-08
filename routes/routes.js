import express from "express";
import cors from "cors";
import passport from "passport";
const router = express.Router();
import cookieParser from "cookie-parser";
import cookies from "js-cookie";

import { searchSpotify } from "../controllers/searchSpotify.js";

import { Pod } from "../models/pod.js";
import { User } from "../models/user.js";

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

//? Pods
//get user's pods
router.get("/my-pods", async (req, res) => {
  const cookieJson = JSON.parse(req.cookies.userCred);
  const userId = cookieJson.userId;

  User.findOne({ userId: userId })
    .populate("pods") // Populate the 'pods' field
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const userPods = user.pods;
      res.json(userPods);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    });
});

//create new pod
router.post("/my-pods", async (req, res) => {
  const { podName } = req.body;
  const cookieJson = JSON.parse(req.cookies.userCred);
  const userId = cookieJson.userId;

  const newPod = await Pod.create({
    name: podName,
    users: [userId],
    playlists: [],
    posts: [],
  });
  await User.updateOne({ userId: userId }, { $push: { pods: newPod._id } });

  res.json({
    message: "Pod created",
  });
});

export default router;
