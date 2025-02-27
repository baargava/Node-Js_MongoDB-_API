const express = require('express');
const router = express.Router();
const Product = require('../Models/Products');
const Category = require('../Models/Category');
const dataValidator = require('../Middlewares/DataValidator');
const authValidator = require('../Middlewares/authMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - price
 *         - description
 *         - category
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated ID of the product
 *         name:
 *           type: string
 *           description: Name of the product
 *         price:
 *           type: number
 *           description: Price of the product
 *         description:
 *           type: string
 *           description: Product description
 *         category:
 *           type: string
 *           description: Category ID of the product
 *       example:
 *         id: "60a2b72f4f1a2c001c8c4b9d"
 *         name: "Laptop"
 *         price: 1200.99
 *         description: "High-performance laptop"
 *         category: "60b2d89e8f1b2c001a4e7f1c"
 */

/**
 * @swagger
 * /addProduct:
 *   post:
 *     summary: Add a new product
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Product added successfully
 *       500:
 *         description: Internal Server Error
 */
router.post('/addProduct', authValidator, dataValidator, async (req, res) => {
    try {
        const { name, price, description, category } = req.body;
        let categoryId = null;

        if (category) {
            let existingCategory = await Category.findOne({ name: category });
            
            if (existingCategory) {
                categoryId = existingCategory._id;
            } else {
                const newCategory = new Category({ name: category });
                await newCategory.save();
                categoryId = newCategory._id;
            }
        }

        const newProduct = new Product({
            name,
            price,
            description,
            category: categoryId
        });

        await newProduct.save();
        res.status(201).json({ message: "Product added successfully!", product: newProduct });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

/**
 * @swagger
 * /getProducts:
 *   get:
 *     summary: Get all products
 *     tags: [Product]
 *     responses:
 *       200:
 *         description: Successfully retrieved products
 *       500:
 *         description: Internal Server Error
 */
router.get('/getProducts', async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

/**
 * @swagger
 * /getProductByCategory/{categoryId}:
 *   get:
 *     summary: Get products by category ID
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the category to filter products
 *     responses:
 *       200:
 *         description: Successfully retrieved products
 *       500:
 *         description: Internal Server Error
 */
router.get('/getProductByCategory/:categoryId', async (req, res) => {
    try {
        const { categoryId } = req.params;
        const products = await Product.find({ category: categoryId });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;