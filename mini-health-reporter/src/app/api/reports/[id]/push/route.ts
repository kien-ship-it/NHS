// src/app/api/reports/[id]/push/route.ts

import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { verifyAuthSession } from '@/lib/auth';

/**
 * Handles POST requests to "push" a local report to the national system.
 * This is a protected, multi-step process:
 * 1. Authenticate the user.
 * 2. Authorize: Check if the report exists and belongs to the user.
 * 3. Act: Call the mock national API.
 * 4. Update: Save the new status and national ID to the database.
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Step 1: Authenticate the user
    const { userId } = await verifyAuthSession();

    // Step 2: Authorize by fetching the report and checking ownership
    const getReportStmt = db.prepare(
      'SELECT id, patient_name, diagnosis FROM reports WHERE id = ? AND created_by = ?'
    );
    const reportToPush = getReportStmt.get(params.id, userId) as
      | { id: string; patient_name: string; diagnosis: string }
      | undefined;

    if (!reportToPush) {
      // If the report doesn't exist or isn't owned by the user, deny access.
      return NextResponse.json(
        { message: 'Report not found or you do not have permission' },
        { status: 404 } // 404 is appropriate as the resource is not available to this user
      );
    }

    // Step 3: Call the mock national API
    // We construct the full URL for the fetch call. Using `request.url` as the
    // base makes this robust, as it will work in development (localhost) and
    // in production without hardcoding the domain.
    const nationalApiUrl = new URL('/api/mock/national', request.url);

    const nationalApiResponse = await fetch(nationalApiUrl.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patient_name: reportToPush.patient_name,
        diagnosis: reportToPush.diagnosis,
      }),
    });

    if (!nationalApiResponse.ok) {
      // If the mock service fails for any reason, we stop the process.
      throw new Error('Failed to communicate with the national health system API.');
    }

    const nationalData = await nationalApiResponse.json();
    const nationalId = nationalData.nationalId;

    if (!nationalId) {
      throw new Error('Received an invalid response from the national API.');
    }

    // Step 4: Update the report in our database
    const updateReportStmt = db.prepare(
      "UPDATE reports SET status = 'PUSHED', national_id = ? WHERE id = ?"
    );
    updateReportStmt.run(nationalId, params.id);

    // Finally, fetch the fully updated report to send back to the client.
    const getUpdatedReportStmt = db.prepare('SELECT * FROM reports WHERE id = ?');
    const updatedReport = getUpdatedReportStmt.get(params.id);

    return NextResponse.json(updatedReport, { status: 200 });
  } catch (error) {
    if ((error as Error).message.includes('token')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    console.error('Failed to push report:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}