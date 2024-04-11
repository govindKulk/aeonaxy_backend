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
        const user = await User.signup(email, password, username, name);

        const token = createToken(user._id);
        res.status(200).json({email, token});
    }
    catch(error){
        res.status(404).json({error: error.message});
    }
}

module.exports = {
    loginUser,
    signupUser
}