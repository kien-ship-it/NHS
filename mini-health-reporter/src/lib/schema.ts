// src/lib/schema.ts

import { z } from 'zod';

// This schema defines the rules for a valid login request.
// It ensures that we receive both an email and a password,
// and that they meet some basic format requirements.
export const loginUserSchema = z.object({
  // .email() checks if the string is in a valid email format.
  email: z.string()
    .min(1, { message: 'Email is required' })
    .email({ message: 'Invalid email address' }),

  // .min(8) ensures the password is at least 8 characters long.
  // This is a common security practice.
  password: z.string()
    .min(1, { message: 'Password is required' })
    .min(8, { message: 'Password must be at least 8 characters long' }),
});

export const createReportSchema = z.object({
  patient_name: z.string()
    .min(1, { message: 'Patient name is required' })
    .min(2, { message: 'Patient name must be at least 2 characters long' }),
  diagnosis: z.string()
    .min(1, { message: 'Diagnosis is required' })
    .min(2, { message: 'Diagnosis must be at least 2 characters long' }),
});

// We can infer the TypeScript type directly from our Zod schema.
// This is a powerful feature that ensures our frontend and backend
// types always stay in sync. If we change the schema, the type updates
// automatically.
export type LoginUserDto = z.infer<typeof loginUserSchema>;
export type CreateReportDto = z.infer<typeof createReportSchema>;