import bcrypt from 'bcryptjs';
import db from '../config/db.js';
import { generateToken } from '../middleware/auth.js';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (!users || users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User account not found.'
      });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Password incorrect.'
      });
    }

    const token = generateToken(user);

    // Activity log for login
    await db.query(
      'INSERT INTO activity_logs (staff_id, staff_name, action_type, entity_type, entity_reference, description) VALUES (?, ?, ?, ?, ?, ?)',
      [user.id, user.name, 'USER_LOGIN', 'SESSION', `DESK-${user.desk_id || 'OPS'}`, `Staff ${user.name} logged in to Operations Hub`]
    );

    return res.status(200).json({
      success: true,
      message: 'Authentication successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        desk_id: user.desk_id,
        tier: user.tier
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication: ' + error.message
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, name, email, role, department, desk_id, tier, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!users || users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    return res.status(200).json({ success: true, user: users[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

