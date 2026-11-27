import { Response } from 'express';
import { PaginationMeta } from '../domain/Pagination.js';

export interface ApiSuccessEnvelope<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiPaginatedEnvelope<T> {
  success: true;
  data: T[];
  pagination: PaginationMeta;
  message?: string;
}

export interface ApiErrorEnvelope {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

export class ApiResponse {
  public static success<T>(
    res: Response,
    data: T,
    message?: string,
    statusCode = 200
  ): void {
    const payload: ApiSuccessEnvelope<T> = {
      success: true,
      data,
      ...(message ? { message } : {}),
    };
    res.status(statusCode).json(payload);
  }

  public static paginated<T>(
    res: Response,
    data: T[],
    pagination: PaginationMeta,
    message?: string,
    statusCode = 200
  ): void {
    const payload: ApiPaginatedEnvelope<T> = {
      success: true,
      data,
      pagination,
      ...(message ? { message } : {}),
    };
    res.status(statusCode).json(payload);
  }

  public static error(
    res: Response,
    message: string,
    statusCode = 400,
    code?: string,
    details?: unknown
  ): void {
    const payload: ApiErrorEnvelope = {
      success: false,
      error: {
        message,
        ...(code ? { code } : {}),
        ...(details !== undefined ? { details } : {}),
      },
    };
    res.status(statusCode).json(payload);
  }
}
