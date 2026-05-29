const { body, param } = require("express-validator");

exports.genreIdParam = [
  param("id")
    .isInt({ min: 1 }).withMessage("Genre ID must be a positive integer"),
];

exports.createGenreRules = [
  body("name")
    .trim()
    .notEmpty().withMessage("Genre name is required")
    .isLength({ max: 100 }).withMessage("Genre name cannot exceed 100 characters"),
];

exports.updateGenreRules = [
  body("name")
    .trim()
    .notEmpty().withMessage("Genre name is required")
    .isLength({ max: 100 }).withMessage("Genre name cannot exceed 100 characters"),
];