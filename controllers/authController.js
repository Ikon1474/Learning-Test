const bcrypt = require("bcrypt");
const User = require("../models/User");
const { clearAuthCookie, readTokenPayload, setAuthCookie } = require("../middleware/authMiddleware");

function renderRegisterPage(res, options = {}) {
  return res.render("register", {
    pageTitle: "Register",
    formData: options.formData || {},
    errorMessage: options.errorMessage || null
  });
}

function renderLoginPage(res, options = {}) {
  return res.render("login", {
    pageTitle: "Login",
    formData: options.formData || {},
    errorMessage: options.errorMessage || null
  });
}

function renderAdminLoginPage(res, options = {}) {
  return res.render("admin-login", {
    pageTitle: "Admin Login",
    formData: options.formData || {},
    errorMessage: options.errorMessage || null
  });
}

function showRegisterPage(req, res) {
  const userPayload = readTokenPayload(req.cookies.userToken);
  const adminPayload = readTokenPayload(req.cookies.adminToken);

  if (adminPayload && adminPayload.role === "admin") {
    return res.redirect("/admin/panel");
  }

  if (userPayload && userPayload.role === "user") {
    return res.redirect("/dashboard");
  }

  return renderRegisterPage(res);
}

async function registerUser(req, res) {
  const username = (req.body.username || "").trim();
  const password = (req.body.password || "").trim();

  if (!username || !password) {
    return renderRegisterPage(res, {
      errorMessage: "Username and password are required.",
      formData: { username }
    });
  }

  if (password.length < 6) {
    return renderRegisterPage(res, {
      errorMessage: "Password must be at least 6 characters long.",
      formData: { username }
    });
  }

  const existingUser = await User.findOne({ username });

  if (existingUser) {
    return renderRegisterPage(res, {
      errorMessage: "This username is already registered.",
      formData: { username }
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    username,
    password: hashedPassword
  });

  setAuthCookie(res, "userToken", {
    userId: String(newUser._id),
    username: newUser.username,
    role: "user"
  });

  return res.redirect("/dashboard?success=Registration successful.");
}

function showLoginPage(req, res) {
  const userPayload = readTokenPayload(req.cookies.userToken);
  const adminPayload = readTokenPayload(req.cookies.adminToken);

  if (adminPayload && adminPayload.role === "admin") {
    return res.redirect("/admin/panel");
  }

  if (userPayload && userPayload.role === "user") {
    return res.redirect("/dashboard");
  }

  return renderLoginPage(res);
}

async function loginUser(req, res) {
  const username = (req.body.username || "").trim();
  const password = (req.body.password || "").trim();

  if (!username || !password) {
    return renderLoginPage(res, {
      errorMessage: "Please enter both username and password.",
      formData: { username }
    });
  }

  const user = await User.findOne({ username });

  if (!user) {
    return renderLoginPage(res, {
      errorMessage: "Invalid username or password.",
      formData: { username }
    });
  }

  const passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches) {
    return renderLoginPage(res, {
      errorMessage: "Invalid username or password.",
      formData: { username }
    });
  }

  setAuthCookie(res, "userToken", {
    userId: String(user._id),
    username: user.username,
    role: "user"
  });

  return res.redirect("/dashboard?success=Login successful.");
}

function logoutUser(req, res) {
  clearAuthCookie(res, "userToken");
  return res.redirect("/login?success=You have been logged out.");
}

function showAdminLoginPage(req, res) {
  const adminPayload = readTokenPayload(req.cookies.adminToken);

  if (adminPayload && adminPayload.role === "admin") {
    return res.redirect("/admin/panel");
  }

  return renderAdminLoginPage(res);
}

async function loginAdmin(req, res) {
  const username = (req.body.username || "").trim();
  const password = (req.body.password || "").trim();
  const adminUsername = process.env.ADMIN_USERNAME || "admin";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const adminPasswordHash = (process.env.ADMIN_PASSWORD_HASH || "").trim();

  if (!username || !password) {
    return renderAdminLoginPage(res, {
      errorMessage: "Please enter both admin username and password.",
      formData: { username }
    });
  }

  if (username !== adminUsername) {
    return renderAdminLoginPage(res, {
      errorMessage: "Invalid admin credentials.",
      formData: { username }
    });
  }

  let passwordMatches = false;

  if (adminPasswordHash) {
    passwordMatches = await bcrypt.compare(password, adminPasswordHash);
  } else {
    passwordMatches = password === adminPassword;
  }

  if (!passwordMatches) {
    return renderAdminLoginPage(res, {
      errorMessage: "Invalid admin credentials.",
      formData: { username }
    });
  }

  setAuthCookie(res, "adminToken", {
    username: adminUsername,
    role: "admin"
  });

  return res.redirect("/admin/panel?success=Admin login successful.");
}

function logoutAdmin(req, res) {
  clearAuthCookie(res, "adminToken");
  return res.redirect("/admin/login?success=Admin logged out.");
}

module.exports = {
  loginAdmin,
  loginUser,
  logoutAdmin,
  logoutUser,
  registerUser,
  showAdminLoginPage,
  showLoginPage,
  showRegisterPage
};
