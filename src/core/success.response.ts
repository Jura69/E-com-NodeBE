import { Response } from 'express';

const StatusCode = {
  OK: 200,
  CREATED: 201,
} as const;

const ReasonStatusCode = {
  OK: 'Success',
  CREATED: 'Created!',
} as const;

interface SuccessResponseOptions {
  message?: string;
  statusCode?: number;
  reasonStatusCode?: string;
  metadata?: any;
}

export class SuccessResponse {
  message: string;
  status: number;
  metadata: any;

  constructor({
    message,
    statusCode = StatusCode.OK,
    reasonStatusCode = ReasonStatusCode.OK,
    metadata = {},
  }: SuccessResponseOptions) {
    this.message = !message ? reasonStatusCode : message;
    this.status = statusCode;
    this.metadata = metadata;
  }

  send(res: Response, headers?: Record<string, string>): Response {
    if (headers) {
      Object.keys(headers).forEach((key) => {
        res.setHeader(key, headers[key]);
      });
    }
    return res.status(this.status).json(this);
  }
}

export class OK extends SuccessResponse {
  constructor({ message, metadata }: { message?: string; metadata?: any }) {
    super({ message, metadata });
  }
}

export class CREATED extends SuccessResponse {
  constructor({
    message,
    statusCode = StatusCode.CREATED,
    reasonStatusCode = ReasonStatusCode.CREATED,
    metadata,
  }: {
    message?: string;
    statusCode?: number;
    reasonStatusCode?: string;
    metadata?: any;
  }) {
    super({ message, statusCode, reasonStatusCode, metadata });
  }
}

