const router = require("express").Router();
const c = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");
const { userRules, passwordRules, validate } = require("../utils/validators");

router.post("/register", userRules, validate, c.register);
router.post("/login", c.login);
router.get("/me", authenticate, c.me);
router.put("/change-password", authenticate, passwordRules, validate, c.changePassword);

module.exports = router;
