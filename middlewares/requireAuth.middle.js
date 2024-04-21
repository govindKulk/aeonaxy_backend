const jwt = require("jsonwebtoken");
const requireAuth = (req, res, next) => {


    const {authorization} = req.headers;
    if(!authorization){
        return res.status(401).json({error: "Unauthorized"});
    }

    const token = authorization.replace("Bearer ", "");



    if(!token){
        return res.status(401).json({error: "Unauthorized"})
    }

    const decodedToken = jwt.verify(token, process.env.SECRET);

    if(!decodedToken){
        return res.status(401).json({error: "Unauthorized"})
    }

    req.userId = decodedToken._id;
    next();
}

module.exports = requireAuth;