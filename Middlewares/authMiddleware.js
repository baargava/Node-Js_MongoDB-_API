const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = function(req, res, next) {
    const token = req.header("Authorization");
    
    // Step 1: Check if token exists
    if (!token) {
        return res.status(401).json({ message: "Access Denied! No token provided" });
    }

    try {
        // Step 2: Verify Token
        const verified = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_Secret_Key);
        console.log("🔐 Verified User:", verified);
        req.user = verified;
        next(); // Move to next middleware or route
    } catch (error) {
        res.status(400).json({ message: "Invalid Token" });
    }
};
