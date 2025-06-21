import type { webhook } from '@line/bot-sdk';
import { Hono } from 'hono';
import { env } from 'hono/adapter';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { verifyLineSignature } from './auth/verify-line-signature.middleware';
import type { Config } from './environment';
import { ErrorHandler } from './error/handler';
import { HttpStatus } from './lib/http';
import { LineService } from './service/line.service';

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
  // DEBUG モード以外は応答しない
  if (env<Config>(c).DEBUG !== true) {
    return c.json(null);
  }

  const req: webhook.CallbackRequest = await c.req.json();
  const line = new LineService(env<Config>(c).LINE_CHANNEL_ACCESS_TOKEN);

  for (const event of req.events) {
    // メンション以外は応答しない
    if (
      event.type === 'message' &&
      event.message.type === 'text' &&
      event.message.mention?.mentionees[0]?.isSelf
    ) {
      const replyToken = event.replyToken;
      if (replyToken === undefined) {
        return;
      }

      const argv = event.message.text.split(/\s/);
      const cmd = argv[1];

      let message = '';
      switch (cmd) {
        case 'ping':
          message = 'pong';
          break;
        case 'describe': {
          const target = argv[2];
          switch (target) {
            case 'group': {
              if (event.source?.type !== 'group') {
                message = 'This room is not a group.';
                break;
              }
              const group = await line.getGroupSummary(event.source.groupId);
              message = JSON.stringify(group, null, 2);
              break;
            }
          }
          break;
        }
        case 'debug':
          message = JSON.stringify(event, null, 2);
          break;
        default:
          message = [
            'USAGE',
            '  @mention <command>',
            '',
            'COMMANDS',
            '  ping:      Response "pong"',
            '  describe:  Describe group or user',
            '  debug:     Show this event metadata',
            '  help:      Show usage',
          ].join("\n");
      }

      await line.replyMessage({
        replyToken: replyToken,
        messages: [
          {
            type: 'text',
            text: message,
          },
        ],
      });
    }
  }

  return c.json(null);
});

export default app;
