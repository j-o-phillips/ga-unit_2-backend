import express from "express";
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

function authenticate(req, res, next) {
  const cookie = req.cookies.userCred;
  if (!cookie) {
    console.log("cookie undefined");
  } else {
    const cookieJson = JSON.parse(req.cookies.userCred);
    req.userCred = cookieJson;
    next();
  }
}

router.get("/hello", (req, res) => {
  res.send("hello world");
});
//! ROUTES
//? Login
//create or update User
router.post("/login", async (req, res) => {
  const cookieJson = JSON.parse(req.cookies.userCred);
  const userId = cookieJson.userId;
  const userImageUrl = cookieJson.images[0].url;

  try {
    let user = await User.findOne({ userId: userId });
    if (user) {
    } else {
      //else we have a new user
      user = await User.create({
        userId: userId,
        userImageUrl: userImageUrl,
        pods: [],
      });
    }
  } catch (err) {
    console.log(err);
  }
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
router.get("/my-pods/:userId", async (req, res) => {
  // const cookieJson = JSON.parse(req.cookies.userCred);
  const { userId } = req.params;
  console.log(userId);

  User.findOne({ userId: userId })
    .populate("pods") // Populate the 'pods' field
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const userPods = user.pods;
      console.log(userPods);
      res.json(userPods);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    });
});

//search all pods
// router.get("/my-pods/:query", async (req, res) => {
//   const { query } = req.params;
//   const foundPod = await Pod.find({ name: query });
//   res.json(foundPod);
// });

