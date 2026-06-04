const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function protect(req, res, next) {
  try {
    const bearer = req.headers.authorization || '';
    const headerToken = bearer.startsWith('Bearer ') ? bearer.slice(7) : null;
    const token = req.cookies?.token || headerToken;

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized', allowed: false, reason: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized', allowed: false, reason: 'Unauthorized' });
    }

    if ((user.sessionVersion || 0) !== (decoded.sessionVersion || 0)) {
      return res.status(401).json({ message: 'Session expired because this account logged in elsewhere', allowed: false, reason: 'Session expired' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized', allowed: false, reason: 'Unauthorized' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    next();
  };
}

module.exports = { protect, requireRole };
