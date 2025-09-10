'use client';

import { useReports } from '@/app/reports/ReportsProvider';

/**
 * ReportList is a client component that displays a list of all reports
 * from the shared context. It allows the user to select a report to view
 * its details or to initiate the creation of a new report.
 */
export default function ReportList() {
  // Consume the shared state from our ReportsProvider using the custom hook.
  const { reports, selectedReportId, setSelectedReportId, setViewMode } =
    useReports();

  const handleCreateNew = () => {
    // When creating a new report, we ensure no report is selected
    // and set the view mode to 'new', which will trigger the FullScreenView.
    setSelectedReportId(null);
    setViewMode('new');
  };

  const handleSelectReport = (reportId: string) => {
    // When a report is selected, update the global state.
    // This will cause the ReportDetailSidebar to appear.
    setSelectedReportId(reportId);
    // Ensure we are in detail view mode when a report is selected
    setViewMode('detail');
  };

  return (
    <div className="flex h-full flex-col border-r border-gray-200 bg-gray-50">
      <div className="p-4">
        <button
          onClick={handleCreateNew}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          Create New Report
        </button>
      </div>
      <div className="flex-grow overflow-y-auto">
        <nav>
          <ul role="list" className="divide-y divide-gray-200">
            {reports.map((report) => (
              <li key={report.id}>
                <button
                  onClick={() => handleSelectReport(report.id)}
                  className={`flex w-full items-center justify-between gap-x-3 p-4 text-left text-sm hover:bg-gray-100 ${
                    report.id === selectedReportId ? 'bg-blue-100' : ''
                  }`}
                >
                  <div className="flex min-w-0 flex-col">
                    <p className="font-semibold text-gray-900">
                      {report.patient_name}
                    </p>
                    <p className="mt-1 truncate text-xs leading-5 text-gray-500">
                      ID: {report.id.substring(0, 8)}...
                    </p>
                  </div>
                  <div className="flex flex-none items-center gap-x-2">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                        report.status === 'PUSHED'
                          ? 'bg-green-50 text-green-700 ring-green-600/20'
                          : 'bg-yellow-50 text-yellow-800 ring-yellow-600/20'
                      }`}
                    >
                      {report.status}
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}