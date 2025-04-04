import { Response, CookieOptions } from "express";

/**
 * Default cookie configuration
 */
const defaultCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
};

/**
 * Sets an authentication token as a cookie
 * @param res Express response object
 * @param token JWT token to set in cookie
 * @param options Override default cookie options
 */
export const setTokenCookie = (
  res: Response,
  token: string,
  options?: Partial<CookieOptions>
): void => {
  const cookieOptions: CookieOptions = {
    ...defaultCookieOptions,
    ...options,
  };

  // If there's a CORS domain configured, ensure the cookie will work with it
  if (process.env.FRONTEND_URL) {
    cookieOptions.sameSite = "none";
    cookieOptions.secure = true;
  }

  res.cookie("auth_token", token, cookieOptions);
};

/**
 * Clears the authentication token cookie
 * @param res Express response object
 */
export const clearTokenCookie = (res: Response): void => {
  res.clearCookie("auth_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
};
