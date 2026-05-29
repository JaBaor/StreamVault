const { ForbiddenError } = require("../errors/errors");

function authorizeAdmin(req,res,next){
if(!req.user.role !== "admin"){
  return next(new ForbiddenError("Admin access required"))
}

next();
};
module.exports = authorizeAdmin;