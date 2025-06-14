import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { verifyLineSignature } from './auth/verify-line-signature.middleware';
import { ErrorHandler } from './error/handler';
import { HttpStatus } from './lib/http';

const app = new Hono();
app.use(logger());
app.use(secureHeaders());

app.options((c) => {
  c.status(HttpStatus.NO_CONTENT);
  return c.body(null);
});

app.notFound((c) => {
  c.header('Content-Type', 'application/problem+json');
  c.header('Content-Encoding', 'utf-8');
  c.status(HttpStatus.NOT_FOUND);
  return c.body(JSON.stringify({ message: `${c.req.path} is not found.` }));
});

app.onError(ErrorHandler);

app.post('/webhook', verifyLineSignature, async (c) => {
  return c.json(null);
});

export default app;
