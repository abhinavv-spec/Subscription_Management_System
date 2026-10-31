
import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

async function createAdmin() {
  try {
    // 1. Check whether ADMIN role exists
    const [roles] = await pool.query(
      "SELECT id FROM roles WHERE name = ?",
      ["ADMIN"]
    );

    if (roles.length === 0) {
      throw new Error("ADMIN role not found. Run your initial SQL first.");
    }

    const adminRoleId = roles[0].id;

    // 2. Check whether admin already exists
    const email = "admin@brightloop.com";

    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      console.log("Admin account already exists.");
      return;
    }

    // 3. Hash the password
    const password = "Admin@12345";
    const passwordHash = await bcrypt.hash(password, 12);

    // 4. Insert admin into database
    await pool.query(
      `INSERT INTO users
       (name, email, password_hash, role_id, status)
       VALUES (?, ?, ?, ?, ?)`,
      [
        "Brightloop Admin",
        email,
        passwordHash,
        adminRoleId,
        "active"
      ]
    );

    console.log("Admin account created successfully!");
    console.log("Email:", email);
    console.log("Password:", password);

  } catch (error) {
    console.error("Admin creation failed:", error.message);
  } finally {
    await pool.end();
  }
}

createAdmin();
