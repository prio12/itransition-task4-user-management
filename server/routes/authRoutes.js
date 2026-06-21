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

//Global guard for all protected routes
router.use(authenticateAndCheckStatus);

//protected routes
router.get("/users", getAllUsers);
router.post("/users/block", blockUsers);
router.post("/users/unblock", unblockUsers);
router.post("/users/delete", deleteUsers);
router.delete("/users/purge-unverified", deleteUnverifiedUsers);
export default router;
