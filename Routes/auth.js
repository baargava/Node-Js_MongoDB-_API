const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../Models/User'); 
const jwt = require('jsonwebtoken');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication routes
 */

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userName
 *               - email
 *               - password
 *             properties:
 *               userName:
 *                 type: string
 *                 example: "JohnDoe"
 *               email:
 *                 type: string
 *                 example: "johndoe@example.com"
 *               password:
 *                 type: string
 *                 example: "securepassword123"
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: User already exists
 *       500:
 *         description: Internal Server Error
 */
router.post('/register', async (req, res) => {
    try {
        console.log("📩 Request Body:", req.body);
        const { userName, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log("⚠️ User already exists");
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const newUser = new User({ userName, email, password: hashedPassword });

        // Save to DB
        await newUser.save();

        console.log("✅ User registered:", newUser);
        res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
        console.error("❌ Error in /register:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Retrieve all users
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: List of registered users
 *       500:
 *         description: Internal Server Error
 */
router.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        console.log("📤 Users:", users);
        res.status(200).json(users);
    } catch (error) {
        console.error("❌ Error in /users:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: "johndoe@example.com"
 *               password:
 *                 type: string
 *                 example: "securepassword123"
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       400:
 *         description: Invalid credentials or user not found
 *       500:
 *         description: Internal Server Error
 */
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const findUserByEmail = await User.findOne({ email });
        if (!findUserByEmail) {
            return res.status(400).json({ message: "User not found" });
        }
        const isMatch = await bcrypt.compare(password, findUserByEmail.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const payload = {
            id: findUserByEmail._id,
            userName: findUserByEmail.userName,
            email: findUserByEmail.email
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: "1h" });

        res.status(200).json({ 
            message: "Logged in successfully", 
            token,
            user: { 
                id: findUserByEmail._id, 
                userName: findUserByEmail.userName, 
                email: findUserByEmail.email 
            } 
        });
    } catch (error) {
        console.error("❌ Error in /login:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
