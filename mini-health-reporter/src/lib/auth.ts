// src/lib/auth.ts

import * as jose from 'jose';
import { cookies } from 'next/headers';

// This is our "secret key" for signing the JWTs. It's crucial that this
// is kept secret. If someone gets this key, they can create fake tokens.
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set.');
}

// Convert the secret to a format usable by jose (Uint8Array)
const JWT_SECRET_KEY = new TextEncoder().encode(JWT_SECRET);

// This is the "payload" of our token. It's the information we store inside
// the JWT. We're keeping it simple and only storing the user's ID.
export interface AuthPayload {
  userId: string;
  [key: string]: any; // Added index signature to allow for additional properties
}

// This function creates the JWT.
export async function createSessionToken(payload: AuthPayload) {
  // We use the `jose` library to create and sign the token.
  // This creates the secure signature using our secret key.
  const jwt = new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d'); // Token expires in 7 days
  return await jwt.sign(JWT_SECRET_KEY);
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
    const { payload } = await jose.jwtVerify(token, JWT_SECRET_KEY, { algorithms: ['HS256'] });
    return payload as unknown as AuthPayload;
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