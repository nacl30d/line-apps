import { env } from 'hono/adapter';
import { createMiddleware } from 'hono/factory';
import type { Config } from '../environment';
import { ForbiddenError, UnauthorizedError } from '../error/errors';
import { verifySignature } from './verify-signature';

export const verifyLineSignature = createMiddleware(async (c, next) => {
  const signature = c.req.header('x-line-signature');
  if (!signature) {
    throw new UnauthorizedError('INVALID_AUTHENTICATION', {
      message: 'sgnature header is missing.',
    });
  }

  const { LINE_CHANNEL_SECRET: secret } = env<Config>(c);
  const body = await c.req.text();

  const validated = await verifySignature(secret, body, signature);
  if (!validated) {
    throw new ForbiddenError('INVALID_SIGNATURE', {
      message: 'Invalid signature.',
    });
  }

  await next();
});
