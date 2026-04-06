const express = require("express");
const {
  showDashboard,
  showRequestForm,
  streamLicenceImage,
  submitRequest
} = require("../controllers/userController");
const { requireUserAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/dashboard", requireUserAuth, showDashboard);
router.get("/dashboard/apply", requireUserAuth, showRequestForm);
router.post("/dashboard/apply", requireUserAuth, submitRequest);
router.get("/dashboard/applications/:applicationId/image", requireUserAuth, streamLicenceImage);

module.exports = router;
