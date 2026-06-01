const express     = require("express");
const router      = express.Router();
const ctrl        = require("../controllers/userController");
const verifyToken = require("../middleware/verifyToken");
const validate    = require("../middleware/validate");

const {
  updateProfileRules,
  changePasswordRules,
} = require("../middleware/validators/userValidators");

// All user routes require authentication
router.use(verifyToken);

router.get(  "/me",          ctrl.getMe);
router.put(  "/me",          updateProfileRules,  validate, ctrl.updateMe);
router.put(  "/me/password", changePasswordRules, validate, ctrl.changePassword);



module.exports = router;