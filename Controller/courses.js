const errorResponse = require('../utils/errorResponse')
const asyncHandler = require('../Middleware/asyncHandler')
const Course = require('../models/Course')
const Bootcamp = require('../models/Bootcamp');

// @desc: Get Courses
// @route: /api/v1/bootcamps/:bootcampId/courses || /api/v1/Courses/
// @access: Public

exports.getCourses = asyncHandler(async (req, res, next) => {
    if (req.params.bootcampId) {
        const courses = await Course.find({ bootcamp: req.params.bootcampId })

        res.status(200).json({
            success: true,
            count: courses.length,
            data: courses
        })
    } else {
        res.status(200).json(res.advancedResults)
    }
})

// @desc: Get Courses
// @route: /api/v1/courses/:id
// @access: Public

exports.getCourse = asyncHandler(async (req, res, next) => {
    let query;
    query = Course.findById(req.params.id).populate({
        path: 'bootcamp',
        select: "name description"
    });

    const course = await query;

    if (!course) {
        return next(new errorResponse(`No course with the ID of ${req.params.id}`), 404)
    }
    res.status(200).json({
        success: true,
        data: course
    })
})


// @desc: Post Courses
// @route: /api/v1/bootcamps/:bootcampId/courses
// @access: Private

exports.addCourse = asyncHandler(async (req, res, next) => {

    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user.id;

    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    if (!bootcamp) {
        return next(new errorResponse(`No bootcamp with the ID of ${req.params.bootcampId}`), 404)
    }
    // Confirm logged in user is bootcamp owner / admin
    if (bootcamp.user.toString() != req.user.id && req.user.role !== "admin") {
        return next(new errorResponse(`User ${req.user.id} is not authorized to create courses under this Bootcamp ${req.params.bootcampId}`), 401)
    }
    const course = await Course.create(req.body);
    res.status(200).json({
        success: true,
        data: course
    })
})


// @desc: Update Courses
// @route: /api/v1/courses/:id
// @access: Private

exports.updateCourse = asyncHandler(async (req, res, next) => {
    let course = await Course.findById(req.params.id);

    if (!course) {
        return next(new errorResponse(`No course with the ID of ${req.params.id}`), 404)
    }
    if (course.user.toString() != req.user.id && req.user.role !== "admin") {
        return next(new errorResponse(`User ${req.user.id} is not authorized to update this course ${req.params.id}`), 401)
    }
    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true, runValidators: true
    })

    res.status(200).json({
        success: true,
        data: course
    })
})


// @desc: Delete Courses
// @route: /api/v1/courses/:id
// @access: Private

exports.deleteCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id);

    if (!course) {
        return next(new errorResponse(`No course with the ID of ${req.params.id}`), 404)
    }
    if (course.user.toString() != req.user.id && req.user.role !== "admin") {
        return next(new errorResponse(`User ${req.user.id} is not authorized to delete this course ${req.params.id}`), 401)
    }
    await course.remove();

    res.status(200).json({
        success: true,
        data: {}
    })
})