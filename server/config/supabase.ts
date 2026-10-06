import './loadEnv.js';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { EventEmitter } from 'events';
import { EmergencyIncident, UserProfile, Responder, StatusHistoryItem, NotificationItem } from '../../src/shared/types.js';

export const realtimeEmitter = new EventEmitter();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('your-supabase-project-id') &&
  supabaseServiceKey &&
  supabaseServiceKey !== 'your_supabase_service_role_secret_key'
);

export let supabase: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  try {
    supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    console.log('✅ Supabase connected to remote instance:', supabaseUrl);
  } catch (err) {
    console.warn('⚠️ Failed to initialize remote Supabase client, falling back to In-Memory Engine:', err);
    supabase = null;
  }
} else {
  console.log('ℹ️ Supabase credentials not provided or placeholder. RescuOS running in High-Fidelity Local Database Engine mode.');
}

// =========================================================================
// High-Fidelity Local / In-Memory Mock Database Engine
// Supports 100% full relational CRUD, RLS role isolation, and real-time events.
// =========================================================================

export interface MockDatabase {
  profiles: UserProfile[];
  responders: Responder[];
  emergency_incidents: EmergencyIncident[];
  status_history: StatusHistoryItem[];
  notifications: NotificationItem[];
}

const DEMO_CITIZEN_ID = '11111111-1111-4111-a111-111111111111';
const DEMO_RESPONDER_ID = '22222222-2222-4222-a222-222222222222';
const DEMO_ADMIN_ID = '33333333-3333-4333-a333-333333333333';
const DEMO_RESPONDER_PROFILE_ID = '44444444-4444-4444-a444-444444444444';

const initialProfiles: UserProfile[] = [
  {
    id: DEMO_CITIZEN_ID,
    full_name: 'Alex Rivera (Citizen)',
    email: 'citizen@rescuos.demo',
    phone: '+1 (555) 234-5678',
    role: 'CITIZEN',
    emergency_contact_name: 'Elena Rivera (Spouse)',
    emergency_contact_phone: '+1 (555) 876-5432',
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: DEMO_RESPONDER_ID,
    full_name: 'Lt. Marcus Vance (Medic Lead)',
    email: 'responder@rescuos.demo',
    phone: '+1 (555) 911-0402',
    role: 'RESPONDER',
    emergency_contact_name: 'Dispatch Central',
    emergency_contact_phone: '+1 (555) 911-0000',
    created_at: new Date(Date.now() - 86400000 * 60).toISOString(),
  },
  {
    id: DEMO_ADMIN_ID,
    full_name: 'Commander Sarah Lin (Chief Director)',
    email: 'admin@rescuos.demo',
    phone: '+1 (555) 911-0100',
    role: 'ADMIN',
    emergency_contact_name: 'City Council Security',
    emergency_contact_phone: '+1 (555) 911-0001',
    created_at: new Date(Date.now() - 86400000 * 90).toISOString(),
  },
];

const initialResponders: Responder[] = [
  {
    id: DEMO_RESPONDER_PROFILE_ID,
    user_id: DEMO_RESPONDER_ID,
    department: 'Emergency Medical Services (EMS Unit 4)',
    badge_number: 'EMS-402',
    is_available: true,
    current_latitude: 37.7749,
    current_longitude: -122.4194,
    created_at: new Date().toISOString(),
    profile: initialProfiles[1],
  },
  {
    id: '55555555-5555-4555-a555-555555555555',
    user_id: '66666666-6666-4666-a666-666666666666',
    department: 'Metropolitan Fire & Rescue',
    badge_number: 'FR-108',
    is_available: true,
    current_latitude: 37.7833,
    current_longitude: -122.4167,
    created_at: new Date().toISOString(),
    profile: {
      id: '66666666-6666-4666-a666-666666666666',
      full_name: 'Capt. David Chen',
      email: 'david.chen@fire.rescuos.demo',
      phone: '+1 (555) 911-0108',
      role: 'RESPONDER',
      created_at: new Date().toISOString(),
    },
  },
];

