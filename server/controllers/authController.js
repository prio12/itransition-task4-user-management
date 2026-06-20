import bcrypt from "bcrypt";
import { db } from "../config/db.js";

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //guild the query with placeholder
    const query = `
      INSERT INTO users (name, email, password) 
      VALUES ($1, $2, $3) 
      RETURNING id, name, email, status, created_at;
    `;

    const values = [name, email, hashedPassword];

    const result = await db.query(query, values);

    return res.status(201).json({
      message: "Registration successful!",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Registration Error:", error);
    if (error.code === "23505") {
      return res.status(400).json({ message: "Email is already registered!" });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
};
