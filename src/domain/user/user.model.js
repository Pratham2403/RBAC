const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { NotAuthenticatedError } = require("../../config/apierror");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, index: true, required: true, lowercase: true },
  email: { type: String },
  active: { type: Boolean, default: false },
  userType: {
    type: String,
    enum: ["SUPER_ADMIN", "ADMIN", "ALUMNI", "STUDENT"],
    required: true,
  },
  gradYear: { type: Number },
  password: { type: String },
  activationToken: { type: String },
  activationExpires: { type: Date },
});

// Middleware to ensure username is saved in lowercase
UserSchema.pre("save", function (next) {
  this.username = this.username.toLowerCase();
  next();
});

UserSchema.methods.comparePassword = async function (password) {
  if (!this.password) {
    throw new NotAuthenticatedError("Invalid username or password");
  }
  return await bcrypt.compare(password, this.password);
};

UserSchema.statics = {
  findByCredentials: async function (username, password) {
    const user = await this.findOne({ username: username.toLowerCase() });
    if (user && password && (await user.comparePassword(password))) {
      return user;
    }
    throw new NotAuthenticatedError("Invalid username or password");
  },
};

module.exports = mongoose.model("User", UserSchema);
