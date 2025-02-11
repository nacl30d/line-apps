import type { ErrorHandler as Handler } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { HttpStatus } from '../lib/http';

export const ErrorHandler: Handler = async (err, c) => {
  c.header('Content-Type', 'application/problem+json');
  c.header('Content-Encoding', 'utf-8');

  if (err instanceof HTTPException) {
    const res = await err.getResponse().json();
    return c.body(JSON.stringify(res));
  }

  c.status(HttpStatus.INTERNAL_SERVER_ERROR);
  return c.body(JSON.stringify({ message: 'Something went wrong.' }));
};
