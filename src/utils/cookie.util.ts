import { Response, CookieOptions } from "express";
import { ENV, isProduction } from "@/config/env.config";

/**
 * Default cookie configuration
 */
const defaultCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
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

  res.cookie("token", token, cookieOptions);
};

/**
 * Clears the authentication token cookie
 * @param res Express response object
 */
export const clearTokenCookie = (res: Response): void => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });
};
