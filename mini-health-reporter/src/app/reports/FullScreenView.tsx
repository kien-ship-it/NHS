// src/components/reports/FullScreenView.tsx
'use client';

import { FormEvent, useState } from 'react';
import { useReports, Report } from '@/app/reports/ReportsProvider';

/**
 * A sub-component dedicated to displaying a single report's details.
 * It's kept separate for clarity.
 */
function ReportDisplay({ report }: { report: Report | undefined }) {
  if (!report) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>Report not found or could not be loaded.</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">
        {report.patient_name}
      </h2>
      <div className="space-y-3">
        <div>
          <p className="text-sm font-semibold text-gray-500">Diagnosis</p>
          <p className="text-lg text-gray-700">{report.diagnosis}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-500">Status</p>
          <span
            className={`px-3 py-1 text-sm rounded-full font-medium ${
              report.status === 'PUSHED'
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {report.status}
          </span>
        </div>
        {report.status === 'PUSHED' && report.national_id && (
          <div>
            <p className="text-sm font-semibold text-gray-500">National ID</p>
            <p className="text-lg text-gray-700 font-mono">
              {report.national_id}
            </p>
          </div>
        )}
        <div>
          <p className="text-sm font-semibold text-gray-500">Created At</p>
          <p className="text-gray-700">
            {report.created_at ? new Date(report.created_at).toLocaleString() : 'Date unavailable'}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * A sub-component for the new report creation form.
 * It manages its own state for form inputs and submission status.
 */
function NewReportForm() {
  const { addNewReport, setViewMode } = useReports();
  const [patientName, setPatientName] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!patientName || !diagnosis) {
      setError('Both patient name and diagnosis are required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_name: patientName,
          diagnosis: diagnosis,
          created_at: new Date().toISOString(), // Add current date in ISO format
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create report. Please try again.');
      }

      const newReport: Report = await response.json();
      addNewReport(newReport); // Add to our client-side state
      setViewMode(null); // Close the modal on success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-4">
      <h2 className="text-2xl font-bold text-black border-b pb-2">
        Create New Report
      </h2>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      <div>
        <label
          htmlFor="patientName"
          className="block text-sm font-medium text-black"
        >
          Patient Name
        </label>
        <input
          type="text"
          id="patientName"
          value={patientName}
          onChange={(e) => setPatientName(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black"
          required
        />
      </div>
      <div>
        <label
          htmlFor="diagnosis"
          className="block text-sm font-medium text-black"
        >
          Diagnosis
        </label>
        <textarea
          id="diagnosis"
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
          rows={4}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black"
          required
        />
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
        >
          {isSubmitting ? 'Creating...' : 'Create Report'}
        </button>
      </div>
    </form>
  );
}

/**
 * The main component that renders a full-screen modal overlay.
 * It conditionally displays either the new report form or a report's details
 * based on the global 'viewMode' state.
 */
export default function FullScreenView() {
  const { viewMode, setViewMode, selectedReport } = useReports();

  // If we are not in a full-screen mode, render nothing.
  if (viewMode !== 'fullscreen' && viewMode !== 'new') {
    return null;
  }

  return (
    // The modal backdrop
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-30 flex justify-center items-center"
      onClick={() => setViewMode(null)} // Close modal on backdrop click
    >
      {/* The modal panel */}
      <div
        className="bg-white rounded-lg shadow-2xl w-11/12 max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the panel
      >
        <div className="flex justify-end p-2">
          <button
            onClick={() => setViewMode(null)}
            className="text-gray-500 hover:text-gray-800"
            aria-label="Close"
          >
            {/* Simple SVG for a close icon */}
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Conditionally render the content based on the view mode */}
        {viewMode === 'new' && <NewReportForm />}
        {viewMode === 'fullscreen' && <ReportDisplay report={selectedReport} />}
      </div>
    </div>
  );
}