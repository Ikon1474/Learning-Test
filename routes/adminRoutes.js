const express = require("express");
const {
  addWalletBalance,
  failApplication,
  passApplication,
  showAdminPanel,
  streamAdminImage
} = require("../controllers/adminController");
const {
  loginAdmin,
  logoutAdmin,
  showAdminLoginPage
} = require("../controllers/authController");
const { requireAdminAuth } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get("/admin/login", showAdminLoginPage);
router.post("/admin/login", loginAdmin);
router.post("/admin/logout", logoutAdmin);
router.get("/admin/panel", requireAdminAuth, showAdminPanel);
router.post("/admin/users/:userId/wallet", requireAdminAuth, addWalletBalance);
router.post("/admin/applications/:applicationId/pass", requireAdminAuth, upload.single("licenceImage"), passApplication);
router.post("/admin/applications/:applicationId/fail", requireAdminAuth, failApplication);
router.get("/admin/applications/:applicationId/image", requireAdminAuth, streamAdminImage);

module.exports = router;
