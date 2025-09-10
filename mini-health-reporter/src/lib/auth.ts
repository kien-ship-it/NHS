// src/lib/auth.ts

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { cookies } from 'next/headers';

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

/**
 * Verifies the session token from the incoming request's cookies.
 * This is a server-side utility.
 * @returns The decoded payload of the JWT if valid.
 * @throws An error if the token is missing, malformed, or invalid.
 */
export async function verifyAuthSession() {
  const token = (await cookies()).get('session-token')?.value;

  if (!token) {
    throw new Error('Missing session token');
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET_DEFINED) as AuthPayload;
    return payload;
  } catch (err) {
    throw new Error('Invalid session token');
  }
}

/**
 * A safe wrapper around verifyAuthSession that returns the session payload
 * or null if the session is not valid. It does not throw an error.
 * This is ideal for use in Server Components to check for an active session.
 * @returns The decoded payload of the JWT if valid, otherwise null.
 */
export async function getSession(): Promise<AuthPayload | null> {
  try {
    // Attempt to verify the session. If it works, return the payload.
    const payload = await verifyAuthSession();
    return payload;
  } catch (err) {
    // If verifyAuthSession throws any error (missing, invalid, etc.),
    // we catch it and simply return null.
    return null;
  }
}