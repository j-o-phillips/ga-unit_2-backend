import express from "express";
import passport from "passport";
const router = express.Router();
import cookieParser from "cookie-parser";
import cookies from "js-cookie";

import { searchSpotify, syncPlaylist } from "../controllers/spotify.js";
import {
  addTrackToPlaylist,
  addTrackToSuggestions,
  removeTrackFromPlaylist,
  removeTrackFromSuggestions,
} from "../controllers/playlists.js";

import { Pod } from "../models/pod.js";
import { User } from "../models/user.js";

router.use(cookieParser());

//! ROUTES
//? Login
//login
router.get(
  "/auth/spotify",
  passport.authenticate("spotify", {
    scope: [
      "playlist-read-private",
      "playlist-read-collaborative",
      "playlist-modify-public",
      "playlist-modify-private",
    ],
  })
);

//callback
router.get(
  "/callback",
  passport.authenticate("spotify", {
    failureRedirect: "/",
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
    playlists: [
      {
        name: "New Playlist",
        spotifyId: "",
        tracks: [],
        suggestions: [],
      },
    ],
    posts: [],
  });
  await User.updateOne({ userId: userId }, { $push: { pods: newPod._id } });

  res.json({
    message: "Pod created",
  });
});

//get specific pod info for component load
router.get("/my-pods/:pod", async (req, res) => {
  console.log("get info for pod");
  //find pod
  const { pod } = req.params;
  const podToUpdate = await Pod.find({ name: pod });
  //! replace when mutiple playlists
  const podInfo = podToUpdate[0].playlists[0];
  res.json(podInfo);
});

//? Playlists
//add track to suggestions
router.post("/my-pods/suggestions/:pod", async (req, res) => {
  console.log("post to suhggestions");
  const { pod } = req.params;
  const data = req.body;

  await addTrackToSuggestions(pod, data, Pod);

  res.json({
    message: "track added to suggestions",
  });
});

//remove track from suggestions
router.delete("/my-pods/suggestions/:pod", async (req, res) => {
  console.log("delete from suggestions");
  const { pod } = req.params;
  const data = req.body;

  await removeTrackFromSuggestions(pod, data, Pod);

  res.json({
    message: "track deleted from suggestions",
  });
});

//add track to playlist
router.post("/my-pods/playlist/:pod", async (req, res) => {
  console.log("post to playlist");
  const { pod } = req.params;
  const data = req.body;

  await addTrackToPlaylist(pod, data, Pod);
  // await removeTrackFromSuggestions(pod, data, Pod)

  res.json({
    message: "track added to playlist",
  });
});

//remove track from playlist
router.delete("/my-pods/playlist/:pod", async (req, res) => {
  console.log("delete from playlist");
  const { pod } = req.params;
  const data = req.body;

  await removeTrackFromPlaylist(pod, data, Pod);
  res.json({
    message: "track deleted from playlist",
  });
});

//sync to spotify
router.put("/my-pods/sync", async (req, res) => {
  const cookieJson = JSON.parse(req.cookies.userCred);
  const accessToken = cookieJson.accessToken;
  const userId = cookieJson.userId;
  const data = req.body;
  let newId;

  newId = await syncPlaylist(data, accessToken, userId);

  res.json({
    newId: newId,
  });
});

//? Posts
//get posts
router.get("/my-pods/:pod/posts", async (req, res) => {
  const { pod } = req.params;
  const podToUpdate = await Pod.find({ name: pod });
  const posts = podToUpdate[0].posts;
  console.log(posts);
  res.json(posts);
});

//add post
router.post("/my-pods/:pod/posts", async (req, res) => {
  const { pod } = req.params;
  const cookieJson = JSON.parse(req.cookies.userCred);
  const userId = cookieJson.userId;
  const data = req.body;
  const postObj = {
    author: userId,
    content: data.content,
  };

  const podToUpdate = await Pod.find({ name: pod });
  podToUpdate[0].posts.push(postObj);
  await podToUpdate[0].save();
});
export default router;
