const express      = require("express");
const router       = express.Router();
const ctrl         = require("../controllers/subscriptionController");
const verifyToken  = require("../middleware/verifyToken");
const validate     = require("../middleware/validate");
const { subscribePlanRules } = require("../middleware/validators/subscriptionValidators");

router.use(verifyToken);

router.get(    "/me",  ctrl.getMySubscription);
router.post(   "/",    subscribePlanRules, validate, ctrl.subscribe);
router.delete( "/",    ctrl.cancel);

module.exports = router;