const router = require("express").Router();
const c = require("../controllers/adminController");
const store = require("../controllers/storeController");
const { authenticate, authorize } = require("../middleware/auth");
const { userRules, storeRules, validate } = require("../utils/validators");

router.use(authenticate, authorize("ADMIN"));
router.get("/dashboard", c.dashboard);
router.post("/users", userRules, validate, c.createUser);
router.get("/users", c.listUsers);
router.get("/users/:id", c.userDetails);
router.post("/stores", storeRules, validate, store.createStore);
router.get("/stores", c.listStores);

module.exports = router;
