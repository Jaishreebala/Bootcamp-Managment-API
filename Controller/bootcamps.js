const errorResponse = require('../utils/errorResponse');
const asyncHandler = require('../Middleware/asyncHandler');
const Bootcamp = require('../models/Bootcamp');
const geocoder = require('../utils/geocoder');
const path = require("path");

// const dotenv = require('dotenv');

// dotenv.config({ path: "./config/config.env" });

// @desc: Get all bootcamps
// @route: /api/v1/bootcamps
// @access: Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

// @desc: Get a bootcamps
// @route: /api/v1/bootcamps/id
// @access: Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id).populate('courses');
    if (!bootcamp) {
        return next(new errorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
    }
    res.status(200).json({ success: true, data: bootcamp });

})

// @desc: Create a bootcamps
// @route: /api/v1/bootcamps
// @access: Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
    // Add user to body
    req.body.user = req.user.id;

    // Check for published bootcamps
    const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });
    if (publishedBootcamp && req.user.role !== 'admin') {
        return next(new errorResponse(`User with id: ${req.user.id} can only create one Bootcamp.`), 400)
    }

    const bootcamp = await Bootcamp.create(req.body);
    res.status(201).json({ success: true, data: bootcamp })
})

// @desc: Update a bootcamps
// @route: /api/v1/bootcamps
// @access: Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
    let bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp) {
        return next(new errorResponse(`No bootcamp with the ID of ${req.params.id}`), 404);
    }
    // Confirm logged in user is bootcamp owner / admin
    if (bootcamp.user.toString() != req.user.id && req.user.role !== "admin") {
        return next(new errorResponse(`User ${req.user.id} is not authorized to update this Bootcamp`), 401)
    }
    bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    res.status(200).json({ success: true, data: bootcamp })
})

// @desc: Delete a bootcamps
// @route: /api/v1/bootcamps
// @access: Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp) {
        return res.status(400).json({ success: false })
    }
    // Confirm logged in user is bootcamp owner / admin
    if (bootcamp.user.toString() != req.user.id && req.user.role !== "admin") {
        return next(new errorResponse(`User ${req.user.id} is not authorized to delete this Bootcamp`), 401)
    }
    bootcamp.remove();
    res.status(200).json({ success: true, data: {} })
})

// @desc: Upload a photo
// @route: PUT /api/v1/bootcamps/:id/photo
// @access: Private
exports.uploadPhotoBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp) {
        return next(new errorResponse(`No bootcamp with the ID of ${req.params.id}`), 400)
    }
    if (!req.files) {
        return next(new errorResponse(`Please upload a file`), 400)
    }
    if (!req.files.file.mimetype.startsWith("image")) {
        return next(new errorResponse(`Please upload an image file`), 400)
    }
    if (req.files.file.size > process.env.FILE_MAX_UPLOAD) {
        return next(new errorResponse(`File size should be less than ${process.env.FILE_MAX_UPLOAD / 1000}KB`), 400)
    }
    // Confirm logged in user is bootcamp owner / admin
    if (bootcamp.user.toString() != req.user.id && req.user.role !== "admin") {
        return next(new errorResponse(`User ${req.user.id} is not authorized to update this Bootcamp`), 401)
    }
    req.files.file.name = `Photo_${req.params.id}${path.parse(req.files.file.name).ext}`;
    req.files.file.mv(`.${process.env.FILE_UPLOAD_PATH}/${req.files.file.name}`, async err => {
        if (err) {
            console.log(err);
            return next(new errorResponse(`Problem with file upload, try again`), 500)
        }
        await Bootcamp.findByIdAndUpdate(req.params.id, { photo: req.files.file.name });
        res.status(200).json({ success: true, data: req.files.file.name })

    })
})

// @desc: Get bootcamps within radius
// @route: /api/v1/bootcamps/radius/:zipcode/:distance
// @access: Private
exports.getBootcampsByRadius = asyncHandler(async (req, res, next) => {
    let { zipcode, distance } = req.params;

    // Get lat & long from gc
    let loc = await geocoder.geocode(zipcode)
    let lat = loc[0].latitude;
    let lng = loc[0].longitude;

    // Calc radians 
    // Earth rad 6378 km
    const radius = distance / 3963;
    const bootcamps = await Bootcamp.find({
        location: {
            $geoWithin: { $centerSphere: [[lng, lat], radius] }
        }
    })

    res.status(200).json({ success: true, count: bootcamps.length, data: { bootcamps } })
})