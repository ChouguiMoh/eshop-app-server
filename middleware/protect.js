const { verifyToken } = require('../utils/jwtHelper');
const AppError = require('../utils/appError');

const protect = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = verifyToken(token);
        req.user = decoded; // Attach the decoded user information to the request object
        next();
    } catch (err) {
        return next(new AppError('Invalid or expired token. Please log in again.', 401));
    }
};

module.exports = protect;