const initialIncidents: EmergencyIncident[] = [
  {
    id: 'a1b2c3d4-e5f6-47a8-b9c0-111111111101',
    reporter_id: DEMO_CITIZEN_ID,
    category: 'MEDICAL',
    title: 'Elderly individual collapsed, sudden cardiac arrest signs',
    description: 'Patient is unresponsive on the sidewalk near 4th and Market. Breathing is faint and irregular. Immediate AED and paramedic dispatch urgently needed.',
    priority: 'CRITICAL',
    ai_priority_reasoning: 'Critical life threat: unconscious victim with respiratory distress indicating suspected cardiac arrest. Zero survival margin without instant CPR and AED intervention.',
    ai_suggested_guidance: [
      {
        stepNumber: 1,
        title: 'Check Responsiveness & Breathing',
        instruction: 'Tap collarbone and shout loudly. Look for normal chest rise for no more than 10 seconds.',
        warningTag: 'DO NOT DELAY'
      },
      {
        stepNumber: 2,
        title: 'Initiate Chest Compressions (Hands-Only CPR)',
        instruction: 'Place heel of hand on center of chest. Push hard and fast at 100-120 BPM to the rhythm of Stayin Alive (2 inches deep).',
        warningTag: 'CRITICAL ACTION'
      },
      {
        stepNumber: 3,
        title: 'Retrieve Nearest Automated External Defibrillator (AED)',
        instruction: 'Direct a bystander to bring the public AED located inside nearby commercial buildings.',
      },
    ],
    latitude: 37.7858,
    longitude: -122.4065,
    address_text: 'Market St & 4th St, Downtown, San Francisco, CA',
    is_location_verified: true,
    affected_people_count: 1,
    status: 'Responder En Route',
    assigned_responder_id: DEMO_RESPONDER_PROFILE_ID,
    created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(), // 12 min ago
    acknowledged_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    reporter: initialProfiles[0],
    assigned_responder: initialResponders[0],
  },
  {
    id: 'a1b2c3d4-e5f6-47a8-b9c0-111111111102',
    reporter_id: DEMO_CITIZEN_ID,
    category: 'ACCIDENT',
    title: 'Multi-vehicle collision on highway ramp, fluid leaking',
    description: 'Two passenger vehicles collided at high speed on the off-ramp. Airbags deployed, drivers are stunned, smoke visible from engine compartment.',
    priority: 'HIGH',
    ai_priority_reasoning: 'High kinetic impact with deployed airbags and smoke/fuel leak hazard. Potential for fire eruption and spinal trauma.',
    ai_suggested_guidance: [
      {
        stepNumber: 1,
        title: 'Keep Safe Distance From Leaking Fluids',
        instruction: 'Move spectators at least 50 feet away to avoid flash fire hazards from hot engine components.',
        warningTag: 'FIRE HAZARD'
      },
      {
        stepNumber: 2,
        title: 'Do Not Move Trapped Victims Unnecessarily',
        instruction: 'Unless there is immediate fire danger, keep injured persons still to avoid exacerbating spinal injuries.',
      },
      {
        stepNumber: 3,
        title: 'Turn Off Vehicle Ignitions If Safely Accessible',
        instruction: 'Switch off ignitions to eliminate electrical spark sources near leaked fuel.',
      }
    ],
    latitude: 37.7712,
    longitude: -122.4201,
    address_text: 'Highway 101 Off-Ramp near Mission District, SF, CA',
    is_location_verified: true,
    affected_people_count: 3,
    status: 'Reported',
    created_at: new Date(Date.now() - 1000 * 60 * 4).toISOString(), // 4 min ago
    reporter: initialProfiles[0],
  },
  {
    id: 'a1b2c3d4-e5f6-47a8-b9c0-111111111103',
    reporter_id: '77777777-7777-4777-a777-777777777777',
    category: 'FIRE',
    title: 'Commercial kitchen grease fire spreading to ventilation duct',
    description: 'Deep fryer ignition inside diner kitchen. Fire suppression failed to completely douse duct flames. Staff evacuated, smoke entering upper residential units.',
    priority: 'CRITICAL',
    ai_priority_reasoning: 'Structural fire with grease acceleration into vertical ventilation shafts risking rapid multi-story building spread and toxic smoke inhalation for residents.',
    ai_suggested_guidance: [
      {
        stepNumber: 1,
        title: 'Immediate Total Evacuation',
        instruction: 'Do not attempt to extinguish duct fires with water. Evacuate all occupants and pull manual fire alarm.',
        warningTag: 'NO WATER ON GREASE'
      },
      {
        stepNumber: 2,
        title: 'Close Fire Doors Behind You',
        instruction: 'Close doors to compartmentalize smoke and oxygen starvation of flames.',
      },
      {
        stepNumber: 3,
        title: 'Designate Exterior Rally Point',
        instruction: 'Assemble across the street out of path of emergency vehicles and potential window blowouts.',
      }
    ],
    latitude: 37.7651,
    longitude: -122.4243,
    address_text: 'Valencia St & 18th St, Mission District, SF, CA',
    is_location_verified: true,
    affected_people_count: 15,
    status: 'Under Review',
    created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    acknowledged_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    reporter: {
      id: '77777777-7777-4777-a777-777777777777',
      full_name: 'Diner Night Manager (Carlos)',
      email: 'carlos@valenciadiner.demo',
      phone: '+1 (555) 432-1098',
      role: 'CITIZEN',
      created_at: new Date().toISOString(),
    },
  },
  {
    id: 'a1b2c3d4-e5f6-47a8-b9c0-111111111104',
    reporter_id: DEMO_CITIZEN_ID,
    category: 'OTHER',
    title: 'Downed power line sparking on residential sidewalk',
    description: 'Heavy wind branch brought down power line. Live cable is sparking on pavement. No injuries currently, but pedestrians are approaching.',
    priority: 'MEDIUM',
    ai_priority_reasoning: 'Severe electrical electrocution hazard, currently uncontained in public right-of-way, but no active casualties reported.',
    ai_suggested_guidance: [
      {
        stepNumber: 1,
        title: 'Establish 35+ Foot Perimeter',
        instruction: 'Stay at least 35 feet away. High voltage can electrify ground wetness in concentric circles.',
        warningTag: 'SHOCK HAZARD'
      },
      {
        stepNumber: 2,
        title: 'Warn Approaching Pedestrians',
        instruction: 'Wave off cyclists and joggers from safe vantage point.',
      }
    ],
    latitude: 37.7583,
    longitude: -122.4144,
    address_text: 'Potrero Hill, 22nd St, San Francisco, CA',
    is_location_verified: true,
    affected_people_count: 0,
    status: 'Resolved',
    created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    acknowledged_at: new Date(Date.now() - 1000 * 60 * 170).toISOString(),
    resolved_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    reporter: initialProfiles[0],
  }
];

