
const { body } = require("express-validator");

exports.updateProfileRules = [
  body("username")
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 }).withMessage("Username must be 3–50 characters")
    .matches(/^[a-zA-Z0-9_]+$/).withMessage("Username can only contain letters, numbers, underscores"),

  body("email")
    .optional()
    .trim()
    .isEmail().withMessage("Must be a valid email address")
    .normalizeEmail(),
];

exports.changePasswordRules = [
  body("oldPassword")
    .notEmpty().withMessage("Current password is required"),

  body("newPassword")
    .notEmpty().withMessage("New password is required")
    .isLength({ min: 8 }).withMessage("New password must be at least 8 characters")
    .matches(/[A-Z]/).withMessage("New password must contain at least one uppercase letter")
    .matches(/[0-9]/).withMessage("New password must contain at least one number"),
];