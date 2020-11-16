const errorResponse = require('../utils/errorResponse');
const asyncHandler = require('../Middleware/asyncHandler');
const User = require('../models/User');
const sendMail = require('../utils/sendEmail');
const crypto = require("crypto");

// @desc: Register
// @route: POST /api/v1/auth/register
// @access: Public

exports.register = asyncHandler(async (req, res, next) => {
    // Create User
    const { name, email, password, role } = req.body;
    let user = await User.create({
        name, email, password, role
    })
    // Create Token
    sendTokenResponse(user, 200, res);
})

// @desc: Login
// @route: POST /api/v1/auth/register
// @access: Public

exports.login = asyncHandler(async (req, res, next) => {
    // Find user
    const { email, password } = req.body;
    // Validate their existence
    if (!email || !password) {
        return next(new errorResponse(`Please enter an email and password`, 400))
    }
    let user = await User.findOne({ email }).select('+password')
    // Basic Validation
    if (!user) {
        return next(new errorResponse(`Invalid Credentials`, 401))
    }
    const isMatch = await user.comparePasswords(password);
    if (!isMatch) {
        return next(new errorResponse(`Invalid Credentials`, 401))
    }
    sendTokenResponse(user, 200, res);
})

// @desc: Get current logged in user
// @route: GET /api/v1/auth/me
// @access: Private
exports.getMe = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, data: user })
})

// @desc: Log user out
// @route: GET /api/v1/auth/logout
// @access: Private
exports.logout = asyncHandler(async (req, res, next) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    })
    res.status(200).json({ success: true, data: {} })
})

// @desc:  Update email and user name
// @route: PUT /api/v1/auth/updateuserdetail
// @access: Private
exports.updateUserDetail = asyncHandler(async (req, res, next) => {
    const fieldsToUpdate = {
        name: req.body.name,
        email: req.body.email
    }
    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: user })
})

// @desc:  Update password
// @route: PUT /api/v1/auth/updateuserpassword
// @access: Private
exports.updateUserPassword = asyncHandler(async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        return next(new errorResponse(`Please enter password`, 400));
    }
    const user = await User.findById(req.user.id).select("+password");
    const isMatch = await user.comparePasswords(currentPassword);
    if (!isMatch) {
        return next(new errorResponse(`Wrong password`, 401))
    }
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });
    sendTokenResponse(user, 200, res);
})


// @desc: Forgot Password
// @route: POST /api/v1/auth/me
// @access: Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new errorResponse(`User Does Not Exist`, 404));
    }
    const resetToken = await user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;
    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to \n\n ${resetURL}`;

    try {
        await sendMail({
            email: user.email,
            subject: 'Password Reset Token',
            message
        })
    }
    catch (err) {
        console.log(err);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });
        return next(new errorResponse('Email could not be sent', 500))
    }
    res.status(200).json({ success: true, data: 'Email sent' })
})

// @desc: Reset Password
// @route: PUT /api/v1/auth/me
// @access: Private
exports.resetPassword = asyncHandler(async (req, res, next) => {
    // Get hashed token
    const resetTokenPassword = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');
    const user = await User.findOne({
        resetPasswordToken: resetTokenPassword,
        resetPasswordExpire: { $gt: Date.now() }
    });
    if (!user) {
        return next(new errorResponse(`Invalid Token`, 400));
    }
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    sendTokenResponse(user, 200, res);
})



const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getJWTWebToken();
    let options = {
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    }

    if (process.env.NODE_ENV === 'production') {
        options.secure = true
    }

    res.status(statusCode).cookie('token', token, options).json({ success: true, token })
}