const initialStatusHistory: StatusHistoryItem[] = [
  {
    id: 's1-1',
    incident_id: initialIncidents[0].id,
    status: 'Reported',
    changed_by_user_id: DEMO_CITIZEN_ID,
    notes: 'Citizen triggered emergency SOS with automated GPS coordinates.',
    created_at: initialIncidents[0].created_at,
  },
  {
    id: 's1-2',
    incident_id: initialIncidents[0].id,
    status: 'Under Review',
    changed_by_user_id: DEMO_RESPONDER_ID,
    notes: 'Dispatcher triage confirmed critical cardiac criteria. AI priority verified.',
    created_at: new Date(Date.now() - 1000 * 60 * 11).toISOString(),
  },
  {
    id: 's1-3',
    incident_id: initialIncidents[0].id,
    status: 'Responder En Route',
    changed_by_user_id: DEMO_RESPONDER_ID,
    notes: 'EMS Unit 4 dispatched with sirens active. ETA 3 minutes.',
    created_at: new Date(Date.now() - 1000 * 60 * 9).toISOString(),
  },
  {
    id: 's2-1',
    incident_id: initialIncidents[1].id,
    status: 'Reported',
    changed_by_user_id: DEMO_CITIZEN_ID,
    notes: 'Citizen submitted high severity crash report with smoke indicator.',
    created_at: initialIncidents[1].created_at,
  },
  {
    id: 's3-1',
    incident_id: initialIncidents[2].id,
    status: 'Reported',
    changed_by_user_id: '77777777-7777-4777-a777-777777777777',
    notes: 'Kitchen staff reported commercial grease ventilation fire.',
    created_at: initialIncidents[2].created_at,
  },
  {
    id: 's3-2',
    incident_id: initialIncidents[2].id,
    status: 'Under Review',
    changed_by_user_id: DEMO_RESPONDER_ID,
    notes: 'Fire Engine 108 notified, dual-alarm dispatch initiated.',
    created_at: initialIncidents[2].acknowledged_at!,
  },
];

const initialNotifications: NotificationItem[] = [
  {
    id: 'n1',
    incident_id: initialIncidents[0].id,
    recipient_id: DEMO_CITIZEN_ID,
    title: 'Responder En Route',
    message: 'EMS Unit 4 (Badge EMS-402) has acknowledged your emergency and is en route. Please follow safety guidance.',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 9).toISOString(),
  },
  {
    id: 'n2',
    incident_id: initialIncidents[1].id,
    recipient_id: DEMO_CITIZEN_ID,
    title: 'Emergency Received',
    message: 'Your report #102 has been received by RescuOS Dispatch. Stay in a safe position.',
    is_read: true,
    created_at: initialIncidents[1].created_at,
  }
];

export const mockDb: MockDatabase = {
  profiles: [...initialProfiles],
  responders: [...initialResponders],
  emergency_incidents: [...initialIncidents],
  status_history: [...initialStatusHistory],
  notifications: [...initialNotifications],
};
