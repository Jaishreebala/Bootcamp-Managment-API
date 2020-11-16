const fs = require('fs');
const mongoose = require("mongoose");
const colors = require('colors');
const dotenv = require('dotenv');
const dbConnect = require('./config/db')
// load env
dotenv.config({ path: './config/config.env' })

// load models
const Bootcamp = require("./models/Bootcamp");
const Course = require("./models/Course");
const User = require("./models/User");
const Review = require("./models/Review");

// connect to DB
dbConnect();

// Read json files
const Bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8'));
const Courses = JSON.parse(fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf-8'));
const Users = JSON.parse(fs.readFileSync(`${__dirname}/_data/users.json`, 'utf-8'));
const Reviews = JSON.parse(fs.readFileSync(`${__dirname}/_data/reviews.json`, 'utf-8'));

// Import to DB
const importsData = async () => {
    try {
        await Bootcamp.create(Bootcamps);
        await Course.create(Courses);
        await User.create(Users);
        await Review.create(Reviews);

        console.log("Data imported".green.inverse)
        process.exit();
    } catch (err) {
        console.error(err)
    }
}
// Delete from DB
const deleteData = async () => {
    try {
        await Bootcamp.deleteMany();
        await Course.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();

        console.log("Data destroyed".red.inverse)
        process.exit();
    } catch (err) {
        console.error(err)
    }
}

if (process.argv[2] === '-i') {
    importsData()
}
else if (process.argv[2] === '-d') {
    deleteData()
}