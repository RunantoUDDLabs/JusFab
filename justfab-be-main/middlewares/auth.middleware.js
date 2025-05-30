const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const EError = require('../utils/EError');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';  // Make sure to store this securely in production
const JWT_LIFETIME = process.env.JWT_LIFETIME || '24h';

exports.isAuth = (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const auth = decoded;
    req.auth = auth;
    next();
  } catch (err) {
    logger.error("invalid token");
    throw new EError(401, err.message);
  }
};

exports.isAdmin = (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  console.log(req.headers);
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const auth = decoded;
    req.auth = auth;
    console.log(auth);
    if (auth.role !== 'ADMIN') { throw new EError(401, 'Not authorized, not an admin'); }
    next();
  } catch (err) {
    logger.error("invalid token");
    throw new EError(401, err.message);
  }
};