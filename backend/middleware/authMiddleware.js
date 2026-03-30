const jwt = require('jsonwebtoken');

/**
 * verifyToken  — Express middleware that validates the JWT in the Authorization header.
 *   Usage: app.get('/api/admin/...', verifyToken, requireAdmin, handler)
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

/**
 * requireAdmin — must be used AFTER verifyToken.
 *   Only allows through users whose role is 'ADMIN'.
 */
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  next();
};

module.exports = { verifyToken, requireAdmin };
