'use client';

import {
  createContext,
  useContext,
  useState,
  useMemo,
  ReactNode,
  Dispatch,
  SetStateAction,
} from 'react';

// 1. Define the structure of a Report object based on our database schema.
// This ensures type safety throughout the application.
export interface Report {
  id: string;
  patient_name: string;
  diagnosis: string;
  created_by: string;
  status: 'LOCAL' | 'PUSHED';
  national_id: string | null;
  created_at: string;
}

// Define the different views our dashboard can be in.
export type ViewMode = 'detail' | 'fullscreen' | 'new' | null;

// 2. Define the shape of our shared state (the "bulletin board").
interface ReportsContextState {
  reports: Report[];
  setReports: Dispatch<SetStateAction<Report[]>>;
  selectedReportId: string | null;
  setSelectedReportId: Dispatch<SetStateAction<string | null>>;
  viewMode: ViewMode;
  setViewMode: Dispatch<SetStateAction<ViewMode>>;
  // Derived state: makes it easy to get the currently selected report object.
  selectedReport: Report | undefined;
  // Action: A convenient function to update a report after it's been pushed.
  updateReportStatus: (updatedReport: Report) => void;
  // Action: A convenient function to add a newly created report to the list.
  addNewReport: (newReport: Report) => void;
}

// 3. Create the actual React Context with a default undefined value.
// We'll handle the 'undefined' case with a check in our custom hook.
const ReportsContext = createContext<ReportsContextState | undefined>(undefined);

// 4. Define the props for our Provider component.
interface ReportsProviderProps {
  children: ReactNode;
  initialReports?: Report[]; // Server-fetched reports to hydrate the state.
}

// 5. Create the Provider Component. This is the component that will wrap our dashboard.
export function ReportsProvider({
  children,
  initialReports = [],
}: ReportsProviderProps) {
  // State hooks to manage our dashboard's state.
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(null);

  // This is a "derived" value. It automatically finds the full report object
  // whenever the selectedReportId or the list of reports changes.
  const selectedReport = useMemo(
    () => reports.find((report) => report.id === selectedReportId),
    [reports, selectedReportId]
  );
  
  // Handler function to update a report in the list.
  // Typically used after a report has been successfully "pushed".
  const updateReportStatus = (updatedReport: Report) => {
    setReports((currentReports) =>
      currentReports.map((report) =>
        report.id === updatedReport.id ? updatedReport : report
      )
    );
  };

  // Handler function to add a new report to the top of the list.
  const addNewReport = (newReport: Report) => {
    setReports((currentReports) => [newReport, ...currentReports]);
  };

  // We use useMemo here as a performance optimization. The context value object
  // will only be recreated if one of its dependencies changes.
  const value = useMemo(
    () => ({
      reports,
      setReports,
      selectedReportId,
      setSelectedReportId,
      viewMode,
      setViewMode,
      selectedReport,
      updateReportStatus,
      addNewReport,
    }),
    [reports, selectedReportId, viewMode, selectedReport]
  );

  return (
    <ReportsContext.Provider value={value}>{children}</ReportsContext.Provider>
  );
}

// 6. Create a custom hook for easily accessing the context.
// This is a best practice that simplifies usage in consumer components.
export function useReports() {
  const context = useContext(ReportsContext);
  if (context === undefined) {
    throw new Error('useReports must be used within a ReportsProvider');
  }
  return context;
}