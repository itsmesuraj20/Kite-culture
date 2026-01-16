const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    if (err.type === 'validation') {
        return res.status(400).json({
            success: false,
            error: 'Validation Error',
            details: err.errors
        });
    }

    if (err.code === '23505') {
        return res.status(409).json({
            success: false,
            error: 'Duplicate entry'
        });
    }

    if (err.code === '23503') {
        return res.status(400).json({
            success: false,
            error: 'Referenced record not found'
        });
    }

    const statusCode = err.statusCode || 500;
    const message = process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : err.message;

    res.status(statusCode).json({
        success: false,
        error: message
    });
};

const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { errorHandler, asyncHandler };
