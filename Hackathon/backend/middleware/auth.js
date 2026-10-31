import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'brightloop_super_secure_jwt_secret_2026';

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      department: user.department,
      desk_id: user.desk_id,
      tier: user.tier
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied: Authentication token required.'
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired session token. Please sign in again.'
    });
  }
};

// Staff permission middleware (Staff & Admin permitted to execute staff workflows)
export const verifyStaff = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthenticated user.' });
  }

  const role = req.user.role ? req.user.role.toUpperCase() : '';
  if (role !== 'STAFF' && role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Permission denied: Staff operations access required.'
    });
  }
  next();
};

// Strict Admin-only middleware (Explicitly blocks Staff from admin configurations)
export const verifyAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthenticated user.' });
  }

  const role = req.user.role ? req.user.role.toUpperCase() : '';
  if (role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Administrative privilege required. Staff accounts are strictly prohibited from modifying global products, plans, taxes, or creating staff accounts.'
    });
  }
  next();
};

