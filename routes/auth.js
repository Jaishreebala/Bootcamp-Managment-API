const express = require('express');
const router = express.Router();
const { protect } = require("../Middleware/auth")
const { register, login, getMe, forgotPassword, resetPassword, updateUserDetail, updateUserPassword, logout } = require('../Controller/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resetToken', resetPassword);
router.put('/updateuserdetail', protect, updateUserDetail);
router.put('/updateuserpassword', protect, updateUserPassword);
router.get('/me', protect, getMe);
module.exports = router;