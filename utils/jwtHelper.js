const jwt = require('jsonwebtoken');
const AppError = require('./appError');

const signToken = (payload, expiresIn) => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: expiresIn || '1h' });
};

const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        throw new AppError('Invalid or expired token', 401);
    }
};

module.exports = { signToken, verifyToken };