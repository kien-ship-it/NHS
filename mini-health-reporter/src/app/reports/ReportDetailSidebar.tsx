// src/components/reports/ReportDetailSidebar.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useReports } from '@/app/reports/ReportsProvider';

/**
 * A sidebar component that displays the details of the currently selected report.
 * It provides actions like pushing the report to a national system, viewing it
 * in full screen, or closing the sidebar.
 */
export default function ReportDetailSidebar() {
  const {
    selectedReport,
    setSelectedReportId,
    setViewMode,
    updateReportStatus,
    setReports
  } = useReports();

  // Component-specific state to manage the API call for pushing a report.
  const [isPushing, setIsPushing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedReport, setEditedReport] = useState(selectedReport ? { ...selectedReport } : {
    id: '',
    patient_name: '',
    diagnosis: '',
    created_by: '',
    status: 'LOCAL' as const,
    national_id: null,
    created_at: new Date().toISOString()
  });

  // Update editedReport when selectedReport changes
  useEffect(() => {
    if (selectedReport) {
      setEditedReport({ ...selectedReport });
    }
  }, [selectedReport]);

  // If no report is selected, the sidebar should not be rendered at all.
  // This check prevents errors if the component were to be rendered accidentally.
  if (!selectedReport) {
    return null;
  }

  const handlePush = async () => {
    setIsPushing(true);
    setError(null);

    try {
      const tokenCookie = document.cookie.split('; ').find(row => row.startsWith('session-token='));
      const token = tokenCookie ? tokenCookie.split('=')[1] : undefined;
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(`/api/reports/${selectedReport.id}/push`, {
        method: 'POST',
        headers: headers
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to push the report.');
      }

      const updatedReport = await response.json();

      // Use the function from our context to update the client-side state.
      // This will instantly re-render the list and this sidebar with the new status.
      updateReportStatus(updatedReport);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsPushing(false);
    }
  };

  const handleEdit = () => {
    if (isEditing) {
      // Save changes
      if (selectedReport) {
        setIsSaving(true);
        setError(null);
        const tokenCookie = document.cookie.split('; ').find(row => row.startsWith('session-token='));
        const token = tokenCookie ? tokenCookie.split('=')[1] : undefined;
        const headers: Record<string, string> = {
          'Content-Type': 'application/json'
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        fetch(`/api/reports/${selectedReport.id}`, {
          method: 'PUT',
          headers: headers,
          body: JSON.stringify({
            patient_name: editedReport.patient_name,
            diagnosis: editedReport.diagnosis,
          }),
        })
          .then(response => {
            if (!response.ok) {
              return response.json().then(errorData => {
                throw new Error(errorData.message || 'Failed to update the report.');
              });
            }
            return response.json();
          })
          .then(updatedReport => {
            updateReportStatus({
              ...editedReport,
              id: selectedReport.id,
              created_by: selectedReport.created_by,
              status: selectedReport.status,
              national_id: selectedReport.national_id,
              created_at: selectedReport.created_at
            });
            setSelectedReportId(selectedReport.id); // Refresh the view
            setIsEditing(false);
          })
          .catch(err => {
            setError(err.message);
          })
          .finally(() => {
            setIsSaving(false);
          });
      }
    } else {
      setIsEditing(true);
    }
  };

  const handleFullScreen = () => {
    setViewMode('fullscreen');
  };

  return (
    <aside className="border-l bg-gray-50 w-96 p-6 flex flex-col">
      <div className="flex justify-between items-center mb-4 border-b pb-2">
        <h2 className="text-xl font-bold text-black">
          Report Details
        </h2>
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleFullScreen}
            className="text-gray-600 hover:text-black p-1 rounded-full hover:bg-gray-200"
            aria-label="View full screen"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
          <button 
            onClick={() => setSelectedReportId(null)}
            className="text-gray-600 hover:text-black p-1 rounded-full hover:bg-gray-200"
            aria-label="Close sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      <div className="flex-grow">
        {/* Report Details Section */}
        <div className="mb-4">
          <label className="text-sm font-medium text-black">Patient Name</label>
          {isEditing ? (
            <input
              type="text"
              value={editedReport.patient_name}
              onChange={(e) => setEditedReport({ ...editedReport, patient_name: e.target.value })}
              className="w-full border rounded-md p-2 mt-1"
            />
          ) : (
            <p className="text-lg text-black">{selectedReport.patient_name}</p>
          )}
        </div>
        <div className="mb-4">
          <label className="text-sm font-medium text-black">Diagnosis</label>
          {isEditing ? (
            <textarea
              value={editedReport.diagnosis}
              onChange={(e) => setEditedReport({ ...editedReport, diagnosis: e.target.value })}
              className="w-full border rounded-md p-2 mt-1"
              rows={3}
            />
          ) : (
            <p className="text-base text-black">{selectedReport.diagnosis}</p>
          )}
        </div>
        <div className="mb-4">
          <label className="text-sm font-medium text-black">Status</label>
          <p
            className={`font-mono text-sm font-bold ${selectedReport.status === 'PUSHED' ? 'text-green-600' : 'text-blue-600'}`}
          >
            {selectedReport.status}
          </p>
        </div>
        
        {/* Display National ID if it exists */}
        {selectedReport.national_id && (
          <div className="mb-4">
            <label className="text-sm font-medium text-black">National ID</label>
            <p className="font-mono text-black">{selectedReport.national_id}</p>
          </div>
        )}

        {/* Display API error message if one occurs during the push */}
        {error && selectedReport && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </div>

      {/* Action Buttons Section */}
      <div className="flex flex-col space-y-3 border-t pt-4">
        {selectedReport.status === 'LOCAL' && (
          <button
            onClick={handlePush}
            disabled={isPushing}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
          >
            {isPushing ? 'Pushing...' : 'Push to National System'}
          </button>
        )}
        {selectedReport.status !== 'PUSHED' && (
          <button
            onClick={handleEdit}
            className="w-full bg-yellow-500 text-white py-2 rounded-md hover:bg-yellow-600 disabled:bg-yellow-300"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : isEditing ? 'Save' : 'Edit'}
          </button>
        )}
        {isEditing && (
          <button
            onClick={async () => {
              if (confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
                if (selectedReport) {
                  setIsDeleting(true);
                  setError(null);
                  try {
                    // Attempt to get a session token from cookies if available
                    const tokenCookie = document.cookie.split('; ').find(row => row.startsWith('session-token='));
                    const token = tokenCookie ? tokenCookie.split('=')[1] : undefined;
                    const headers: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {};
                    const response = await fetch(`/api/reports/${selectedReport.id}`, {
                      method: 'DELETE',
                      headers: headers
                    });
                    if (!response.ok) {
                      const errorData = await response.json();
                      throw new Error(errorData.message || 'Failed to delete the report.');
                    }
                    // Remove the report from the list
                    setReports(reports => reports.filter(report => report.id !== selectedReport.id));
                    setSelectedReportId(null); // Hide the sidebar
                  } catch (err: any) {
                    setError(err.message);
                  } finally {
                    setIsDeleting(false);
                  }
                }
              }
            }}
            disabled={isDeleting}
            className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 disabled:bg-red-300"
          >
            {isDeleting ? 'Deleting...' : 'Delete Report'}
          </button>
        )
        }
      </div>
    </aside>
  );
}