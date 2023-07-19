const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const authMiddleware = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers?.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];

    try {
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);
        next();
      }
    } catch (error) {
      throw new Error("Not Authorized. Token expired. Please login again");
    }
  } else {
    throw new Error("There is no token attached to the header");
  }
});

const isAdmin = asyncHandler(async (req, res, next) => {
  const { role } = req.user;
  if (role !== "admin") {
    throw new Error("You are not an admin!");
  }
  next();
});

module.exports = { authMiddleware, isAdmin };
