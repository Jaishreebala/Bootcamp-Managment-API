const errorResponse = require('../utils/errorResponse')
const asyncHandler = require('../Middleware/asyncHandler')
const Review = require('../models/Review')
const Bootcamp = require('../models/Bootcamp');


// @desc: Get Reviews
// @route: /api/v1/bootcamps/:bootcampId/reviews || /api/v1/reviews/
// @access: Public

exports.getReviews = asyncHandler(async (req, res, next) => {
    if (req.params.bootcampId) {
        const reviews = await Review.find({ bootcamp: req.params.bootcampId })

        res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        })
    } else {
        res.status(200).json(res.advancedResults)
    }
})

// @desc:   Get a Review
// @route:  /api/v1/reviews/:reviewId
// @access: Public

exports.getReview = asyncHandler(async (req, res, next) => {
    const review = await Review.findById(req.params.id).populate({ path: 'bootcamp', select: 'name description' });
    if (!review) {
        return next(new errorResponse(`No review found with an ID of ${req.params.id}`, 404));
    }
    res.status(200).json({ success: true, data: review })
})

// @desc:   Add a Review
// @route:  POST /api/v1/bootcamps/:bootcampId/reviews
// @access: Private (admin/users)

exports.addReview = asyncHandler(async (req, res, next) => {
    req.body.bootcamp = req.params.bootcampId
    req.body.user = req.user.id;
    const bootcamp = Bootcamp.findOne({ bootcamp: req.params.bootcampId })
    if (!bootcamp) {
        return next(new errorResponse(`No Bootcamp found with an ID of ${req.params.bootcampId}`, 404));
    }

    const review = await Review.create(req.body);
    if (!review) {
        return next(new errorResponse(`No review found with an ID of ${req.params.id}`, 404));
    }
    res.status(200).json({ success: true, data: review })
})

// @desc: Update Courses
// @route: /api/v1/reviews/:id
// @access: Private (user who created / admin)

exports.updateReview = asyncHandler(async (req, res, next) => {
    let review = await Review.findById(req.params.id);

    if (!review) {
        return next(new errorResponse(`No review with the ID of ${req.params.id}`), 404)
    }
    if (review.user.toString() != req.user.id && req.user.role !== "admin") {
        return next(new errorResponse(`User ${req.user.id} is not authorized to update this review ${req.params.id}`), 401)
    }
    course = await Review.findByIdAndUpdate(req.params.id, req.body, {
        new: true, runValidators: true
    })

    res.status(200).json({
        success: true,
        data: review
    })
})

// @desc: Delete Courses
// @route: /api/v1/reviews/:id
// @access: Private (user who created / admin)

exports.deleteReview = asyncHandler(async (req, res, next) => {
    const review = await Review.findById(req.params.id);

    if (!review) {
        return next(new errorResponse(`No review with the ID of ${req.params.id}`), 404)
    }
    if (review.user.toString() != req.user.id && req.user.role !== "admin") {
        return next(new errorResponse(`User ${req.user.id} is not authorized to delete this review ${req.params.id}`), 401)
    }
    await Review.findByIdAndDelete(req.params.id)

    res.status(200).json({
        success: true,
        data: {}
    })
})