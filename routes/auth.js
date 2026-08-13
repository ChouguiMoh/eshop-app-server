const express = require("express");
const AppError = require("../utils/appError");
const User = require("../models/userModel");
const { signToken, verifyToken } = require("../utils/jwtHelper");
const protect = require("../middleware/protect");
const router = express.Router();

// Define your authentication routes here
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email }).select('+password');

    // Check if user exists and password is correct
    if (!user || !(await user.correctPassword(password, user.password))) {
        throw new AppError('Incorrect email or password', 401);
    }

    // Generate JWT token
    const accessToken = signToken({ id: user._id });
    const refreshToken = signToken({ id: user._id }, '7d'); // Refresh token valid for 7 days

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        sameSite: 'Strict', // Prevent CSRF attacks
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    res.status(200).json({
        status: 'success',
        token: accessToken
    });
});

router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    // Create a new user
     await User.create({
        name,
        email,
        password
    });
    res.status(201).json({
        status: 'success',
        message: 'User registered successfully',
    });
});

router.post("/refresh-token", async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        throw new AppError('No refresh token provided', 401);
    }

    // Verify the refresh token
    const decoded = verifyToken(refreshToken);

    // Generate a new access token
    const accessToken = signToken({ id: decoded.id });

    res.status(200).json({
        status: 'success',
        token: accessToken
    });
});

router.post("/logout", (req, res) => {
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict'
    });
    res.status(200).json({
        status: 'success',
        message: 'Logged out successfully'
    });
});

router.get("/protected", protect, async (req, res) => {
    const user = await User.findById(req.user.id).select('-password'); // Exclude password from the response
    if (!user) {
        throw new AppError('User not found', 404);
    }
    res.status(200).json({
        status: 'success',
        user
    });
});

module.exports = router;