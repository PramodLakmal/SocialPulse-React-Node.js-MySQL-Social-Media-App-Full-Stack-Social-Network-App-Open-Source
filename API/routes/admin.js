import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUserStatus,
  updateUserRole,
  deleteUser,
  getAllPosts,
  deletePost,
  getAllComments,
  deleteComment,
  getAnalytics,
  getAllRoles
} from "../controllers/admin.js";
import { verifyToken } from "../middleware/index.js";
import { isAdmin, hasPermission, isAdminOrModerator } from "../middleware/rbac.js";

const router = express.Router();

// All admin routes require authentication and admin role
router.use(verifyToken);

// User management routes
router.get("/users", isAdmin, getAllUsers);
router.get("/users/:id", isAdmin, getUserById);
router.put("/users/:id/status", isAdmin, updateUserStatus);
router.put("/users/:id/role", isAdmin, updateUserRole);
router.delete("/users/:id", isAdmin, deleteUser);

// Content management routes (admin and moderator access)
router.get("/posts", isAdminOrModerator, getAllPosts);
router.delete("/posts/:id", hasPermission("manage_posts"), deletePost);

router.get("/comments", isAdminOrModerator, getAllComments);
router.delete("/comments/:id", hasPermission("manage_comments"), deleteComment);

// Analytics routes
router.get("/analytics", hasPermission("view_analytics"), getAnalytics);

// Roles management
router.get("/roles", isAdmin, getAllRoles);

export default router;