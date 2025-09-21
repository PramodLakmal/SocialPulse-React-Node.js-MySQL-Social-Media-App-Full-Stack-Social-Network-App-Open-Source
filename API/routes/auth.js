import express from "express";
import { login, register, logout, googleAuthSuccess, googleAuthFailure, checkAuth } from "../controllers/auth.js";
import passport from "../config/passport.js";

const router = express.Router()

// Traditional auth routes
router.post("/login", login)
router.post("/register", register)
router.post("/logout", logout)

// Check authentication status
router.get("/me", checkAuth)

// Google OAuth routes
router.get("/google", 
  passport.authenticate("google", { 
    scope: ["profile", "email"] 
  })
);

router.get("/google/callback", 
  passport.authenticate("google", { 
    failureRedirect: "/api/auth/google/failure" 
  }),
  googleAuthSuccess
);

router.get("/google/failure", googleAuthFailure);

export default router