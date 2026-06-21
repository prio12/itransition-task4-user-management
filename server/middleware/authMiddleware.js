import jwt from "jsonwebtoken";
import { db } from "../config/db.js";

export const authenticateAndCheckStatus = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const query = `SELECT id, status FROM users WHERE id = $1;`;
    const result = await db.query(query, [decoded.id]);

    if (result.rows.length === 0) {
      return res
        .status(403)
        .json({ message: "User account no longer exists." });
    }

    const user = result.rows[0];

    if (user.status === "blocked") {
      return res.status(403).json({
        message: "Your account has been blocked by an administrator.",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("Middleware Authorization Error:", error);
    return res
      .status(401)
      .json({ message: "Invalid or expired session token metadata." });
  }
};
