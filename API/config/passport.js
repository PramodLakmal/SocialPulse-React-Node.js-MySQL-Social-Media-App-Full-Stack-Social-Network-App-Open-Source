import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { db } from "../connect.js";
import dotenv from "dotenv";
import { promisify } from "util";

dotenv.config();

// Promisify db.query for better async handling
const queryAsync = promisify(db.query).bind(db);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        
        // Check if user already exists with this Google ID
        const existingUserQuery = "SELECT * FROM users WHERE googleId = ?";
        const existingUsers = await queryAsync(existingUserQuery, [profile.id]);
        
        if (existingUsers.length > 0) {
          return done(null, existingUsers[0]);
        }
        
        // Check if user exists with the same email
        const emailUserQuery = "SELECT * FROM users WHERE email = ?";
        const emailUsers = await queryAsync(emailUserQuery, [profile.emails[0].value]);
        
        if (emailUsers.length > 0) {
          // User exists with email, link Google account
          const linkGoogleQuery = "UPDATE users SET googleId = ? WHERE email = ?";
          await queryAsync(linkGoogleQuery, [profile.id, profile.emails[0].value]);
          
          // Get updated user
          const updatedUsers = await queryAsync(emailUserQuery, [profile.emails[0].value]);
          console.log("Google account linked successfully");
          return done(null, updatedUsers[0]);
        }
        
        // Create new user
        const username = profile.emails[0].value.split('@')[0] + '_' + profile.id.slice(-4);
        const createUserQuery = `
          INSERT INTO users (googleId, username, email, name, profilePic) 
          VALUES (?, ?, ?, ?, ?)
        `;
        const values = [
          profile.id,
          username,
          profile.emails[0].value,
          profile.displayName,
          profile.photos[0]?.value || null
        ];
        
        const result = await queryAsync(createUserQuery, values);
        
        // Get the newly created user
        const getUserQuery = "SELECT * FROM users WHERE id = ?";
        const newUsers = await queryAsync(getUserQuery, [result.insertId]);
        
        if (newUsers.length === 0) {
          console.error("Failed to retrieve newly created user");
          return done(new Error("Failed to create user"), null);
        }
        
        return done(null, newUsers[0]);
        
      } catch (error) {
        console.error("Google OAuth error:", error);
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const getUserQuery = "SELECT * FROM users WHERE id = ?";
  db.query(getUserQuery, [id], (err, user) => {
    if (err) return done(err, null);
    done(null, user[0]);
  });
});

export default passport;