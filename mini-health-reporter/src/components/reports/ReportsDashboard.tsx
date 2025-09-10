// /src/components/reports/ReportsDashboard.tsx

"use client";

import { useReports } from "@/app/reports/ReportsProvider";

// Import actual components
import ReportList from './ReportList';
import ReportDetailSidebar from '../../app/reports/ReportDetailSidebar';
import FullScreenView from '../../app/reports/FullScreenView';

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

  // 4. Placeholder for user email initial (this would ideally come from auth context)
  const userEmail = "user@example.com"; // Replace with actual user data from context or props
  const userInitial = userEmail.charAt(0).toUpperCase();

  return (
    <div className="flex h-screen bg-white w-full">
      {/* Left Sidebar with user info and navigation */}
      <div className="w-56 bg-slate-800 text-white flex flex-col py-6 border-r border-slate-700">
        {/* User info section with settings */}
        <div className="px-4 mb-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-lg">
              {userInitial}
            </div>
            <div className="text-sm font-medium truncate">{userEmail}</div>
          </div>
          
          {/* Settings - Moved up */}
          <div className="flex items-center px-2 py-2 rounded-md cursor-pointer hover:bg-slate-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm">Settings</span>
          </div>
        </div>
        
        {/* Help section at the bottom */}
        <div className="mt-auto px-2">
          <div className="border-t border-slate-700 my-4"></div>
          <div className="flex items-center px-2 py-2 rounded-md cursor-pointer hover:bg-slate-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm">Help</span>
          </div>
        </div>
      </div>
      
      {/* 
        This is the main layout container. The ReportList is always visible,
        and expands to fill available space when sidebar is not visible.
      */}
      <div className={`flex-grow ${isSidebarVisible ? 'w-2/3' : 'w-full'}`}>
        <ReportList />
      </div>

      {/* 
        The sidebar is conditionally rendered. When visible, it will display
        the details of the currently selected report with a fixed width.
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