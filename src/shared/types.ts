export type UserRole = 'CITIZEN' | 'RESPONDER' | 'ADMIN';

export type EmergencyCategory =
  | 'MEDICAL'
  | 'ACCIDENT'
  | 'FIRE'
  | 'CRIME'
  | 'DISASTER'
  | 'MISSING'
  | 'OTHER';

export type PriorityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type IncidentStatus =
  | 'Reported'
  | 'Under Review'
  | 'Responder Assigned'
  | 'Responder En Route'
  | 'Assistance Arrived'
  | 'Resolved'
  | 'Cancelled';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: UserRole;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface Responder {
  id: string;
  user_id: string;
  department: string;
  badge_number: string;
  is_available: boolean;
  current_latitude?: number | null;
  current_longitude?: number | null;
  created_at?: string;
  profile?: UserProfile;
}

export interface SafetyGuidanceItem {
  stepNumber: number;
  title: string;
  instruction: string;
  warningTag?: string;
}

export interface EmergencyIncident {
  id: string;
  reporter_id: string;
  category: EmergencyCategory;
  title: string;
  description: string;
  priority: PriorityLevel;
  ai_priority_reasoning?: string | null;
  ai_suggested_guidance?: SafetyGuidanceItem[] | null;
  latitude: number;
  longitude: number;
  address_text: string;
  is_location_verified: boolean;
  affected_people_count: number;
  status: IncidentStatus;
  assigned_responder_id?: string | null;
  created_at: string;
  acknowledged_at?: string | null;
  resolved_at?: string | null;
  reporter?: UserProfile;
  assigned_responder?: Responder;
}

export interface StatusHistoryItem {
  id: string;
  incident_id: string;
  status: IncidentStatus;
  changed_by_user_id: string;
  notes?: string | null;
  created_at: string;
  user?: UserProfile;
}

export interface NotificationItem {
  id: string;
  incident_id: string;
  recipient_id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface AIAnalysisResult {
  calculatedPriority: PriorityLevel;
  priorityReasoning: string;
  safetyGuidance: SafetyGuidanceItem[];
  responderBriefing: string;
  isPotentialDuplicate: boolean;
}

export interface AnalyticsOverview {
  totalIncidents: number;
  activeIncidents: number;
  resolvedIncidents: number;
  criticalIncidents: number;
  averageResponseTimeMinutes: number;
  categoryDistribution: Record<EmergencyCategory, number>;
  priorityDistribution: Record<PriorityLevel, number>;
  statusDistribution: Record<IncidentStatus, number>;
}
