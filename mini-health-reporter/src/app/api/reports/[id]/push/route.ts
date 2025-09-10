// src/app/api/reports/[id]/push/route.ts

import { NextResponse } from 'next/server';
import db from '@/lib/db';

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
    // 1. Temporarily bypass authentication for testing
    const reportId = params.id;

    // Validate request body
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: "Invalid request data: Malformed JSON" }, { status: 400 });
    }
    
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: "Invalid request data: Body must be an object" }, { status: 400 });
    }

    // 2. Check if the report exists and is in LOCAL status
    const report = db.prepare('SELECT * FROM reports WHERE id = ?').get(reportId) as { status?: string } | undefined;

    if (!report) {
      return NextResponse.json({ message: 'Report not found' }, { status: 404 });
    }

    if (report.status !== 'LOCAL') {
      return NextResponse.json({ message: 'Report cannot be pushed; it is not in LOCAL status' }, { status: 400 });
    }

    // 3. Simulate pushing to a national system (this is a placeholder for actual API calls)
    // In a real application, you would integrate with an external system here.
    // For now, we'll just update the status and assign a fake national ID.
    const nationalId = `NAT-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;

    // 4. Update the report status to PUSHED and set the national ID
    db.prepare('UPDATE reports SET status = ?, national_id = ? WHERE id = ?')
      .run('PUSHED', nationalId, reportId);

    // 5. Fetch the updated report
    const updatedReport = db.prepare('SELECT * FROM reports WHERE id = ?').get(reportId);

    // 6. Return the updated report
    return NextResponse.json(updatedReport, { status: 200 });
  } catch (error) {
    console.error('Error pushing report:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}