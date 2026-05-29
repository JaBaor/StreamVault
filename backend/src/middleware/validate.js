const { validationResult } = require("express-validator");
// This middleware reads whatever errors the validation rules tagged onto req.
// If there are errors → stop the chain and send a structured response.
// If no errors      → call next() so the controller runs.
function validate(req, res, next){
  const errors = validationResult(req)  //read errors collected by check() calls
  if(!errors.isEmpty()){
    return res.status(400).json({
      code: "VALIDATION_ERROR",
      message: "Validation failed",
      details: errors.array().map(err =>({
        field: arr.path,    //which field failed?
        message: err.msg,
      })),
    });
  }
  next();
}

module.exports = validate;