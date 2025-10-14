import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    username: { type: String, required: true, trim: true, unique: true, index: true },
    firstname: {
      type: String,
      required: true,
      trim: true,
      min: [4, "firstname too short, min is 4 characters required"],
    },
    lastname: {
      type: String,
      required: true,
      trim: true,
      min: [4, "firstname too short, min is 4 characters required"],
    },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    refreshToken: { type: String },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

// Password hashing middleware
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 8);
  next();
});

// Password verification
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Token generation
userSchema.methods.generateAccessToken = function () {
  return jwt.sign({ _id: this._id, username: this.username, email: this.email }, process.env.ACCESS_TOKEN, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ _id: this._id }, process.env.REFRESH_TOKEN, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY });
};

// Game collection methods
userSchema.methods.addGame = async function (gameId) {
  if (!this.games.includes(gameId)) {
    this.games.push(gameId);
    return this.save();
  }
};

userSchema.methods.removeGame = async function (gameId) {
  this.games = this.games.filter((id) => !id.equals(gameId));
  return this.save();
};

export const User = mongoose.model("User", userSchema);
