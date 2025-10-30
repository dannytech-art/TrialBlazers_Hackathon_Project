const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt"); // ✅ Bcrypt for hashing
const User = require('../models/users'); // Sequelize User model

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "https://errandhive-project.onrender.com/api/v1/google/callback",
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const state = req.query.state
          ? JSON.parse(Buffer.from(req.query.state, "base64").toString())
          : {};
        const { role } = state;
        let token;
        let userData;

        // ✅ Find user in database
        let userExist = await User.findOne({
          where: { email: profile._json.email },
        });

        if (userExist) {
          // ✅ Generate token for existing user
          token = jwt.sign(
            { id: userExist.id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "1d" }
          );

          userData = userExist;
        } else {
          // ✅ Hash password using bcrypt
          const hashedPassword = await bcrypt.hash("ErrandHive", 10);

          // ✅ Create new user
          userData = await User.create({
            firstName: profile._json.given_name,
            lastName: profile._json.family_name,
            email: profile._json.email,
            isVerified: profile._json.email_verified,
            password: hashedPassword, // ✅ Hashed password
            role,
            bio: "No bio yet",   
          });

          // ✅ Generate token for new user
          token = jwt.sign(
            { id: userData.id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "1d" }
          );
        }

        // ✅ Return both token + user info
        return done(null, {
          token,
          user: {
            id: userData.id,
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            role: userData.role,
          },
        });
      } catch (error) {
        console.error("Google Login Error:", error);
        return done(error, null);
      }
    }
  )
);


passport.serializeUser((data, done) => {
  done(null, data);
});

passport.deserializeUser((data, done) => {
  done(null, data);
});
