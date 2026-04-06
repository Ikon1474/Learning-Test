const jwt = require("jsonwebtoken");
const { getAdminTelegram, getServicePrice, getTelegramLink } = require("../utils/appConfig");

function getJwtSecret() {
  return process.env.JWT_SECRET || "change-this-secret";
}

function getCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000
  };
}

function getClearCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  };
}

function createToken(payload) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
}

function readTokenPayload(token) {
  if (!token) {
    return null;
  }

  try {
    return jwt.verify(token, getJwtSecret());
  } catch (error) {
    return null;
  }
}

function setAuthCookie(res, cookieName, payload) {
  res.cookie(cookieName, createToken(payload), getCookieOptions());
}

function clearAuthCookie(res, cookieName) {
  res.clearCookie(cookieName, getClearCookieOptions());
}

function populateLocals(req, res, next) {
  const userPayload = readTokenPayload(req.cookies.userToken);
  const adminPayload = readTokenPayload(req.cookies.adminToken);

  res.locals.authUser = userPayload && userPayload.role === "user" ? userPayload : null;
  res.locals.authAdmin = adminPayload && adminPayload.role === "admin" ? adminPayload : null;
  res.locals.currentPath = req.path;
  res.locals.isAdminPage = req.path.startsWith("/admin");
  res.locals.adminTelegram = getAdminTelegram();
  res.locals.servicePrice = getServicePrice();
  res.locals.telegramLink = getTelegramLink();
  res.locals.successMessage = typeof req.query.success === "string" ? req.query.success : null;
  res.locals.errorMessage = typeof req.query.error === "string" ? req.query.error : null;

  next();
}

function requireUserAuth(req, res, next) {
  const payload = readTokenPayload(req.cookies.userToken);

  if (!payload || payload.role !== "user") {
    clearAuthCookie(res, "userToken");
    return res.redirect("/login?error=Please login first.");
  }

  req.user = payload;
  return next();
}

function requireAdminAuth(req, res, next) {
  const payload = readTokenPayload(req.cookies.adminToken);

  if (!payload || payload.role !== "admin") {
    clearAuthCookie(res, "adminToken");
    return res.redirect("/admin/login?error=Please login as admin.");
  }

  req.admin = payload;
  return next();
}

module.exports = {
  clearAuthCookie,
  populateLocals,
  readTokenPayload,
  requireAdminAuth,
  requireUserAuth,
  setAuthCookie
};
