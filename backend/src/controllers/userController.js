// controllers/userController.js

const bcrypt     = require("bcrypt");
const userModel  = require("../models/userModel");
const { BadRequestError, UnauthorizedError } = require("../errors/errors");

//GET /api/v1/users/me 
// req.user.id comes from verifyToken — the JWT already has the user id baked in.

exports.getMe = async (req, res) => {
  const user = await userModel.getUserById(req.user.id);
  res.json(user);
};

//PUT /api/v1/users/me 
exports.updateMe = async (req, res) => {
  const fields = { ...req.body };
  if (fields.displayName !== undefined) {
    fields.display_name = fields.displayName;
    delete fields.displayName;
  }
  const updated = await userModel.updateProfile(req.user.id, fields);
  res.json(updated);
};

//PUT /api/v1/users/me/password 
exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  // Must fetch the row WITH password_hash to verify the old password
  const user = await userModel.getUserWithPasswordById(req.user.id);

  const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
  if (!isMatch) {
    throw new UnauthorizedError("Current password is incorrect");
  }

  if (oldPassword === newPassword) {
    throw new BadRequestError("New password must be different from current password");
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  await userModel.updatePassword(req.user.id, newHash);

  res.json({ message: "Password updated successfully" });
};

