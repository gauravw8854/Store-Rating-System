const router = require("express").Router();
const c = require("../controllers/ratingController");
const { authenticate, authorize } = require("../middleware/auth");
const { ratingRules, validate } = require("../utils/validators");

router.post("/", authenticate, authorize("USER"), ratingRules, validate, c.upsertRating);
module.exports = router;
