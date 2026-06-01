
const { body } = require("express-validator");

exports.updateProfileRules = [
  body("display_name")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage("Display name must be 1–100 characters"),

  body("email")
    .optional()
    .trim()
    .isEmail().withMessage("Must be a valid email address")
    .normalizeEmail(),

  body("avatar_url")
    .optional()
    .custom((value) => {
      if (!value) return true;
      if (value.startsWith("data:image/")) return true;
      if (value.startsWith("/") || /^https?:\/\//i.test(value)) return true;
      throw new Error("avatar_url must be a data URL, relative path, or http/https URL");
    }),
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