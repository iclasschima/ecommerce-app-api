const { Error } = require("mongoose");
const { generateToken } = require("../config/jwtToken");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongoDbId");
const { generateRefreshToken } = require("../config/refreshToken");
const jwt = require("jsonwebtoken");

const createUser = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const findUser = await User.findOne({ email });

  if (findUser) {
    throw new Error("User Already Exists!");
  }

  const newUser = await User.create(req.body);
  res.json(newUser);
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const findUser = await User.findOne({ email });

  if (findUser && (await findUser.isPasswordMatched(password))) {
    const { firstname, lastname, email, mobile, _id } = findUser;

    const refreshToken = generateRefreshToken(_id);

    await User.findByIdAndUpdate(_id, { refreshToken }, { new: true });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });

    res.json({
      firstname,
      lastname,
      email,
      mobile,
      _id,
      token: generateToken(_id),
    });
  } else {
    throw new Error("Invalid Credentials!");
  }
});

const handleRefreshToken = asyncHandler(async (req, res) => {
  const cookies = req.cookies;
  if (!cookies.refreshToken) throw new Error("No refresh token found!");

  const { refreshToken } = cookies;
  const user = await User.findOne({ refreshToken });

  if (!user) throw new Error("No user found with the refresh token");

  jwt.verify(refreshToken, process.env.JWT_SECRET, (error, decoded) => {
    if (error || user.id !== decoded.id)
      throw new Error("Error with refresh token!");

    const accessToken = generateToken(user.id);

    res.json({ accessToken });
  });
});

const logout = asyncHandler(async (req, res) => {
  const cookies = req.cookies;
  if (!cookies.refreshToken) throw new Error("No refresh token found!");

  const { refreshToken } = cookies;
  const user = await User.findOne({ refreshToken });

  if (user) {
    await User.findOneAndUpdate(
      { refreshToken },
      {
        refreshToken: "",
      }
    );
  }
  res.clearCookie("refreshToken", { httpOnly: true, secure: true });

  return res.sendStatus(204);
});

const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    throw new Error(error);
  }
});

const getUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const user = await User.findById(id);
    res.json(user);
  } catch (error) {
    throw new Error(error);
  }
});

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    await User.findByIdAndDelete(id);
    res.json({ message: "Deleted successfully!" });
  } catch (error) {
    throw new Error(error);
  }
});

const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.user;

  validateMongoDbId(id);

  const { firstname, lastname, mobile, email } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        firstname,
        lastname,
        mobile,
        email,
      },
      { new: true }
    );

    res.json(updatedUser);
  } catch (error) {
    throw new Error(error);
  }
});

const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const user = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: true,
      },
      { new: true }
    );
    res.json({ message: "User blocked successfully!", user });
  } catch (error) {
    throw new Error(error);
  }
});

const unBlockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const user = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: false,
      },
      { new: true }
    );
    res.json({ message: "User unblocked successfully!", user });
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createUser,
  loginUser,
  getAllUsers,
  getUser,
  deleteUser,
  updateUser,
  blockUser,
  unBlockUser,
  handleRefreshToken,
  logout,
};
