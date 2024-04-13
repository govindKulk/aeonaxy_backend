const sendEmail  = require('../helpers/mail.helpers')
const { generateOTL, generateOTLExpiration } = require('../helpers/otl.helpers')
const User = require('../models/userModel')
const jwt = require('jsonwebtoken')

//create a token
const createToken = (_id)=>{
    //jwt.sing has the three parameters - 
    //1) - payload (it should contain non sensitive information) it will be used for generating the strong signature key
    //2) - SECRET key - keep it safe since attackers can access signature using this secret key
    //3) - options object which contains many options like expiresIn which sets the expiry for the token.
    return jwt.sign({_id}, process.env.SECRET, {expiresIn: '3h'})
}

//Login a user
const loginUser = async (req, res)=>{
    const {email, password, name, username} = req.body;
    try{
        const user = await User.login(email, password, name, username);

        //create token
        const token = createToken(user._id);
        res.status(200).json({email, token});
    }
    catch(error){
        res.status(404).json({error: error.message});
    }
    
}

//Signup a user
const signupUser = async (req, res)=>{
    const {email, password, username, name} = req.body;
    try{
        const otlToken = generateOTL(email);
        const otlExpiry = generateOTLExpiration()
        const userData = {email, password, username, name, otlToken, otlExpiry}
        const user = await User.signup(userData);
        
        
        const token = createToken(user._id);
        const verificationLink = `http://localhost:3000/verify/${otlToken}`
        const htmlContent = `
        <div style=${{backgroundColor: "red", display: 'flex', justifyContent: "center", alignItems:"center"}}>
              <h1 style=${{color: "white", fontSize: "2rem", fontWeight: "bold"}}>Hi, Welcome to Dribble. </h1>
              <p>Please Verify Your Email By Clicking Following Link</p>
              <a href="${verificationLink}" style=${{backgroundColor: "blue", color: "white", fontSize: "1.5rem", textAlign: "centre", textDecoration: "none", width: "100%", display: "block"}}>Verify Now</a>
        </div>
        `

        await sendEmail(email, "Dribble - Email Verification", htmlContent)

        res.status(200).json({email, token, otlToken});
    }
    catch(error){
        res.status(404).json({error: error.message});
    }
}

async function verifyEmail(req, res) {
    const now = Date.now();
    const { otl } = req.body;

    try {
      const user = await User.findOneAndUpdate(
        { otl, otlExpiresAt: { $gt: now } }, // Check for unexpired OTL
        { $unset: { otl: 1, otlExpiresAt: 1 }, emailVerified: true },
        { new: true } // Return the updated user
      );
  
      if (!user) {
        return res.status(404).json({ error: 'Invalid or expired link' });
      }

  
      return res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
      return res.status(500).json({error: `Internal server error ${error.message}`})
    }
}
  

module.exports = {
    loginUser,
    signupUser,
    verifyEmail
}