const express = require('express');
const router = express.Router();
const User = require('../models/userModel')

const { upload } = require('../config/multer.config')
//Controllers
const {
    loginUser,
    signupUser,
    verifyEmail,
    uploadController,
    resendVerifyMail
} = require('../controllers/user-controller');
const requireAuth = require('../middlewares/requireAuth.middle');

//Middleware
router.use(express.json());

//Login the user
router.post('/login', loginUser)

//Signup/Register the user
router.post('/signup', signupUser)

// email verification route
router.post('/verify', verifyEmail)

// resend verification mail
router.post('/resend-verify', requireAuth,  resendVerifyMail);

// protected route to get user document
router.get('/protected', requireAuth, async (req, res) => {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
        return res.status(401).json({ error: "Unauthorized" })
    }
    return res.status(200).json({ user });
})

router.get('/profile', requireAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId);
        return res.status(200).json({ user });

    }catch(error) {
        console.log(error);
        return res.status(400).json({ error: error.message});
    }

})

router.post('/upload/picture', requireAuth, upload.single('profilePic'), uploadController);

module.exports = router;