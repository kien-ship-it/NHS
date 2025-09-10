// /src/components/reports/ReportsDashboard.tsx

"use client";

import { useReports } from "@/app/reports/ReportsProvider";

// These components will be created in the next steps. For now, we are just
// establishing the structure of where they will go.
// import ReportList from './ReportList';
// import ReportDetailSidebar from './ReportDetailSidebar';
// import FullScreenView from './FullScreenView';

// --- Placeholder Components (to be replaced in later steps) ---
// We add these simple placeholders so the file can be saved without errors
// before we've created the actual components.
const ReportList = () => (
  <div className="bg-gray-100 p-4 w-1/3">Report List Placeholder</div>
);
const ReportDetailSidebar = () => (
  <div className="bg-gray-200 p-4 w-2/3">Report Detail Sidebar Placeholder</div>
);
const FullScreenView = () => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div className="bg-white p-8 rounded-lg">Full Screen View Placeholder</div>
  </div>
);
// --- End of Placeholder Components ---

/**
 * ReportsDashboard is the main orchestrator for the reports UI.
 * It consumes the shared state from ReportsProvider and determines which
 * sub-components (list, sidebar, full-screen view) to display.
 */
export default function ReportsDashboard() {
  // 1. Consume the shared state from our context provider.
  const { selectedReportId, viewMode, setViewMode } = useReports();

  // 2. Determine if the sidebar should be visible.
  // The sidebar appears when a report is selected AND we are in 'detail' mode.
  const isSidebarVisible = selectedReportId && viewMode === "detail";

  // 3. Determine if the full-screen modal should be visible.
  // The modal appears when creating a 'new' report or viewing one in 'fullscreen'.
  const isFullScreenVisible = viewMode === "new" || viewMode === "fullscreen";

  return (
    <div className="flex h-screen bg-white">
      {/* 
        This is the main layout container. The ReportList is always visible,
        and the sidebar conditionally takes up the remaining space.
      */}
      <ReportList />

      {/* 
        The sidebar is conditionally rendered. When visible, it will display
        the details of the currently selected report.
      */}
      {isSidebarVisible && <ReportDetailSidebar />}

      {/* 
        The FullScreenView is also conditional and acts as an overlay.
        It's used for focused tasks like creating a new report or a
        distraction-free detail view.
      */}
      {isFullScreenVisible && <FullScreenView />}
    </div>
  );
}