const express = require('express');
const { getCourses, getCourse, addCourse, updateCourse, deleteCourse } = require('../Controller/courses');
const Course = require('../models/Course');
const { protect, authorize } = require("../Middleware/auth")

const advancedResults = require('../Middleware/advancedResults');

const router = express.Router({ mergeParams: true });


router.route('/').get(advancedResults(Course, {
    path: 'bootcamp',
    select: "name description"
}), getCourses).post(protect, addCourse);
router.route('/:id').get(getCourse).put(protect, authorize('publisher', 'admin'), updateCourse).delete(protect, authorize('publisher', 'admin'), deleteCourse);
module.exports = router;
// , authorize('publisher', 'admin'),