const router = require("express").Router();
const c = require("../controllers/storeController");
const { authenticate, authorize } = require("../middleware/auth");

router.get("/", authenticate, authorize("USER", "ADMIN"), c.listStores);
module.exports = router;
