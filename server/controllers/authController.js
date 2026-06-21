import bcrypt from "bcrypt";
import { db } from "../config/db.js";
import jwt from "jsonwebtoken";
import { dispatchEmail } from "../helpers/dispatchEmail.js";

//register a user
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
  INSERT INTO users (name, email, password, status) 
  VALUES ($1, $2, $3, 'unverified') 
  RETURNING id, name, email, status, created_at;
`;

    const values = [name, email, hashedPassword];

    const result = await db.query(query, values);

    const newUser = result.rows[0];

    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    //send email
    dispatchEmail(newUser.id, newUser.email);

    return res.status(201).json({
      message: "Registration successful!",
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        status: newUser.status,
      },
    });
  } catch (error) {
    console.error("Registration Error:", error);
    if (error.code === "23505") {
      return res.status(400).json({ message: "Email is already registered!" });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
};

//signIn a user
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const query = `SELECT * FROM users WHERE email = $1;`;
    const result = await db.query(query, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = result.rows[0];

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.status === "blocked") {
      return res.status(403).json({
        message: "Your account has been blocked by an administrator.",
      });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return res.status(200).json({
      message: "Login successful!",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//get all users
export const getAllUsers = async (req, res) => {
  try {
    const query = `
      SELECT id, name, email, status, created_at 
      FROM users 
      ORDER BY id ASC;
    `;
    const result = await db.query(query);

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Fetch Users Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//block users
export const blockUsers = async (req, res) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: "No target user IDs provided." });
  }

  try {
    const query = `UPDATE users SET status = 'blocked' WHERE id = ANY($1) RETURNING id;`;
    const result = await db.query(query, [ids]);

    return res.status(200).json({
      message: "Selected users successfully blocked.",
      count: result.rowCount,
    });
  } catch (error) {
    console.error("Bulk Block Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// IMPORTANT: Unblock operation restoring status strings back to 'active'
export const unblockUsers = async (req, res) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: "No target user IDs provided." });
  }

  try {
    const query = `UPDATE users SET status = 'active' WHERE id = ANY($1) RETURNING id;`;
    const result = await db.query(query, [ids]);

    return res.status(200).json({
      message: "Selected users successfully unblocked.",
      count: result.rowCount,
    });
  } catch (error) {
    console.error(" Unblock Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteUsers = async (req, res) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: "No target user IDs provided." });
  }

  try {
    const query = `DELETE FROM users WHERE id = ANY($1);`;
    const result = await db.query(query, [ids]);

    return res.status(200).json({
      message: "Selected rows permanently purged from database.",
      count: result.rowCount,
    });
  } catch (error) {
    console.error("Bulk Delete Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteUnverifiedUsers = async (req, res) => {
  console.log("hello");
  try {
    const query = `DELETE FROM users WHERE status = 'unverified';`;
    const result = await db.query(query);

    return res.status(200).json({
      message: `Successfully cleared unverified accounts. Total records purged: ${result.rowCount}`,
    });
  } catch (error) {
    console.error("Purge Unverified Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//Verify Email
export const verifyEmail = async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res
      .status(400)
      .send("<h1>Verification failed: Missing user ID.</h1>");
  }

  try {
    const findUserQuery = `SELECT status FROM users WHERE id = $1;`;
    const userResult = await db.query(findUserQuery, [id]);

    if (userResult.rows.length === 0) {
      return res.status(404).send("<h1>User account not found.</h1>");
    }

    const currentStatus = userResult.rows[0].status;

    if (currentStatus === "blocked") {
      return res
        .status(400)
        .send(
          "<h1>This account is blocked and cannot be activated via email.</h1>",
        );
    }

    const updateQuery = `
      UPDATE users 
      SET status = 'active' 
      WHERE id = $1 AND status = 'unverified'
      RETURNING id;
    `;
    await db.query(updateQuery, [id]);

    return res.send(`
      <div style="font-family: sans-serif; text-align: center; margin-top: 50px; padding: 20px;">
        <h2 style="color: #2e7d32;">Email Verified Successfully! </h2>
        <p style="color: #555;">Your account status is now active. You can safely return to the application login.</p>
      </div>
    `);
  } catch (error) {
    console.error("Email Verification Error:", error);
    return res
      .status(500)
      .send("<h1>Internal server error during account activation.</h1>");
  }
};
