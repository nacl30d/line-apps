import { Buffer } from 'node:buffer';

export const verifySignature = async (
  secret: string,
  data: string,
  signature: string,
): Promise<boolean> => {
  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify'],
  );

  return await crypto.subtle.verify(
    'HMAC',
    key,
    Buffer.from(signature, 'base64'),
    encoder.encode(data),
  );
};
