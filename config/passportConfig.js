import passport from "passport";
import { Strategy as SpotifyStrategy } from "passport-spotify";
import dotenv from "dotenv";
dotenv.config();

const redirectUri = process.env.SPOTIFY_CALLBACK;
const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

//serialize and deserialize  user
passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((user, cb) => {
  cb(null, user);
});

//strategy config
passport.use(
  new SpotifyStrategy(
    {
      clientID: clientId,
      clientSecret: clientSecret,
      callbackURL: redirectUri,
    },
    (accessToken, refreshToken, expires_in, profile, cb) => {
      process.nextTick(() => {
        let user = {
          userId: profile.id,
          accessToken: accessToken,
          refreshToken: refreshToken,
        };
        console.log(user);
        return cb(null, user);
      });
    }
  )
);
