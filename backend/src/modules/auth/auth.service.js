import pool from "../../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerUser = async (userData) => {
    const { name, email, password, role } = userData;

    // Check existing user
    const [existing] = await pool.query(
        "SELECT id FROM users WHERE email = ?",
        [email]
    );

    if (existing.length > 0) {
        throw new Error("Email already registered");
    }

    // Find role
    const [roles] = await pool.query(
        "SELECT id FROM roles WHERE name = ?",
        [role]
    );

    if (roles.length === 0) {
        throw new Error("Invalid user role");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const [result] = await pool.query(
        `INSERT INTO users
        (name, email, password_hash, role_id)
        VALUES (?, ?, ?, ?)`,
        [name, email, hashedPassword, roles[0].id]
    );

    return {
        id: result.insertId,
        name,
        email,
        role
    };
};

export const loginUser = async (email, password) => {
    const [users] = await pool.query(
        `SELECT users.id, users.name, users.email,
                users.password_hash, users.status,
                roles.name AS role
         FROM users
         JOIN roles ON users.role_id = roles.id
         WHERE users.email = ?`,
        [email]
    );

    if (users.length === 0) {
        throw new Error("Invalid email or password");
    }

    const user = users[0];

    if (user.status !== "active") {
        throw new Error("Account is inactive or blocked");
    }

    const passwordMatch = await bcrypt.compare(
        password,
        user.password_hash
    );

    if (!passwordMatch) {
        throw new Error("Invalid email or password");
    }

    const token = jwt.sign(
        {
            id: user.id,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1d"
        }
    );

    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    };
};