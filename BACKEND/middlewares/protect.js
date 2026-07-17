const jwt = require("jsonwebtoken");
const expressError = require("../utils/expressError");


const protect = (req,res,next)=> {
    const authHeader = req.headers.authorization;

    if(!authHeader){
      throw new expressError(401,"Unauthorized");
    }
    const token = authHeader.split(" ")[1];
    if (!token){
      throw new expressError(401, "Token missing");
    }
    
     try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        req.userId = decoded.id;
        req.role = decoded.role;
        next();
     }catch(err){
        throw new expressError(401,"Invalid token");
     }
};

const adminOnly = (req,res, next)=> {
  if(req.role !== "admin"){
    throw new expressError(401, "Access denied");
  }
  next();
};

const userOnly = (req,res,next)=> {
  if(req.role !== "user"){
    throw new expressError(403, "Access denied");
  }
  next();
};
module.exports = {
  protect,
  adminOnly,
  userOnly,
};
