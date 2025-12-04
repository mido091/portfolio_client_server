const jwt = require("jsonwebtoken");
require("dotenv").config();


function verifyToken(req, res, next){
   const header = req.headers.authorization;
   if(!header){
      return res.status(401).json({message: "no token provided"});
   }
   const token = header.split(" ")[1];
   jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if(err){
         return res.status(401).json({message: "invalid token"});
      }
      req.user = decoded;
      next();
   });
}

//owner

function verifyOwner(req, res, next){
    if(!req.user){
        return res.status(401).json({message: "invalid token"});
    }
   if(req.user.role !== "owner"){
      return res.status(401).json({message: "invalid role"});
   }
   next();
}

// admin || onwer

function verifyAdminOrOwner(req, res, next){
    if(!req.user){
        return res.status(401).json({message: "invalid token"});
    }
   if(req.user.role == "user"){
      return res.status(401).json({message: "invalid role"});
   }
   next();
}
module.exports = {
    verifyToken,
    verifyOwner,
    verifyAdminOrOwner
};