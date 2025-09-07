// src/app/api/reports/[id]/route.ts

import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { verifyAuthSession } from '@/lib/auth';

/**
 * Handles GET requests to fetch a single report by its ID.
 * This route is protected and requires a valid session token.
 * It also ensures that a user can only fetch reports they created.
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Authenticate the user and get their ID
    // If the token is invalid or missing, this function will throw an error,
    // which will be caught by our catch block below.
    const { userId } = await verifyAuthSession();

    // 2. Fetch the report from the database
    // We are adding a condition to the query: not only must the `id` match
    // the one from the URL, but the `created_by` column MUST match the ID
    // of the user making the request. This is a critical security check.
    const getReportStmt = db.prepare(
      'SELECT * FROM reports WHERE id = ? AND created_by = ?'
    );
    const report = getReportStmt.get(params.id, userId);

    // 3. Handle the response
    if (report) {
      // If we found a report, return it with a 200 OK status.
      return NextResponse.json(report, { status: 200 });
    } else {
      // If no report was found, it either doesn't exist or the user doesn't
      // own it. In either case, we return a 404 Not Found.
      return NextResponse.json(
        { message: 'Report not found or you do not have permission' },
        { status: 404 }
      );
    }
  } catch (error) {
    // This block catches errors from `verifyAuthSession` (authentication failure)
    if ((error as Error).message.includes('token')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // This handles any other unexpected errors during the process.
    console.error('Failed to fetch report:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}