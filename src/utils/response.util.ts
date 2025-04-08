import { Response } from "express";
import { ZodError } from "zod";
import { fromError, isZodErrorLike } from "zod-validation-error";

export type CustomResponseType<T> = {
  success: boolean;
  message: string;
  data?: T | null;
};

interface CustomResponseOptions<T> {
  res: Response;
  message?: string;
  data?: T | null;
  statusCode?: number;
  log?: boolean;
}

export class CustomResponse {
  static success<T>({
    res,
    message = "Operation successful.",
    data = null,
    statusCode = 200,
    log = true,
  }: CustomResponseOptions<T>): void {
    if (log) console.log("Success:", { message, data });
    res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static error<T>({
    res,
    message = "Operation failed.",
    data = null,
    statusCode = 500,
    log = true,
  }: CustomResponseOptions<T>): void {
    if (log) console.error(message, data);

    const isZodErrorData = data && isZodErrorLike(data);

    const errorMessage = isZodErrorData ? getErrorMessage(data) : message;

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      data: isZodErrorData ? null : data,
    });
  }
}

export const getErrorMessage = (
  error: unknown,
  defaultMessage: string = "Internal server error."
): string => {
  if (isZodErrorLike(error)) {
    return fromError(error, {
      maxIssuesInMessage: 1,
      includePath: true,
    }).message;
  } else if (error instanceof Error) {
    return error.message;
  } else if (typeof error === "string") {
    return error;
  }
  return defaultMessage;
};