//create new pod
router.post("/my-pods", authenticate, async (req, res) => {
  const { podName, playlistName } = req.body;
  // const cookieJson = JSON.parse(req.cookies.userCred);
  const userId = req.userCred.userId;

  const newPod = await Pod.create({
    name: podName,
    admins: [userId],
    users: [],
    playlists: [
      {
        name: playlistName,
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
// router.get("/my-pods/:pod", authenticate, async (req, res) => {
//   //find pod
//   const { pod } = req.params;
//   const podToUpdate = await Pod.find({ name: pod });
//   //! replace when mutiple playlists
//   const podInfo = podToUpdate[0].playlists[0];
//   res.json(podInfo);
// });

//? Playlists
//add track to suggestions
router.post("/my-pods/suggestions/:pod", authenticate, async (req, res) => {
  const { pod } = req.params;
  const data = req.body;

  await addTrackToSuggestions(pod, data, Pod);

  res.json({
    message: "track added to suggestions",
  });
});

//remove track from suggestions
router.delete("/my-pods/suggestions/:pod", authenticate, async (req, res) => {
  const { pod } = req.params;
  const data = req.body;

  await removeTrackFromSuggestions(pod, data, Pod);

  res.json({
    message: "track deleted from suggestions",
  });
});

//add track to playlist
router.post("/my-pods/playlist/:pod", authenticate, async (req, res) => {
  const { pod } = req.params;
  const data = req.body;

  await addTrackToPlaylist(pod, data, Pod);
  // await removeTrackFromSuggestions(pod, data, Pod)

  res.json({
    message: "track added to playlist",
  });
});

//remove track from playlist
router.delete("/my-pods/playlist/:pod", authenticate, async (req, res) => {
  const { pod } = req.params;
  const data = req.body;

  await removeTrackFromPlaylist(pod, data, Pod);
  res.json({
    message: "track deleted from playlist",
  });
});

//like track suggestion
router.post("/like/:pod", authenticate, async (req, res) => {
  const userId = req.userCred.userId;
  const { pod } = req.params;
  const { trackId } = req.body;
  const podToUpdate = await Pod.find({ name: pod });
  const suggestions = podToUpdate[0].playlists[0].suggestions;
  const foundSuggestion = suggestions.find((suggestion) => {
    return suggestion.id === trackId;
  });
  foundSuggestion.likes.push(userId);
  await podToUpdate[0].save();
  res.json({
    message: "suggestion liked",
  });
});

//dislike track suggestion
router.post("/dislike/:pod", authenticate, async (req, res) => {
  const userId = req.userCred.userId;
  const { pod } = req.params;
  const { trackId } = req.body;
  const podToUpdate = await Pod.find({ name: pod });
  const suggestions = podToUpdate[0].playlists[0].suggestions;
  const foundSuggestion = suggestions.find((suggestion) => {
    return suggestion.id === trackId;
  });
  //find index of user id in likes array
  const index = foundSuggestion.likes.findIndex((user) => user === userId);
  foundSuggestion.likes.splice(index, 1);
  await podToUpdate[0].save();
  res.json({
    message: "suggestion disliked",
  });
});

//sync to spotify
router.put("/my-pods/:pod/sync", async (req, res) => {
  const cookieJson = JSON.parse(req.cookies.userCred);
  const accessToken = cookieJson.accessToken;
  const userId = cookieJson.userId;
  const { pod } = req.params;
  const data = req.body;
  let newId;

  newId = await syncPlaylist(data, accessToken, userId);
  //set new id on playlist model
  if (newId) {
    const podToUpdate = await Pod.find({ name: pod });
    //change this when we have multiple playlists
    podToUpdate[0].playlists[0].spotifyId = newId;
    await podToUpdate[0].save();
  }

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
  res.json(posts);
});

//add post
router.post("/my-pods/:pod/posts", authenticate, async (req, res) => {
  const { pod } = req.params;
  // const cookieJson = JSON.parse(req.cookies.userCred);
  const userId = req.userCred.userId;
  const data = req.body;
  const postObj = {
    author: userId,
    content: data.content,
  };

  const podToUpdate = await Pod.find({ name: pod });
  podToUpdate[0].posts.push(postObj);
  await podToUpdate[0].save();
  res.json({
    message: "post added",
  });
});

//delete post
router.delete("/my-pods/:pod/:postid", async (req, res) => {
  const { pod, postid } = req.params;

  const podToUpdate = await Pod.find({ name: pod });
  await podToUpdate[0].posts.id(postid).deleteOne();
  await podToUpdate[0].save();
  res.json({
    message: "post deleted",
  });
});

//? My Playlists
//get all playlists
router.get("/my-playlists", authenticate, async (req, res) => {
  // const cookieJson = JSON.parse(req.cookies.userCred);

  const accessToken = req.userCred.accessToken;

  const config = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };

  const results = await fetch(
    "https://api.spotify.com/v1/me/playlists",
    config
  ).then((res) => res.json());
  res.json(results.items);
});

//get selected playlist
router.get("/my-playlists/:id", authenticate, async (req, res) => {
  // const cookieJson = JSON.parse(req.cookies.userCred);
  const accessToken = req.userCred.accessToken;
  const playlistId = req.params.id;
  const config = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };

  const results = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}`,
    config
  ).then((res) => res.json());
  res.json(results);
});

//delete from selected playlist
router.delete("/my-playlists/:id", authenticate, async (req, res) => {
  // const accessToken = req.userCred.accessToken;
  const accessToken = req.userCred.accessToken;
  const playlistId = req.params.id;
  const data = req.body;

  const requestBody = JSON.stringify({
    tracks: [
      {
        uri: data.uri,
      },
    ],
  });

  let status;
  await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: requestBody,
  }).then((res) => (status = res.status));
  res.json({
    status: status,
  });
});

//add to selected playlist
router.post("/my-playlists/:id", authenticate, async (req, res) => {
  // const cookieJson = JSON.parse(req.cookies.userCred);
  const accessToken = req.userCred.accessToken;
  const playlistId = req.params.id;
  const data = req.body;
  const requestBody = JSON.stringify({
    uris: [data.uri],
  });

  await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: requestBody,
  });
  res.json({
    message: "track added",
  });
});

//join pod
router.post("/join/:podid", authenticate, async (req, res) => {
  // const cookieJson = JSON.parse(req.cookies.userCred);
  const userId = req.userCred.userId;
  const { podid } = req.params;

  await User.updateOne(
    { userId: userId }, // Filter the user by ID
    { $addToSet: { pods: podid } } // Use $addToSet to add the specified pod to the array
  );
  await Pod.updateOne({ _id: podid }, { $addToSet: { users: userId } });
  res.json({
    message: "pod joined",
  });
});

//leave pod
router.delete("/leave/:podid", authenticate, async (req, res) => {
  // const cookieJson = JSON.parse(req.cookies.userCred);
  const userId = req.userCred.userId;
  const { podid } = req.params;

  await User.updateOne(
    { userId: userId },
    { $pull: { pods: podid } } // Use $pull to remove the specified pod from the array
  );
  await Pod.updateOne({ _id: podid }, { $pull: { admins: userId } });
  await Pod.updateOne({ _id: podid }, { $pull: { users: userId } });
  res.json({
    message: "Pod left",
  });
});

export default router;
