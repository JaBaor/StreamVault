const { body, query, param } = require("express-validator");

exports.upsertProgressRules = [
  body("movieId")
    .isInt({ min: 1 }).withMessage("movieId must be a positive integer"),

  body("progressSeconds")
    .isInt({ min: 0 }).withMessage("progressSeconds must be 0 or greater"),
];

exports.historyIdParam = [
  param("id")
    .isInt({ min: 1 }).withMessage("History ID must be a positive integer"),
];

exports.paginationRules = [
  query("page")
    .optional()
    .isInt({ min: 1 }).withMessage("page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage("limit must be between 1 and 100"),
];