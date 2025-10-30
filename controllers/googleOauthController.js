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
        let userExist;
try {
  userExist = await User.findOne({ where: { email: profile._json.email } });
  if (userExist) {
    console.log("User exists:", userExist.toJSON());
  } else {
    // Hash password
    const hashedPassword = await bcrypt.hash("ErrandHive", 10);

    // Create user
    userExist = await User.create({
      firstName: profile._json.given_name,
      lastName: profile._json.family_name,
      email: profile._json.email,
      isVerified: profile._json.email_verified,
      password: hashedPassword,
      role: role,
      bio: "No bio yet",
    });

    console.log("New user created:", userExist.toJSON());
  }
} catch (err) {
  console.error("Error finding or creating user:", err);
  return done(err, null);
}

// Generate token for both new or existing user
token = jwt.sign(
  { id: userExist.id },
  process.env.JWT_SECRET_KEY,
  { expiresIn: "1d" }
);

return done(null, {
  token,
  user: {
    id: userExist.id,
    firstName: userExist.firstName,
    lastName: userExist.lastName,
    email: userExist.email,
    role: userExist.role,
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
