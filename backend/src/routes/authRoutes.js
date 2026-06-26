const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const validate = require("../middleware/validate")
const {registerRules, loginRules} = require("../middleware/validators/authValidators")
const { loginLimiter } = require("../middleware/rateLimiter")

router.post("/register", registerRules, validate, authController.register);
router.post("/login",loginLimiter, loginRules, validate, authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);

module.exports = router;