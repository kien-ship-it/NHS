// src/app/api/reports/route.ts

import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { verifyAuthSession } from '@/lib/auth';
import { createReportSchema } from '@/lib/schema';
import { randomUUID } from 'crypto';

/**
 * API handler to GET all reports for the authenticated user.
 */
export async function GET(request: Request) {
  try {
    // 1. Gatekeeper: Check if the user is authenticated
    const session = await verifyAuthSession();

    // 2. Fetch reports from the database filing cabinet
    const reports = db
      .prepare(
        'SELECT * FROM reports WHERE created_by = ? ORDER BY created_at DESC'
      )
      .all(session.userId);

    // 3. Hand over the reports
    return NextResponse.json(reports);
  } catch (error) {
    // If the gatekeeper threw an error (invalid token), deny access
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }
}

/**
 * API handler to POST a new report for the authenticated user.
 */
export async function POST(request: Request) {
  try {
    // 1. Gatekeeper: Check authentication first
    const session = await verifyAuthSession();

    // 2. Get the form data from the request
    const requestBody = await request.json();

    // 3. Use the Zod blueprint to validate the form data
    const validation = createReportSchema.safeParse(requestBody);

    if (!validation.success) {
      // If validation fails, return a detailed error message
      return NextResponse.json(
        { message: 'Invalid input', errors: validation.error.flatten() },
        { status: 400 }
      );
    }

    // 4. Prepare the new report data for the database
    const newReport = {
      id: randomUUID(),
      patient_name: validation.data.patient_name,
      diagnosis: validation.data.diagnosis,
      created_by: session.userId,
      status: 'LOCAL', // New reports always start as LOCAL
    };

    // 5. File it in the database
    db.prepare(
      `
      INSERT INTO reports (id, patient_name, diagnosis, created_by, status)
      VALUES (?, ?, ?, ?, ?)
    `
    ).run(
      newReport.id,
      newReport.patient_name,
      newReport.diagnosis,
      newReport.created_by,
      newReport.status
    );

    // 6. Give back a copy of the newly filed report
    return NextResponse.json(newReport, { status: 201 });
  } catch (error) {
    // Handle authentication errors
    if (error instanceof Error && error.message.includes('token')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Handle any other unexpected server errors
    console.error(error); // Log the actual error for debugging
    return NextResponse.json(
      { message: 'An internal server error occurred' },
      { status: 500 }
    );
  }
}