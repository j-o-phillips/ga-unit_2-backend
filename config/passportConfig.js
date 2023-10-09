import passport from "passport";
import { Strategy as SpotifyStrategy } from "passport-spotify";
import dotenv from "dotenv";
dotenv.config();
import { User } from "../models/user.js";

const redirectUri = process.env.SPOTIFY_CALLBACK;
const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

//strategy config
passport.use(
  new SpotifyStrategy(
    {
      clientID: clientId,
      clientSecret: clientSecret,
      callbackURL: redirectUri,
    },
    async (accessToken, refreshToken, expires_in, profile, cb) => {
      try {
        let user = await User.findOne({ userId: profile.id });
        if (user) {
          await User.updateOne(
            { userId: profile.id },
            { accessToken: accessToken }
          );
          return cb(null, user);
        }
        //else we have a new user
        user = await User.create({
          userId: profile.id,
          accessToken: accessToken,
        });
        return cb(null, user);
      } catch (err) {
        return cb(err);
      }
    }
  )
);

//serialize and deserialize  user
passport.serializeUser((user, cb) => {
  cb(null, user._id);
});

passport.deserializeUser(async (userId, cb) => {
  cb(null, await User.findById(userId));
});
