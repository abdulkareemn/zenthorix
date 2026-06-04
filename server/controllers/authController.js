const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { normalizeEmail } = require('../utils/validators');

function cookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  };
}

function signToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign({ id: user._id.toString(), role: user.role, sessionVersion: user.sessionVersion || 0 }, process.env.JWT_SECRET, { expiresIn: '8h' });
}

async function login(req, res) {
  try {
    const email = normalizeEmail(req.body.email);
    const { password } = req.body;
    const requestedRole = typeof req.body.role === 'string' ? req.body.role.trim() : '';

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    if (requestedRole && !['admin', 'student'].includes(requestedRole)) {
      return res.status(400).json({ message: 'Invalid login portal' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials or unauthorized student.' });
    }

    if (requestedRole && user.role !== requestedRole) {
      const message = requestedRole === 'student'
        ? 'Invalid credentials or unauthorized student.'
        : 'Invalid admin access code';
      return res.status(403).json({ message });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid credentials or unauthorized student.' });
    }

    if (user.status === 'blocked') {
      return res.status(403).json({ message: 'Account is blocked' });
    }

    user.sessionVersion = (user.sessionVersion || 0) + 1;
    user.lastLoginAt = new Date();
    user.lastLoginIp = req.ip || req.socket?.remoteAddress || '';
    user.lastLoginDevice = req.headers['user-agent'] || '';
    await user.save();

    const token = signToken(user);
    res.cookie('token', token, cookieOptions());

    return res.status(200).json({
      message: 'Login successful',
      user: user.toSafeJSON()
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Login failed' });
  }
}

async function me(req, res) {
  try {
    return res.status(200).json({ user: req.user.toSafeJSON() });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load user' });
  }
}

async function logout(req, res) {
  try {
    res.clearCookie('token', cookieOptions());
    return res.status(200).json({ message: 'Logged out' });
  } catch (error) {
    return res.status(500).json({ message: 'Logout failed' });
  }
}

module.exports = {
  login,
  logout,
  me
};
