const { ForbiddenError } = require("../errors/errors");

function authorizeAdmin(req,res,next){
if(String(req.user.role).toUpperCase() !== "ADMIN"){
  return next(new ForbiddenError("Admin access required"))
}

next();
};
module.exports = authorizeAdmin;
