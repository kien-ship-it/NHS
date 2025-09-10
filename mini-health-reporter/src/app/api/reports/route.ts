// src/app/api/reports/route.ts

import { NextRequest, NextResponse } from 'next/server';
import db from '../../../lib/db';
import { createReportSchema } from '../../../lib/schema';
import { randomUUID } from 'crypto';

/**
 * API handler to GET all reports for the authenticated user.
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Temporarily bypass authentication for testing
    // const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    // if (!token) {
    //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    // }
    // Note: In a complete implementation, token verification would be done here

    // 2. Fetch all reports from the database
    const reports = db.prepare('SELECT * FROM reports').all();

    // 3. Return the reports as JSON
    return NextResponse.json(reports, { status: 200 });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

/**
 * API handler to POST a new report for the authenticated user.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Temporarily bypass authentication for testing
    // const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    // if (!token) {
    //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    // }
    // Note: In a complete implementation, token verification would be done here

    // 2. Parse the request body for report data
    const body = await request.json();
    const { patient_name, diagnosis, created_by = 'unknown_user' } = body;

    // 3. Validate the input data
    if (!patient_name || !diagnosis) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // 4. Create a new report object with a unique ID
    const newReport = {
      id: Date.now().toString(), // Simple unique ID based on timestamp
      patient_name,
      diagnosis,
      created_by,
      status: 'LOCAL', // New reports always start as LOCAL
      created_at: new Date().toISOString(), // Set the current timestamp
    };

    // 5. File it in the database
    db.prepare(
      `
      INSERT INTO reports (id, patient_name, diagnosis, created_by, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `
    ).run(
      newReport.id,
      newReport.patient_name,
      newReport.diagnosis,
      newReport.created_by,
      newReport.status,
      newReport.created_at
    );

    // 6. Give back a copy of the newly filed report
    return NextResponse.json(newReport, { status: 201 });
  } catch (error) {
    // Handle any other unexpected server errors
    console.error('Error creating report:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// DELETE endpoint removed as it is handled in /api/reports/[id]/route.ts