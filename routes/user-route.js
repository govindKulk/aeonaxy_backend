const express = require('express');
const router = express.Router();

//Controllers
const {
    loginUser,
    signupUser,
    verifyEmail
} = require('../controllers/user-controller')

//Middleware
router.use(express.json());

//Login the user
router.post('/login',loginUser)

//Signup/Register the user
router.post('/signup', signupUser)

// email verification route
router.post('/verify', verifyEmail)

module.exports = router;