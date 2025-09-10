// src/components/reports/ReportList.tsx
'use client';

import { useReports, Report } from '@/app/reports/ReportsProvider';

/**
 * Renders the list of reports and handles selection.
 * It's the main navigation panel for the user's dashboard.
 */
export default function ReportList() {
  // 1. Consume the shared state and functions from our ReportsContext.
  const {
    reports,
    selectedReportId,
    setSelectedReportId,
    setViewMode,
  } = useReports();

  // 2. Define a handler for creating a new report.
  // This clears any current selection and sets the view mode to 'new',
  // which will trigger the FullScreenView to open with the creation form.
  const handleCreateNew = () => {
    setSelectedReportId(null); // Deselect any active report.
    setViewMode('new');
  };

  // 3. Define a handler for selecting a report from the list.
  // This updates the selected ID and sets the view to 'detail',
  // which will trigger the ReportDetailSidebar to appear.
  const handleSelectReport = (reportId: string) => {
    setSelectedReportId(reportId);
    setViewMode('detail');
  };

  return (
    <div className="border-r border-slate-200 bg-slate-50 flex flex-col h-full">
      {/* Header and Create Button */}
      <div className="p-4 border-b border-slate-200">
        <h2 className="text-4xl font-bold text-slate-800 pt-10 mb-4 pl-4">Reports</h2>
        <button
          onClick={handleCreateNew}
          className="w-full bg-blue-600 text-white font-bold py-2 pl-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
        >
          Create New Report
        </button>
      </div>

      {/* Reports List */}
      <div className="flex-grow overflow-y-auto">
        {reports.length > 0 ? (
          <ul>
            {reports.map((report: Report) => (
              <li key={report.id}>
                <button
                  onClick={() => handleSelectReport(report.id)}
                  // 4. Conditional styling: The background color changes if the report is selected.
                  className={`w-full text-left p-4 border-b border-slate-200 hover:bg-slate-200 transition-colors focus:outline-none ${
                    selectedReportId === report.id
                      ? 'bg-slate-200'
                      : 'bg-white'
                  }`}
                >
                  <p className="font-semibold text-slate-900 truncate pl-4">
                    {report.patient_name}
                  </p>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-sm text-slate-500 pl-4">
                      {report.created_at ? new Date(report.created_at).toLocaleDateString() : 'Date unavailable'}
                    </p>
                    {/* 5. A visual tag to show the report's status. */}
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full pr-4 ${
                        report.status === 'PUSHED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {report.status}
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          // 6. A message to show when there are no reports.
          <p className="p-4 text-center text-slate-500">
            No reports found.
          </p>
        )}
      </div>
    </div>
  );
}