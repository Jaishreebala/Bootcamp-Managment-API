const errorResponse = require('../utils/errorResponse')

const errorHandler = (err, req, res, next) => {
    console.log(err.stack.red);
    console.log(err)
    let error = { ...err }
    error.message = err.message;
    // Mongoose bad object ID
    if (err.name == 'CastError') {
        const message = `Bootcamp not found with id of ${err.value}`
        error = new errorResponse(message, 404)
    }
    if (err.code === 11000) {
        const message = "Duplicate field value entered";
        error = new errorResponse(message, 404)
    }
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message);
        error = new errorResponse(message, 404)
    }
    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || "server error"
    })
}

module.exports = errorHandler;