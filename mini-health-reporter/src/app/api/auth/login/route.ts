// src/app/api/auth/login/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import bcrypt from 'bcrypt';
import db from '@/lib/db';
import { loginUserSchema } from '@/lib/schema';
import { createSessionToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    // 1. Get the raw data from the request and validate it with our Zod schema.
    const body = await req.json();
    const { email, password } = loginUserSchema.parse(body);

    // 2. Look for the user in the database.
    // We use a prepared statement (?) to prevent SQL injection attacks.
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    const user = stmt.get(email) as { id: string; email: string; password_hash: string } | undefined;

    // 3. If no user is found, or if the password doesn't match, return an error.
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 } // 401 Unauthorized
      );
    }

    // 4. Compare the provided password with the stored hash.
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // 5. If everything is correct, create the session token.
    const token = createSessionToken({ userId: user.id });

    // 6. Return a successful response with the user's data (excluding the password!)
    // and set the session cookie.
    const response = NextResponse.json({
      id: user.id,
      email: user.email,
    });

    response.cookies.set('session-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
      path: '/',
      sameSite: 'lax',
    });

    return response;

  } catch (error) {
    // If Zod validation fails, it throws an error. We catch it here
    // and return a helpful message showing what was wrong.
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: 'Invalid request data', errors: error.issues },
        { status: 400 } // 400 Bad Request
      );
    }

    // For any other unexpected errors, return a generic server error.
    console.error(error); // Log the actual error for debugging
    return NextResponse.json(
      { message: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}