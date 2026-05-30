const { param, query } = require("express-validator");

exports.movieIdParam = [
  param("movieId")
    .isInt({ min: 1 }).withMessage("movieId must be a positive integer"),
];

exports.paginationRules = [
  query("page")
    .optional()
    .isInt({ min: 1 }).withMessage("page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage("limit must be between 1 and 100"),
];