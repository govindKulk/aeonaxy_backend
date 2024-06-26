const Mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');

const Schema = Mongoose.Schema
const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    otl: {
        type: String
    },
    otlExpiresAt: {
        type: Date
    },
    location: {
        type: String
    },
    profilePic: {
        type: String
    }
})

//Signup method/function to hash the password and validate the email
userSchema.statics.signup = async function(userData){
    const {email, password, name, username, otlToken, otlExpiry: otlExpiresAt} = userData;
    //Validation checks
    if(!email || !password || !name || !username){
        throw Error("All fields are required");
    }
    if(!validator.isEmail(email)){
        throw Error("Enter a valid email address");
    }
    if(!validator.isStrongPassword(password)){
        throw Error("Enter a strong password");
    }

    //Email checking inside the database
    const exists = await this.findOne({email});
    if(exists){
        throw Error("Email already exists")
    }

    //Username checking inside the database
    const usernameExists = await this.findOne({username});
    if(usernameExists){
        throw Error("Username already exists")
    }

    //Generating the salt and then hash for the password    
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt)
    const user = await this.create({email, password: hash, name, username, otl: otlToken, otlExpiresAt});

    //returns the created user
    return user;
}

//Login method/function to login the users by checking the credentials
userSchema.statics.login = async function( username, password){
    //Validation checks
    if(!password || !username){
        throw Error("All fields are required");
    }
    const user = await this.findOne({username});

    if(!user){
        throw Error("User not found, please signup or register first")
    }


    const match = bcrypt.compare(password, user.password);
    

    if(!match){
        throw Error("Password don't match")
    }

    return user;

}

module.exports = Mongoose.model('User', userSchema)