import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import adminRoutes from "./modules/admin/admin.routes.js";

import pool from "./config/db.js";
import authRoutes from "./modules/auth/auth.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Brightloop API is running"
    });
});

app.get("/api/health/db", async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT DATABASE() AS databaseName"
        );

        res.json({
            success: true,
            message: "MySQL connected successfully",
            database: rows[0].databaseName
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "MySQL connection failed"
        });
    }
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});