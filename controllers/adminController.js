const Application = require("../models/Application");
const User = require("../models/User");

async function showAdminPanel(req, res) {
  const users = await User.find().sort({ username: 1 }).lean();
  const applications = await Application.find()
    .populate("userId", "username walletBalance")
    .sort({ createdAt: -1 })
    .lean();

  const pendingApplications = applications.filter((application) => application.status === "pending").length;
  const passedApplications = applications.filter((application) => application.status === "passed").length;
  const failedApplications = applications.filter((application) => application.status === "failed").length;

  const formattedApplications = applications.map((application) => ({
    ...application,
    formattedDate: new Date(application.createdAt).toLocaleString("en-IN"),
    formattedDob: new Date(application.dateOfBirth).toLocaleDateString("en-GB"),
    statusLabel:
      application.status === "passed"
        ? "Passed"
        : application.status === "failed"
          ? "Failed"
          : "Pending",
    hasImage: Boolean(application.licenceImage && application.licenceImage.data && application.licenceImage.data.length)
  }));

  return res.render("admin-panel", {
    pageTitle: "Admin Panel",
    users,
    applications: formattedApplications,
    stats: {
      totalUsers: users.length,
      totalApplications: applications.length,
      pendingApplications,
      passedApplications,
      failedApplications
    }
  });
}

async function addWalletBalance(req, res) {
  const userId = req.params.userId;
  const amount = Number(req.body.amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    return res.redirect("/admin/panel?error=Please enter a valid balance amount.");
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      $inc: { walletBalance: amount }
    },
    {
      new: true
    }
  );

  if (!updatedUser) {
    return res.redirect("/admin/panel?error=User not found.");
  }

  return res.redirect("/admin/panel?success=Wallet balance added successfully.");
}

async function passApplication(req, res) {
  const applicationId = req.params.applicationId;
  const uploadedFile = req.file;

  if (!uploadedFile) {
    return res.redirect("/admin/panel?error=Please upload the learner licence image.");
  }

  if (!uploadedFile.mimetype || !uploadedFile.mimetype.startsWith("image/")) {
    return res.redirect("/admin/panel?error=Only image files are allowed.");
  }

  const existingApplication = await Application.findById(applicationId);

  if (!existingApplication) {
    return res.redirect("/admin/panel?error=Submission not found.");
  }

  existingApplication.status = "passed";
  existingApplication.licenceImage = {
    data: uploadedFile.buffer,
    contentType: uploadedFile.mimetype,
    fileName: uploadedFile.originalname
  };

  await existingApplication.save();

  return res.redirect("/admin/panel?success=Learner licence marked as passed and image uploaded.");
}

async function failApplication(req, res) {
  const applicationId = req.params.applicationId;
  const existingApplication = await Application.findById(applicationId);

  if (!existingApplication) {
    return res.redirect("/admin/panel?error=Submission not found.");
  }

  existingApplication.status = "failed";
  existingApplication.licenceImage = undefined;

  await existingApplication.save();

  return res.redirect("/admin/panel?success=Learner licence marked as failed.");
}

async function streamAdminImage(req, res) {
  const application = await Application.findById(req.params.applicationId);

  if (!application || !application.licenceImage || !application.licenceImage.data) {
    return res.status(404).render("error", {
      pageTitle: "Image Not Found",
      errorMessage: "The learner licence image is not available for this submission."
    });
  }

  res.set("Content-Type", application.licenceImage.contentType || "image/jpeg");
  return res.send(application.licenceImage.data);
}

module.exports = {
  addWalletBalance,
  failApplication,
  passApplication,
  showAdminPanel,
  streamAdminImage
};
