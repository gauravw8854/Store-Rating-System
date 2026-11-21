const { body, validationResult } = require("express-validator");

const userRules = [
  body("name")
    .trim()
    .isLength({ min: 20, max: 60 })
    .withMessage("Name must be between 20 and 60 characters."),
  body("email").trim().isEmail().withMessage("Enter a valid email address."),
  body("address")
    .trim()
    .isLength({ max: 400 })
    .withMessage("Address cannot exceed 400 characters."),
  body("password")
    .isLength({ min: 8, max: 16 })
    .withMessage("Password must be 8–16 characters.")
    .matches(/[A-Z]/)
    .withMessage("Password must contain an uppercase letter.")
    .matches(/[^A-Za-z0-9]/)
    .withMessage("Password must contain a special character.")
];

const passwordRules = [
  body("currentPassword").notEmpty(),
  body("newPassword")
    .isLength({ min: 8, max: 16 })
    .matches(/[A-Z]/)
    .matches(/[^A-Za-z0-9]/)
    .withMessage("New password must be 8–16 characters and include uppercase and special characters.")
];

const storeRules = [
  body("name").trim().isLength({ min: 1, max: 120 }),
  body("email").trim().isEmail(),
  body("address").trim().isLength({ max: 400 }),
  body("ownerId").optional({ nullable: true }).isInt({ min: 1 })
];

const ratingRules = [
  body("storeId").isInt({ min: 1 }),
  body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be an integer from 1 to 5.")
];

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array().map((e) => e.msg)
    });
  }
  next();
}

module.exports = { userRules, passwordRules, storeRules, ratingRules, validate };
