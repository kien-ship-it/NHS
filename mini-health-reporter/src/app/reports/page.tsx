import { redirect } from 'next/navigation';

import { ReportsProvider } from './ReportsProvider';
import ReportsDashboard from '@/components/reports/ReportsDashboard'; // Using @ alias for cleaner imports
import { getSession } from '@/lib/auth'; // Assuming a server-side auth utility
import db from '@/lib/db'; // Assuming a direct db access or a query function file
import { Report } from './ReportsProvider'; // Import the Report type

/**
 * A server-side utility function to fetch reports for a specific user.
 * In a real application, this would live in a file like `src/lib/queries.ts` or `db.ts`,
 * but is included here for clarity in this step.
 */
async function getReportsForUser(userId: string): Promise<Report[]> {
  // We use a prepared statement to prevent SQL injection vulnerabilities.
  const stmt = db.prepare(
    'SELECT * FROM reports WHERE created_by = ? ORDER BY created_at DESC'
  );
  const reports = stmt.all(userId);
  // The database returns DATETIME as a string, which matches our Report type.
  return reports as Report[];
}

// This is a Server Component. It runs only on the server.
export default async function ReportsPage() {
  // 1. Get the user's session from the secure cookie.
  const session = await getSession();

  // 2. Although middleware protects this route, we add a server-side check as a fallback.
  // If there's no session, we redirect to the login page.
  if (!session?.userId) {
    redirect('/login');
  }

  // 3. Fetch the initial data required for the page.
  // This happens on the server before any HTML is sent to the client.
  const initialReports = await getReportsForUser(session.userId);

  // 4. Render the Client-Side Provider, passing the server-fetched data as a prop.
  // This "hydrates" the client state with the necessary initial data.
  return (
    <ReportsProvider initialReports={initialReports}>
      {/* 
        ReportsDashboard is a Client Component that will consume the context 
        provided by ReportsProvider. It will handle all user interactions.
      */}
      <ReportsDashboard />
    </ReportsProvider>
  );
}