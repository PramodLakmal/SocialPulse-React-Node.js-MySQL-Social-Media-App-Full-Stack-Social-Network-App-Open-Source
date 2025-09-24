import { db } from "../connect.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const register = (req, res) => {
  // Password strength validation
  if (!isStrongPassword(req.body.password)) {
    return res.status(400).json({
      message:
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.",
    });
  }

  //CHECK USER IF EXISTS
  const q = "SELECT * FROM users WHERE username = ?";
  db.query(q, [req.body.username], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length) return res.status(409).json("User already exists!");

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(req.body.password, salt);

    const insertQuery =
      "INSERT INTO users (`username`,`email`,`password`,`name`) VALUES (?)";

    const values = [
      req.body.username,
      req.body.email,
      hashedPassword,
      req.body.name,
    ];

    db.query(insertQuery, [values], (err, result) => {
      if (err) return res.status(500).json(err);

      // Get the newly created user's ID
      const newUserId = result.insertId;

      // Fetch the complete user data (excluding password)
      const getUserQuery = "SELECT id, username, email, name, profilePic, coverPic, city, website FROM users WHERE id = ?";

      db.query(getUserQuery, [newUserId], (err, userData) => {
        if (err) return res.status(500).json(err);

        if (userData.length === 0) {
          return res.status(500).json("Failed to retrieve user data");
        }

        // Generate JWT token for auto-login
        const token = jwt.sign({ id: newUserId }, process.env.JWT_SECRET);

        // Set cookie and return user data (auto-login)
        res
          .cookie("accessToken", token, {
            httpOnly: true,
          })
          .status(200)
          .json(userData[0]);
      });
    });
  });
};

function isStrongPassword(password) {
  // At least 8 characters, one uppercase, one lowercase, one number, one special character
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return strongPasswordRegex.test(password);
}

// export const register = (req, res) => {

//   const checkUserQuery = "SELECT * FROM users WHERE username = ?";
//   db.query(checkUserQuery, [req.body.username], (err, data) => {
//     if (err) return res.status(500).json(err);
//     if (data.length) return res.status(409).json("User already exists!");


//     const salt = bcrypt.genSaltSync(10);
//     const hashedPassword = bcrypt.hashSync(req.body.password, salt);

//     const insertUserQuery = `
//       INSERT INTO users (username, email, password, name) 
//       VALUES (?, ?, ?, ?)
//     `;
//     const values = [
//       req.body.username,
//       req.body.email,
//       hashedPassword,
//       req.body.name,
//     ];

//     db.query(insertUserQuery, [values], (err, data) => {
//       if (err) return res.status(500).json(err);
//       return res.status(200).json("User has been created.");
//     });
//   });
// };



export const login = (req, res) => {
  const q = `
    SELECT u.*, r.name as role_name
    FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.username = ? AND u.status = 'active'
  `;

  db.query(q, [req.body.username], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0) return res.status(404).json("User not found or inactive!");

    const user = data[0];

    // Check if password exists (for non-Google OAuth users)
    if (!user.password) {
      return res.status(400).json("Please use Google Sign-in for this account!");
    }

    const checkPassword = bcrypt.compareSync(
      req.body.password,
      user.password
    );

    if (!checkPassword)
      return res.status(400).json("Wrong password or username!");

    // Update last login
    const updateLoginQuery = "UPDATE users SET last_login = NOW() WHERE id = ?";
    db.query(updateLoginQuery, [user.id]);

    // Get user permissions
    const permissionsQuery = `
      SELECT p.name as permission_name
      FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
      WHERE rp.role_id = ?
    `;

    db.query(permissionsQuery, [user.role_id], (err, permissionsData) => {
      if (err) return res.status(500).json(err);

      const permissions = permissionsData.map(p => p.permission_name);

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);

      const { password, ...userWithoutPassword } = user;
      const responseUser = {
        ...userWithoutPassword,
        role: user.role_name,
        permissions: permissions
      };

      res
        .cookie("accessToken", token, {
          httpOnly: true,
        })
        .status(200)
        .json(responseUser);
    });
  });
};

export const logout = (req, res) => {
  res.clearCookie("accessToken", {
    secure: true,
    sameSite: "none"
  }).status(200).json("User has been logged out.")
};

// Google OAuth success callback
export const googleAuthSuccess = (req, res) => {
  try {

    if (!req.user) {
      console.error("No user object in request");
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
    }

    // Generate JWT token
    const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET);

    // Remove password from user object
    const { password, ...userWithoutPassword } = req.user;

    // Set cookie and redirect to frontend home page
    res
      .cookie("accessToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      })
      .redirect(`${process.env.FRONTEND_URL}/`);

  } catch (error) {
    console.error("Google auth success error:", error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
  }
};

// Google OAuth failure callback
export const googleAuthFailure = (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_cancelled`);
};

// Check current authentication status
export const checkAuth = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, process.env.JWT_SECRET, (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = `
      SELECT u.*, r.name as role_name
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = ? AND u.status = 'active'
    `;
    
    db.query(q, [userInfo.id], (err, data) => {
      if (err) return res.status(500).json(err);
      if (data.length === 0) return res.status(404).json("User not found or inactive!");

      const user = data[0];

      // Get user permissions
      const permissionsQuery = `
        SELECT p.name as permission_name
        FROM role_permissions rp
        JOIN permissions p ON rp.permission_id = p.id
        WHERE rp.role_id = ?
      `;

      db.query(permissionsQuery, [user.role_id], (err, permissionsData) => {
        if (err) return res.status(500).json(err);

        const permissions = permissionsData.map(p => p.permission_name);

        const { password, ...userWithoutPassword } = user;
        const responseUser = {
          ...userWithoutPassword,
          role: user.role_name,
          permissions: permissions
        };

        return res.status(200).json(responseUser);
      });
    });
  });
};
