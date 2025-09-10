// src/components/LoginForm.tsx

"use client"; // This is VERY important. It marks this as a Client Component.

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Use 'next/navigation' for App Router

export default function LoginForm() {
  // Hook to control navigation
  const router = useRouter();

  // State to manage form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // State for handling feedback to the user
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // This function runs when the user submits the form
  const handleSubmit = async (event: React.FormEvent) => {
    // Prevent the default browser behavior of a full-page reload
    event.preventDefault();

    // Set loading state and clear previous errors
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      // If the response is OK (status 200-299), login was successful
      if (response.ok) {
        // Refresh the router to ensure the new cookie is sent to the server
        router.refresh();
        // Then, push to the reports page
        router.push('/reports');
      } else {
        // If there was an error, show a message to the user
        setError('Invalid email or password. Please try again.');
      }
    } catch (err) {
      // Handle network errors or other unexpected issues
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      // Always stop the loading indicator, whether it succeeded or failed
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Conditionally render the error message if it exists */}
      {error && (
        <div className="p-3 text-sm text-red-800 bg-red-100 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-1">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-900"
        >
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div className="space-y-1">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-900"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </div>
    </form>
  );
}