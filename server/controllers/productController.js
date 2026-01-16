const productModel = require('../models/productModel');
const { asyncHandler } = require('../middleware/errorHandler');

const productController = {
    getAll: asyncHandler(async (req, res) => {
        const { category } = req.query;
        const products = await productModel.findAll(category);
        
        res.json({
            success: true,
            data: products
        });
    }),

    getById: asyncHandler(async (req, res) => {
        const product = await productModel.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        res.json({
            success: true,
            data: product
        });
    })
};

module.exports = productController;
