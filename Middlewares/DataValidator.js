require('dotenv').config();

module.exports = function(req, res, next) {
    const { name, price, description, category } = req.body;

    if (!name || !price || !description || !category) {
        return res.status(400).json({ error: "Please enter all fields" });
    }

    next();
}