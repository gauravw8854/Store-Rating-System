const router = require("express").Router();
const c = require("../controllers/ownerController");
const { authenticate, authorize } = require("../middleware/auth");

router.get("/dashboard", authenticate, authorize("STORE_OWNER"), c.dashboard);
module.exports = router;
