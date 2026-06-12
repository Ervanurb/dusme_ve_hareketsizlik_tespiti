const router = require("express").Router();
const auth = require("../../middleware/auth");
const role = require("../../middleware/role");
const { createAdmin } = require("./admin.controller");

// Sadece admin rolü yeni admin oluşturabilir (rol tabanlı yetkilendirme middleware'i)
router.post("/create-admin", auth, role("admin"), createAdmin);

module.exports = router;
