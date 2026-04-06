const Application = require("../models/Application");
const User = require("../models/User");
const { clearAuthCookie } = require("../middleware/authMiddleware");
const { getServicePrice } = require("../utils/appConfig");

function formatApplications(applications) {
  return applications.map((application) => ({
    ...application,
    formattedDob: new Date(application.dateOfBirth).toLocaleDateString("en-GB"),
    formattedDate: new Date(application.createdAt).toLocaleString("en-IN"),
    statusLabel:
      application.status === "passed"
        ? "Passed"
        : application.status === "failed"
          ? "Failed"
          : "Pending",
    hasImage: Boolean(application.licenceImage && application.licenceImage.data && application.licenceImage.data.length)
  }));
}

async function getCurrentUser(userId) {
  return User.findById(userId).lean();
}

async function showDashboard(req, res) {
  const user = await getCurrentUser(req.user.userId);

  if (!user) {
    clearAuthCookie(res, "userToken");
    return res.redirect("/login?error=User account not found.");
  }

  const applications = await Application.find({ userId: user._id })
    .sort({ createdAt: -1 })
    .lean();

  return res.render("dashboard", {
    pageTitle: "Dashboard",
    user,
    applications: formatApplications(applications)
  });
}

async function showRequestForm(req, res) {
  const user = await getCurrentUser(req.user.userId);

  if (!user) {
    clearAuthCookie(res, "userToken");
    return res.redirect("/login?error=User account not found.");
  }

  return res.render("request-form", {
    pageTitle: "Submit Learner Details",
    user,
    formData: {}
  });
}

async function submitRequest(req, res) {
  const applicationNumber = (req.body.applicationNumber || "").trim().toUpperCase();
  const dateOfBirth = (req.body.dateOfBirth || "").trim();
  const learnerPassword = (req.body.learnerPassword || "").trim();
  const servicePrice = getServicePrice();
  const user = await getCurrentUser(req.user.userId);

  if (!user) {
    clearAuthCookie(res, "userToken");
    return res.redirect("/login?error=User account not found.");
  }

  if (!applicationNumber || !dateOfBirth || !learnerPassword) {
    return res.render("request-form", {
      pageTitle: "Submit Learner Details",
      user,
      formData: { applicationNumber, dateOfBirth, learnerPassword },
      errorMessage: "Application number, date of birth, and learner password are required."
    });
  }

  const parsedDob = new Date(dateOfBirth);

  if (Number.isNaN(parsedDob.getTime())) {
    return res.render("request-form", {
      pageTitle: "Submit Learner Details",
      user,
      formData: { applicationNumber, dateOfBirth, learnerPassword },
      errorMessage: "Please select a valid date of birth."
    });
  }

  const currentWalletBalance = Number(user.walletBalance || 0);

  if (currentWalletBalance < servicePrice) {
    return res.render("request-form", {
      pageTitle: "Submit Learner Details",
      user: {
        ...user,
        walletBalance: currentWalletBalance
      },
      formData: { applicationNumber, dateOfBirth, learnerPassword },
      errorMessage: "Sufficient balance nahi hai. Please admin ko Telegram par message karke balance add karvao."
    });
  }

  const updatedUser = await User.findOneAndUpdate(
    {
      _id: req.user.userId,
      walletBalance: { $gte: servicePrice }
    },
    {
      $inc: { walletBalance: -servicePrice }
    },
    {
      new: true
    }
  );

  if (!updatedUser) {
    return res.render("request-form", {
      pageTitle: "Submit Learner Details",
      user: {
        ...user,
        walletBalance: currentWalletBalance
      },
      formData: { applicationNumber, dateOfBirth, learnerPassword },
      errorMessage: "Sufficient balance nahi hai. Please admin ko Telegram par message karke balance add karvao."
    });
  }

  try {
    await Application.create({
      userId: req.user.userId,
      applicationNumber,
      dateOfBirth: parsedDob,
      learnerPassword,
      servicePrice,
      status: "pending"
    });
  } catch (error) {
    await User.findByIdAndUpdate(req.user.userId, {
      $inc: { walletBalance: servicePrice }
    });
    throw error;
  }

  return res.redirect("/dashboard?success=Learner licence details submitted successfully and balance deducted.");
}

async function streamLicenceImage(req, res) {
  const application = await Application.findOne({
    _id: req.params.applicationId,
    userId: req.user.userId
  });

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
  showDashboard,
  showRequestForm,
  streamLicenceImage,
  submitRequest
};
