import express from "express";
import {
  blockUsers,
  deleteUnverifiedUsers,
  deleteUsers,
  getAllUsers,
  loginUser,
  registerUser,
  unblockUsers,
  verifyEmail,
} from "../controllers/authController.js";
import { authenticateAndCheckStatus } from "../middleware/authMiddleware.js";

const router = express.Router();

//Public Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/verify-email", verifyEmail);

//protected routes
router.get("/users", authenticateAndCheckStatus, getAllUsers);
router.post("/users/block", authenticateAndCheckStatus, blockUsers);
router.post("/users/unblock", authenticateAndCheckStatus, unblockUsers);
router.post("/users/delete", authenticateAndCheckStatus, deleteUsers);
router.delete(
  "/users/purge-unverified",
  authenticateAndCheckStatus,
  deleteUnverifiedUsers,
);
export default router;
