const {sendVerificationEmail} = require('../helpers/mail.helpers')
const { generateOTL, generateOTLExpiration } = require('../helpers/otl.helpers')
const User = require('../models/userModel')
const jwt = require('jsonwebtoken')

const { upload } = require('../config/multer.config');
const cloudinary = require('../config/cloudinary.config');

//create a token
const createToken = (_id) => {
    //jwt.sing has the three parameters - 
    //1) - payload (it should contain non sensitive information) it will be used for generating the strong signature key
    //2) - SECRET key - keep it safe since attackers can access signature using this secret key
    //3) - options object which contains many options like expiresIn which sets the expiry for the token.
    return jwt.sign({ _id }, process.env.SECRET, { expiresIn: '3h' })
}

//Login a user
const loginUser = async (req, res) => {
    const { password, username } = req.body;
    try {
        const user = await User.login(username, password);

        //create token
        const token = createToken(user._id);

        res.cookie('token', token, { httpOnly: true, maxAge: 5 * 60 * 1000 });
        res.status(200).json({ message: "successfully loggedin", isEmailVerified: user.emailVerified, token });
    }
    catch (error) {
        res.status(404).json({ error: error.message });
    }

}


//Signup a user
const signupUser = async (req, res) => {
    const { email, password, username, name } = req.body;
    try {
        const otlToken = generateOTL(email);
        const otlExpiry = generateOTLExpiration()
        const userData = { email, password, username, name, otlToken, otlExpiry }
        const user = await User.signup(userData);


        const token = createToken(user._id);
        const verificationLink = `http://localhost:3000/verify/${otlToken}`
        const htmlContent = `
        <div style=${{ backgroundColor: "red", display: 'flex', justifyContent: "center", alignItems: "center" }}>
              <h1 style=${{ color: "white", fontSize: "2rem", fontWeight: "bold" }}>Hi, Welcome to Dribble. </h1>
              <p>Please Verify Your Email By Clicking Following Link</p>
              <a href="${verificationLink}" style=${{ backgroundColor: "blue", color: "white", fontSize: "1.5rem", textAlign: "centre", textDecoration: "none", width: "100%", display: "block" }}>Verify Now</a>
        </div>
        `

        let emailStatus;

        await sendVerificationEmail(email, "Dribble - Email Verification", htmlContent).catch(err => {
            console.log(err);
            emailStatus = "Failed to send email"
        })

        emailStatus = "Successfully sent email"
   
        res.status(201).json({ message: "Succesfully registered! ", isEmailVerified: user.emailVerified, token, emailStatus });
    }
    catch (error) {
        console.log(error)
        res.status(400).json({ error: error.message });
    }
}

async function verifyEmail(req, res) {
    const now = Date.now();
    const { otl } = req.body;
    console.log(otl)

    try {

    
        const user = await User.findOneAndUpdate(
            { otl, otlExpiresAt: { $gt: now } }, // Check for unexpired OTL
            { $unset: { otl: 1, otlExpiresAt: 1 }, emailVerified: true },
            { new: true } // Return the updated user
        );

        console.log(user)

        if (!user) {
            return res.status(404).json({ error: 'Invalid or expired link' });
        }


        return res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
        return res.status(500).json({ error: `Internal server error ${error.message}` })
    }
}


const resendVerifyMail = async (req, res) => {


    const {userId} = req;
    try{
        const user = await User.findById(userId);

    if(user.emailVerified){
        return res.status(400).json({error: "Email already verified"});
    }

    const otlToken = generateOTL(user.email);
    const otlExpiry = generateOTLExpiration()

    await User.updateOne({_id: userId}, {
        otl: otlToken,
        otlExpiresAt: otlExpiry
    })
    const verificationLink = `http://localhost:3000/verify/${otlToken}`
    const htmlContent = `
    <div style=${{ backgroundColor: "red", display: 'flex', justifyContent: "center", alignItems: "center" }}>
          <h1 style=${{ color: "white", fontSize: "2rem", fontWeight: "bold" }}>Hi, Welcome to Dribble. </h1>
          <p>Please Verify Your Email By Clicking Following Link</p>
          <a href="${verificationLink}" style=${{ backgroundColor: "blue", color: "white", fontSize: "1.5rem", textAlign: "centre", textDecoration: "none", width: "100%", display: "block" }}>Verify Now</a>
    </div>
    `

    
    let emailStatus;

    await sendVerificationEmail(user.email, "Dribble - Email Verification", htmlContent).catch(err => {
        console.log(err);
        emailStatus = "Failed to send email"
    })

    emailStatus = "Successfully sent email"

    res.status(201).json({isEmailVerified: user.emailVerified, emailStatus });
    }
    catch(error) {
        console.log(error)
        res.status(500).json({error: error.message})
    
    }
}

const uploadController = async (req, res) => {
    try {
        const filePath = req.file.path;
        console.log(filePath)
        const uploadResponse = await cloudinary.uploader.upload(filePath);
        const userId = req.userId;
        let location = req.body.location;
        console.log(req.body)
        console.log("request file", req.file)
        if(!location){
            location = "Latur"
        }
        const updateResult = await User.updateOne({ _id: userId }, { profilePic: uploadResponse.public_id, location });
        console.log(updateResult)
        res.status(200).json({ message: 'Profile picture uploaded successfully', public_id: uploadResponse.public_id, user: await User.findById(userId)});
    }catch(error){
        console.error('Error uploading profile picture:', error);
        res.status(500).json({ error: 'Failed to upload profile picture'})
    }
   
}


module.exports = {
    loginUser,
    signupUser,
    verifyEmail,
    uploadController,
    resendVerifyMail
}