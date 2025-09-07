// src/lib/auth.ts

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// This is our "secret key" for signing the JWTs. It's crucial that this
// is kept secret. If someone gets this key, they can create fake tokens.
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set.');
}

// At this point, we know JWT_SECRET is defined
const JWT_SECRET_DEFINED = JWT_SECRET as string;

// This is the "payload" of our token. It's the information we store inside
// the JWT. We're keeping it simple and only storing the user's ID.
export interface AuthPayload {
  userId: string;
}

// This function creates the JWT.
export function createSessionToken(payload: AuthPayload) {
  // We use the `jsonwebtoken` library to "sign" the token. This creates
  // the secure signature using our secret key.
  const token = jwt.sign(payload, JWT_SECRET_DEFINED, {
    expiresIn: '7d', // The token will be valid for 7 days.
  });
  return token;
}