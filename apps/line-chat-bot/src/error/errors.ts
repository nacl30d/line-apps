import { HTTPException } from 'hono/http-exception';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { HttpStatus } from '../lib/http';
import type {
  ForbiddenErrorCodes,
  InternalServerErrorErrorCodes,
  UnauthorizedErrorCodes,
} from './error-codes';

type HttpExceptionOptions = {
  res?: Response;
  message?: string;
  cause?: unknown;
};

export class ApplicationError<
  T extends
    | UnauthorizedErrorCodes
    | ForbiddenErrorCodes
    | InternalServerErrorErrorCodes,
> extends HTTPException {
  constructor(
    readonly code: T,
    status: ContentfulStatusCode,
    options?: HttpExceptionOptions,
  ) {
    super(status, options);
  }
}

export class UnauthorizedError extends ApplicationError<UnauthorizedErrorCodes> {
  constructor(code: UnauthorizedErrorCodes, options?: HttpExceptionOptions) {
    super(code, HttpStatus.UNAUTHORIZED, options);
  }
}

export class ForbiddenError extends ApplicationError<ForbiddenErrorCodes> {
  constructor(code: ForbiddenErrorCodes, options?: HttpExceptionOptions) {
    super(code, HttpStatus.FORBIDDEN, options);
  }
}

export class InternalServerError extends ApplicationError<InternalServerErrorErrorCodes> {
  constructor(
    code: InternalServerErrorErrorCodes,
    options?: HttpExceptionOptions,
  ) {
    super(code, HttpStatus.INTERNAL_SERVER_ERROR, options);
  }
}
