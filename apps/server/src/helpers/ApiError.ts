import { HTTP_STATUS } from '../constants/httpStatus';

export interface ApiErrorDetail {
  field?: string;
  message: string;
}

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly errors?: ApiErrorDetail[];
  public readonly isOperational: boolean;

  constructor(statusCode: number, message: string, errors?: ApiErrorDetail[]) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, errors?: ApiErrorDetail[]) {
    return new ApiError(HTTP_STATUS.BAD_REQUEST, message, errors);
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiError(HTTP_STATUS.UNAUTHORIZED, message);
  }

  static forbidden(message = 'Forbidden') {
    return new ApiError(HTTP_STATUS.FORBIDDEN, message);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(HTTP_STATUS.NOT_FOUND, message);
  }

  static conflict(message: string) {
    return new ApiError(HTTP_STATUS.CONFLICT, message);
  }

  static unprocessable(message: string, errors?: ApiErrorDetail[]) {
    return new ApiError(HTTP_STATUS.UNPROCESSABLE_ENTITY, message, errors);
  }

  static internal(message = 'Something went wrong') {
    return new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, message);
  }
}
