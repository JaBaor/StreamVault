const { body, query, param } = require("express-validator");

const CURRENT_YEAR = new Date().getFullYear();
const VALID_SORTS  = ["newest", "oldest", "title_asc", "title_desc", "year_desc", "year_asc"];

//GET list
exports.listMoviesRules = [
  query("page")
    .optional()
    .isInt({ min: 1 }).withMessage("page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage("limit must be between 1 and 100"),

  query("genre_id")
    .optional()
    .isInt({ min: 1 }).withMessage("genre_id must be a positive integer"),

  query("release_year")
    .optional()
    .isInt({ min: 1888, max: CURRENT_YEAR })
    .withMessage(`release_year must be between 1888 and ${CURRENT_YEAR}`),

  query("sort")
    .optional()
    .isIn(VALID_SORTS)
    .withMessage(`sort must be one of: ${VALID_SORTS.join(", ")}`),
];

//URL param — reused by GET/:id, PUT/:id, DELETE/:id
exports.movieIdParam = [
  param("id")
    .isInt({ min: 1 }).withMessage("Movie ID must be a positive integer"),
];

// POST create
exports.createMovieRules = [
  body("title")
    .trim()
    .notEmpty().withMessage("Title is required")
    .isLength({ max: 255 }).withMessage("Title cannot exceed 255 characters"),

  body("description")
    .optional()
    .trim(),

  body("release_year")
    .optional()
    .isInt({ min: 1888, max: CURRENT_YEAR })
    .withMessage(`Release year must be between 1888 and ${CURRENT_YEAR}`),

  body("duration")
    .optional()
    .isInt({ min: 1 }).withMessage("Duration must be a positive number of minutes"),

  body("poster_url")
    .optional()
    .isURL().withMessage("poster_url must be a valid URL"),

  body("trailer_url")
    .optional()
    .isURL().withMessage("trailer_url must be a valid URL"),

  body("genre_id")
    .optional()
    .isInt({ min: 1 }).withMessage("genre_id must be a positive integer"),
];

// PUT update 
exports.updateMovieRules = [
  body("title")
    .optional()
    .trim()
    .notEmpty().withMessage("Title cannot be empty")
    .isLength({ max: 255 }).withMessage("Title cannot exceed 255 characters"),

  body("release_year")
    .optional()
    .isInt({ min: 1888, max: CURRENT_YEAR })
    .withMessage(`Release year must be between 1888 and ${CURRENT_YEAR}`),

  body("duration")
    .optional()
    .isInt({ min: 1 }).withMessage("Duration must be a positive number of minutes"),

  body("poster_url")
    .optional()
    .isURL().withMessage("poster_url must be a valid URL"),

  body("trailer_url")
    .optional()
    .isURL().withMessage("trailer_url must be a valid URL"),

  body("genre_id")
    .optional()
    .isInt({ min: 1 }).withMessage("genre_id must be a positive integer"),
];

// GET search
exports.searchMoviesRules = [
  query("q")
    .trim()
    .notEmpty().withMessage("Search query q is required")
    .isLength({ min: 2 }).withMessage("Search term must be at least 2 characters"),

  query("page")
    .optional()
    .isInt({ min: 1 }).withMessage("page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage("limit must be between 1 and 100"),
];