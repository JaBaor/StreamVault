const { body, param, query } = require("express-validator");

exports.movieIdParam = [
  param("movieId")
    .isInt({ min: 1 }).withMessage("movieId must be a positive integer"),
];

exports.ratingRules = [
  body("rating")
    .isFloat({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
];

exports.reviewRules = [
  body("rating")
    .isFloat({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),

  body("comment")
    .trim()
    .notEmpty().withMessage("Review comment is required")
    .isLength({ max: 2000 }).withMessage("Review cannot exceed 2000 characters"),
];

exports.paginationRules = [
  query("page")
    .optional()
    .isInt({ min: 1 }).withMessage("page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage("limit must be between 1 and 100"),
];
