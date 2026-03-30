import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const verificationCodeSchema = new Schema(
  {
    hash: { type: String, default: null },
    expiresAt: { type: Date, default: null },
    sentAt: { type: Date, default: null },
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    username: { type: String, required: true, trim: true, unique: true, index: true },
    firstname: {
      type: String,
      required: true,
      trim: true,
      minlength: [2, "firstname too short, min is 2 characters required"],
    },
    lastname: {
      type: String,
      required: true,
      trim: true,
      minlength: [2, "lastname too short, min is 2 characters required"],
    },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
      index: true,
    },
    isEmailVerified: { type: Boolean, default: false, index: true },
    emailVerification: {
      type: verificationCodeSchema,
      default: () => ({}),
    },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorVerification: {
      type: verificationCodeSchema,
      default: () => ({}),
    },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },
    passwordChangedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordChangedAt = new Date();
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      username: this.username,
      email: this.email,
      role: this.role,
      isEmailVerified: this.isEmailVerified,
      twoFactorEnabled: this.twoFactorEnabled,
    },
    process.env.ACCESS_TOKEN,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d" }
  );
};

export const User = mongoose.model("User", userSchema);
