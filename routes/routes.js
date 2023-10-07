import express from "express";
import cors from "cors";
import passport from "passport";
const router = express.Router();
import cookieParser from "cookie-parser";
import cookies from "js-cookie";

router.use(cors());
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
    res.redirect("http://localhost:8080/dashboard");
  }
);

router.get("/", (req, res) => {
  console.log("root hit");
  console.log(req.session.user);
});

export default router;
