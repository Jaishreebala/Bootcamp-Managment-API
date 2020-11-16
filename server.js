const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const fileUpload = require('express-fileupload')
const colors = require('colors');
const errorHandler = require('./Middleware/error');
const path = require("path");
const cookieparser = require('cookie-parser');
const mongoSanitze = require('express-mongo-sanitize');
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const cors = require("cors");

// Load env variables
dotenv.config({ path: "./config/config.env" });

const app = express();

// body parser
app.use(express.json());

// set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Use cookie parser
app.use(cookieparser());
// connect to databade
connectDB();

// Route files
const bootcamps = require("./routes/bootcamps");
const courses = require("./routes/courses");
const auth = require('./routes/auth');
const users = require('./routes/users');
const reviews = require('./routes/reviews');
// File upload

app.use(fileUpload());
app.use(mongoSanitze());
app.use(helmet());
app.use(xss());

const limiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 100
})

app.use(limiter);
app.use(hpp());
app.use(cors());


app.use('/api/v1/bootcamps', bootcamps)
app.use('/api/v1/courses', courses)
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/reviews', reviews);

app.use(errorHandler)
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold));

// Handle unhandled promise rejections

process.on("unhandledRejection", (err, promise) => {
    console.log(`Error: ${err.message}`.red);
    server.close(() => {
        process.exit("1")
    });
})
