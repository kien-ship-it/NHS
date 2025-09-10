// src/middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { AuthPayload } from './lib/auth'; // We can reuse the type definition!

const JWT_SECRET = process.env.JWT_SECRET;

// This function is the "bouncer" for our protected pages.
export function middleware(request: NextRequest) {
  // 1. Get the cookie from the incoming request
  const token = request.cookies.get('session-token')?.value;

  // 2. If there's no token, they can't come in. Redirect them to the login page.
  // We also check that the requested page isn't ALREADY the login page to avoid an infinite redirect loop.
  if (!token && request.nextUrl.pathname !== '/login') {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 3. If there IS a token, we need to check if it's a valid one.
  if (token) {
    try {
      // We use the same secret key to try and "unlock" or verify the token.
      jwt.verify(token, JWT_SECRET as string) as AuthPayload;
      // If the line above doesn't throw an error, the token is valid!
      // We let them proceed to the page they requested.
      return NextResponse.next();
    } catch (error) {
      // If jwt.verify throws an error, it means the token is fake or expired.
      // So, we send them to the login page.
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