const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.token;

    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Authentication required'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            error: 'Invalid or expired token'
        });
    }
};

const generateToken = (admin) => {
    return jwt.sign(
        { id: admin.id, username: admin.username },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};

module.exports = { authMiddleware, generateToken };
