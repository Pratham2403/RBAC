const asyncHandler = require("express-async-handler");
const xlsx = require("xlsx");
const jwt = require("jsonwebtoken");
const { registerUser } = require("./user.service");
const { BadRequestError, NotFoundError } = require("../../config/apierror");
const UserModel = require("./user.model");

exports.getUserDetails = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.user.userId);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  const { name, username, userType, email, active } = user;
  res.status(200).json({
    success: true,
    user: {
      name,
      username,
      userType,
      email,
      active,
    },
  });
});

exports.getAllUsers = asyncHandler(async (req, res) => {
  const users = await UserModel.find(
    {},
    "username email userType active gradYear"
  );

  res.status(200).json({
    success: true,
    users,
  });
});

exports.register = asyncHandler(async (req, res) => {
  const { name, username, userType, gradYear } = req.body;
  const { privatekey } = req.headers;

  let role;
  try {
    let token = req.header("Authorization");
    if (token.startsWith("Bearer ")) {
      token = token.slice(7, token.length).trimLeft();
    }
    const user = jwt.verify(token, process.env.JWT_SECRET);
    role = user?.userType;
  } catch {
    console.log("Register Token Not Generated");
  }

  const newUser = await registerUser(
    name,
    username,
    userType,
    gradYear,
    role,
    privatekey
  );

  res.status(201).json({
    message: "User registered successfully",
    user: newUser,
  });
});

exports.bulkRegister = asyncHandler(async (req, res) => {
  const { privatekey } = req.headers;

  let role;
  try {
    let token = req.header("Authorization");
    if (token.startsWith("Bearer ")) {
      token = token.slice(7, token.length).trimLeft();
    }
    const user = jwt.verify(token, process.env.JWT_SECRET);
    role = user?.userType;
  } catch {
    tconsole.log("Register Token Not Generated");
  }

  if (!req.file) {
    throw new BadRequestError("No file uploaded");
  }

  const filePath = req.file.path;
  const workbook = xlsx.readFile(filePath);
  const sheetNames = workbook.SheetNames;
  const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetNames[0]]);

  const registrationPromises = data.map((d) =>
    registerUser(
      d["Name"],
      d["Username"],
      d["User Type"],
      d["Graduation Year"],
      role,
      privatekey
    )
  );

  try {
    const results = await Promise.all(registrationPromises);
    res.status(201).json({
      success: true,
      message: "Users registered successfully",
      users: results,
    });
  } catch (error) {
    res.status(200).json({
      success: true,
      message: "Some users failed to register",
      error: error.message,
    });
  }
});

exports.resetUser = asyncHandler(async (req, res) => {
  const { username } = req.body;
  const user = await UserModel.findOne({ username });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }
  user.password = undefined;
  user.email = undefined;
  user.active = false;
  await user.save();

  res.status(200).json({
    success: true,
    message: "User has been reset successfully",
    user: {
      username: user.username,
      userType: user.userType,
      active: user.active,
    },
  });
});
