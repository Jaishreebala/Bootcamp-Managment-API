const express = require('express');
const router = express.Router();
const { getBootcamps, getBootcamp, createBootcamp, updateBootcamp, deleteBootcamp, getBootcampsByRadius, uploadPhotoBootcamp } = require('../Controller/bootcamps')
const advancedResults = require('../Middleware/advancedResults');
const Bootcamp = require('../models/Bootcamp');
const { protect, authorize } = require("../Middleware/auth")
// Include other resourses
const courseRouter = require('./courses');
const reviewRouter = require('./reviews');

router.use('/:bootcampId/courses', courseRouter);
router.use('/:bootcampId/reviews', reviewRouter);

router.route("/radius/:zipcode/:distance").get(getBootcampsByRadius);
router.route("/").get(advancedResults(Bootcamp, 'courses'), getBootcamps).post(protect, authorize('publisher', 'admin'), createBootcamp);
router.route("/:id").get(getBootcamp).put(protect, authorize('publisher', 'admin'), updateBootcamp).delete(protect, authorize('publisher', 'admin'), deleteBootcamp);
router.route("/:id/photo").put(protect, authorize('publisher', 'admin'), uploadPhotoBootcamp);

module.exports = router;