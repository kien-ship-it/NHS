// src/middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';
import { AuthPayload } from './lib/auth'; // We can reuse the type definition!

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set in middleware');
}

// Convert the secret to a format usable by jose (Uint8Array)
const JWT_SECRET_KEY = new TextEncoder().encode(JWT_SECRET);

// This function is the "bouncer" for our protected pages.
export async function middleware(request: NextRequest) {
  console.log(`[Middleware] Path: ${request.nextUrl.pathname}`);
  // 1. Get the cookie from the incoming request
  const token = request.cookies.get('session-token')?.value;
  console.log(`[Middleware] Session token: ${token ? 'found' : 'not found'}`);

  // 2. If there's no token, they can't come in. Redirect them to the login page.
  // We also check that the requested page isn't ALREADY the login page to avoid an infinite redirect loop.
  if (!token && request.nextUrl.pathname !== '/login') {
    console.log('[Middleware] No token, redirecting to /login');
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 3. If there IS a token, we need to check if it's a valid one.
  if (token) {
    try {
      // We use the same secret key to try and "unlock" or verify the token.
      const { payload } = await jose.jwtVerify(token, JWT_SECRET_KEY, { algorithms: ['HS256'] });
      console.log('[Middleware] Token is valid, proceeding.');
      return NextResponse.next();
    } catch (error) {
      // If jose.jwtVerify throws an error, it means the token is fake or expired.
      // So, we send them to the login page.
      console.log('[Middleware] Token verification failed, redirecting to /login. Error:', error);
      console.log('[Middleware] JWT_SECRET in middleware:', JWT_SECRET ? 'defined' : 'undefined');
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 4. If none of the above conditions are met, just continue.
  return NextResponse.next();
}

// This config object tells the middleware WHICH paths to run on.
// We only want our "bouncer" to check people trying to access the `/reports` area.
export const config = {
  matcher: '/reports/:path*',
};