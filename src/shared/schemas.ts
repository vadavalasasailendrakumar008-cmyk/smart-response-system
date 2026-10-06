import { z } from 'zod';

export const CreateIncidentSchema = z.object({
  category: z.enum(['MEDICAL', 'ACCIDENT', 'FIRE', 'CRIME', 'DISASTER', 'MISSING', 'OTHER']),
  title: z.string().min(5, "Title must be at least 5 characters long").max(100),
  description: z.string().min(10, "Please provide at least 10 characters describing the situation"),
  userSelectedSeverity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
  affectedPeopleCount: z.number().int().min(1).default(1),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  addressText: z.string().min(3, "Location description or address is required"),
  isLocationVerified: z.boolean().default(false),
  aiPriorityReasoning: z.string().optional(),
  aiSuggestedGuidance: z.array(z.any()).optional(),
  calculatedPriority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional(),
});

export const UpdateStatusSchema = z.object({
  status: z.enum([
    'Reported',
    'Under Review',
    'Responder Assigned',
    'Responder En Route',
    'Assistance Arrived',
    'Resolved',
    'Cancelled'
  ]),
  notes: z.string().optional(),
  assignedResponderId: z.string().uuid().optional(),
});

export const UserRegisterSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().min(8, "Valid contact phone number required"),
  emergencyContactName: z.string().min(2, "Emergency contact name required"),
  emergencyContactPhone: z.string().min(8, "Emergency contact phone required"),
  role: z.enum(['CITIZEN', 'RESPONDER', 'ADMIN']).optional().default('CITIZEN'),
  department: z.string().optional(),
  badgeNumber: z.string().optional(),
});

export const AnalyzeEmergencySchema = z.object({
  category: z.enum(['MEDICAL', 'ACCIDENT', 'FIRE', 'CRIME', 'DISASTER', 'MISSING', 'OTHER']),
  description: z.string().min(5, "Description must be at least 5 characters"),
  affectedPeopleCount: z.number().int().min(1).default(1),
  userSelectedSeverity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  addressText: z.string().optional().default("Current reported location"),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
