import crypto from "crypto";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const configuredSameSite = (process.env.COOKIE_SAME_SITE || "strict").trim().toLowerCase();
const cookieSameSite = ["lax", "none", "strict"].includes(configuredSameSite) ? configuredSameSite : "strict";
const cookieSecure =
  process.env.COOKIE_SECURE === "true" || (process.env.COOKIE_SECURE !== "false" && process.env.NODE_ENV === "production");
const resolvedCookieSecure = cookieSameSite === "none" ? true : cookieSecure;

export const generateRandomCode = (length = 6) => {
  const bytes = crypto.randomBytes(length);
  let code = "";

  for (let index = 0; index < length; index += 1) {
    code += CODE_ALPHABET[bytes[index] % CODE_ALPHABET.length];
  }

  return code;
};

export const hashToken = (value) => crypto.createHash("sha256").update(value).digest("hex");

export const getCodeExpiryDate = (minutes = 10) => new Date(Date.now() + minutes * 60 * 1000);

export const buildCookieOptions = (maxAgeMs) => ({
  httpOnly: true,
  secure: resolvedCookieSecure,
  sameSite: cookieSameSite,
  path: "/",
  maxAge: maxAgeMs,
});

export const clearCookieOptions = {
  httpOnly: true,
  secure: resolvedCookieSecure,
  sameSite: cookieSameSite,
  path: "/",
};

export const publicUserProjection =
  "-password -resetPasswordToken -resetPasswordExpires -emailVerification -twoFactorVerification";

export const normalizeIdentifier = (value) => value?.toString().trim().toLowerCase();

export const extractBearerToken = (headerValue) => {
  if (!headerValue || !headerValue.startsWith("Bearer ")) {
    return null;
  }

  return headerValue.slice(7).trim();
};

export const extractAccessToken = (req) =>
  req.cookies?.accessToken || extractBearerToken(req.header("Authorization")) || req.header("x-access-token") || null;
