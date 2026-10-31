
import express from "express";
import pool from "../../config/db.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { allowRoles } from "../../middleware/role.middleware.js";

const router = express.Router();

router.use(authenticate, allowRoles("ADMIN"));

// Dashboard statistics
router.get("/dashboard/stats", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        (SELECT COUNT(*)
         FROM users u
         JOIN roles r ON u.role_id = r.id
         WHERE r.name = 'CUSTOMER') AS totalCustomers,

        (SELECT COUNT(*) FROM products) AS totalProducts,

        (SELECT COUNT(*) FROM products
         WHERE status = 'active') AS activeProducts,

        (SELECT COUNT(*) FROM plans) AS totalPlans,

        (SELECT COUNT(*) FROM plans
         WHERE status = 'active') AS activePlans
    `);

    const data = Object.fromEntries(
      Object.entries(rows[0]).map(([key, value]) => [
        key,
        Number(value)
      ])
    );

    res.json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Dashboard statistics failed"
    });
  }
});

// Get all products with their plans
router.get("/products", async (req, res) => {
  try {
    const [products] = await pool.query(`
      SELECT
        p.id,
        p.name,
        p.description,
        p.status,
        p.created_at,
        pl.id AS plan_id,
        pl.name AS plan_name,
        pl.price,
        pl.billing_interval,
        pl.status AS plan_status
      FROM products p
      LEFT JOIN plans pl ON pl.product_id = p.id
      ORDER BY p.id DESC, pl.id DESC
    `);

    const result = {};

    for (const row of products) {
      const id = String(row.id);

      if (!result[id]) {
        result[id] = {
          id,
          name: row.name,
          description: row.description,
          status: row.status,
          created_at: row.created_at,
          plans: []
        };
      }

      if (row.plan_id !== null) {
        result[id].plans.push({
          id: String(row.plan_id),
          name: row.plan_name,
          price: Number(row.price),
          billing_interval: row.billing_interval,
          status: row.plan_status
        });
      }
    }

    res.json({
      success: true,
      data: Object.values(result)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products"
    });
  }
});

// Create product
router.post("/products", async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Product name is required"
      });
    }

    const [result] = await pool.query(
      `INSERT INTO products (name, description)
       VALUES (?, ?)`,
      [name.trim(), description || null]
    );

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: { id: String(result.insertId) }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to create product"
    });
  }
});

// Update product
router.put("/products/:id", async (req, res) => {
  try {
    const { name, description, status } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Product name is required"
      });
    }

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product status"
      });
    }

    const [result] = await pool.query(
      `UPDATE products
       SET name = ?, description = ?, status = ?
       WHERE id = ?`,
      [name.trim(), description || null, status, req.params.id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.json({
      success: true,
      message: "Product updated successfully"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to update product"
    });
  }
});

// Deactivate product instead of permanently deleting it
router.delete("/products/:id", async (req, res) => {
  try {
    const [result] = await pool.query(
      `UPDATE products SET status = 'inactive' WHERE id = ?`,
      [req.params.id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.json({
      success: true,
      message: "Product deactivated successfully"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to deactivate product"
    });
  }
});

// Create a subscription plan
router.post("/plans", async (req, res) => {
  try {
    const {
      product_id,
      name,
      description,
      price,
      billing_interval
    } = req.body;

    if (
      !product_id ||
      !name ||
      !name.trim() ||
      price === undefined ||
      !Number.isFinite(Number(price)) ||
      Number(price) < 0 ||
      !["monthly", "yearly", "weekly"].includes(billing_interval)
    ) {
      return res.status(400).json({
        success: false,
        message: "Provide a valid product, name, price and billing interval"
      });
    }

    const [product] = await pool.query(
      "SELECT id FROM products WHERE id = ? AND status = 'active'",
      [product_id]
    );

    if (!product.length) {
      return res.status(400).json({
        success: false,
        message: "Active product not found"
      });
    }

    const [result] = await pool.query(
      `INSERT INTO plans
       (product_id, name, description, price, billing_interval)
       VALUES (?, ?, ?, ?, ?)`,
      [
        product_id,
        name.trim(),
        description || null,
        Number(price),
        billing_interval
      ]
    );

    res.status(201).json({
      success: true,
      message: "Plan created successfully",
      data: { id: String(result.insertId) }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to create plan"
    });
  }
});

// Update a plan
router.put("/plans/:id", async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      billing_interval,
      status
    } = req.body;

    if (
      !name ||
      !name.trim() ||
      !Number.isFinite(Number(price)) ||
      Number(price) < 0 ||
      !["monthly", "yearly", "weekly"].includes(billing_interval) ||
      !["active", "inactive", "archived"].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan details"
      });
    }

    const [result] = await pool.query(
      `UPDATE plans
       SET name = ?, description = ?, price = ?,
           billing_interval = ?, status = ?
       WHERE id = ?`,
      [
        name.trim(),
        description || null,
        Number(price),
        billing_interval,
        status,
        req.params.id
      ]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Plan not found"
      });
    }

    res.json({
      success: true,
      message: "Plan updated successfully"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to update plan"
    });
  }
});

// Deactivate a plan
router.delete("/plans/:id", async (req, res) => {
  try {
    const [result] = await pool.query(
      `UPDATE plans SET status = 'archived' WHERE id = ?`,
      [req.params.id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Plan not found"
      });
    }

    res.json({
      success: true,
      message: "Plan archived successfully"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to archive plan"
    });
  }
});

export default router;
