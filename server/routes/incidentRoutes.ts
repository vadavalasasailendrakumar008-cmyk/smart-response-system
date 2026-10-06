import { Router, Response } from 'express';
import { supabase, isSupabaseConfigured, mockDb, realtimeEmitter } from '../config/supabase.js';
import { AuthenticatedRequest, requireAuth } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { CreateIncidentSchema, UpdateStatusSchema, AnalyzeEmergencySchema } from '../../src/shared/schemas.js';
import { analyzeEmergencyReport } from '../services/aiTriage.js';
import { EmergencyIncident, StatusHistoryItem, NotificationItem, IncidentStatus } from '../../src/shared/types.js';

const router = Router();

// 1. POST /api/v1/incidents/analyze
router.post('/analyze', requireAuth, validateRequest(AnalyzeEmergencySchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const analysis = await analyzeEmergencyReport(req.body);
    return res.json(analysis);
  } catch (error: any) {
    console.error('Error analyzing emergency:', error);
    return res.status(500).json({
      error: 'Analysis Failed',
      message: error?.message || 'Unable to compute emergency triage at this moment.',
    });
  }
});

// 2. POST /api/v1/incidents
router.post('/', requireAuth, validateRequest(CreateIncidentSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const body = req.body;

    // If AI analysis was not pre-computed by client, run triage on server
    let priority = body.calculatedPriority || body.userSelectedSeverity || 'MEDIUM';
    let aiReasoning = body.aiPriorityReasoning || null;
    let aiGuidance = body.aiSuggestedGuidance || null;

    if (!aiReasoning || !aiGuidance) {
      try {
        const triage = await analyzeEmergencyReport({
          category: body.category,
          description: body.description,
          affectedPeopleCount: body.affectedPeopleCount,
          userSelectedSeverity: body.userSelectedSeverity,
          addressText: body.addressText,
          latitude: body.latitude,
          longitude: body.longitude,
        });
        priority = triage.calculatedPriority;
        aiReasoning = triage.priorityReasoning;
        aiGuidance = triage.safetyGuidance;
      } catch (e) {
        console.warn('Triage in incident creation fallback:', e);
      }
    }

    const incidentId = `inc-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
    const nowIso = new Date().toISOString();

    const newIncident: EmergencyIncident = {
      id: incidentId,
      reporter_id: user.id,
      category: body.category,
      title: body.title,
      description: body.description,
      priority,
      ai_priority_reasoning: aiReasoning,
      ai_suggested_guidance: aiGuidance,
      latitude: body.latitude,
      longitude: body.longitude,
      address_text: body.addressText,
      is_location_verified: body.isLocationVerified ?? false,
      affected_people_count: body.affectedPeopleCount ?? 1,
      status: 'Reported',
      assigned_responder_id: null,
      created_at: nowIso,
      reporter: user,
    };

    // Audit log
    const statusLog: StatusHistoryItem = {
      id: `sh-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
      incident_id: incidentId,
      status: 'Reported',
      changed_by_user_id: user.id,
      notes: 'Emergency incident created by citizen reporting interface.',
      created_at: nowIso,
      user,
    };

    // System notification
    const notification: NotificationItem = {
      id: `notif-${Date.now().toString(36)}`,
      incident_id: incidentId,
      recipient_id: user.id,
      title: `Emergency Reported: ${body.category}`,
      message: `Your emergency signal has been received. RescuOS Dispatch is triaging response units.`,
      is_read: false,
      created_at: nowIso,
    };

    // Persist in mockDb
    mockDb.emergency_incidents.unshift(newIncident);
    mockDb.status_history.unshift(statusLog);
    mockDb.notifications.unshift(notification);

    // If Supabase is connected, sync asynchronously
    if (isSupabaseConfigured && supabase) {
      Promise.resolve(
        supabase
          .from('emergency_incidents')
          .insert({
            id: incidentId,
            reporter_id: user.id,
            category: newIncident.category,
            title: newIncident.title,
            description: newIncident.description,
            priority: newIncident.priority,
            ai_priority_reasoning: newIncident.ai_priority_reasoning,
            ai_suggested_guidance: newIncident.ai_suggested_guidance,
            latitude: newIncident.latitude,
            longitude: newIncident.longitude,
            address_text: newIncident.address_text,
            is_location_verified: newIncident.is_location_verified,
            affected_people_count: newIncident.affected_people_count,
            status: newIncident.status,
            created_at: nowIso,
          })
      ).catch((err: any) => console.warn('Supabase remote incident insert failed:', err));
    }

    // Broadcast Realtime Event
    realtimeEmitter.emit('incident:created', newIncident);
    realtimeEmitter.emit('status:changed', statusLog);

    return res.status(201).json({
      incident: newIncident,
      statusHistory: [statusLog],
    });
  } catch (error: any) {
    console.error('Error creating incident:', error);
    return res.status(500).json({
      error: 'Failed to create emergency incident',
      message: error?.message || 'Server error',
    });
  }
});

// 3. GET /api/v1/incidents
router.get('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { status, priority, category, search, limit = 50, offset = 0 } = req.query;

  let list = [...mockDb.emergency_incidents];

  // Role-aware isolation: Citizens see only their own incidents
  if (user.role === 'CITIZEN') {
    list = list.filter((inc) => inc.reporter_id === user.id);
  }

  // Filter by status
  if (status && typeof status === 'string' && status !== 'ALL') {
    list = list.filter((inc) => inc.status.toLowerCase() === status.toLowerCase());
  }

  // Filter by priority
  if (priority && typeof priority === 'string' && priority !== 'ALL') {
    list = list.filter((inc) => inc.priority.toLowerCase() === priority.toLowerCase());
  }

  // Filter by category
  if (category && typeof category === 'string' && category !== 'ALL') {
    list = list.filter((inc) => inc.category.toLowerCase() === category.toLowerCase());
  }

  // Search filter
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    list = list.filter(
      (inc) =>
        inc.title.toLowerCase().includes(q) ||
        inc.description.toLowerCase().includes(q) ||
        inc.address_text.toLowerCase().includes(q)
    );
  }

  // Attach reporter & assigned responder details
  const populated = list.map((inc) => ({
    ...inc,
    reporter: mockDb.profiles.find((p) => p.id === inc.reporter_id) || inc.reporter,
    assigned_responder: inc.assigned_responder_id
      ? mockDb.responders.find((r) => r.id === inc.assigned_responder_id)
      : null,
  }));

  const start = Number(offset);
  const end = start + Number(limit);
  const paginated = populated.slice(start, end);

  return res.json({
    total: list.length,
    incidents: paginated,
  });
});

// 4. GET /api/v1/incidents/:id
router.get('/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { id } = req.params;

  const incident = mockDb.emergency_incidents.find((inc) => inc.id === id);
  if (!incident) {
    return res.status(404).json({ error: 'Not Found', message: 'Incident not found' });
  }

  // Check role authorization: Citizens can only see their own incidents
  if (user.role === 'CITIZEN' && incident.reporter_id !== user.id) {
    return res.status(403).json({ error: 'Forbidden', message: 'You are not authorized to view this incident.' });
  }

  const history = mockDb.status_history
    .filter((h) => h.incident_id === id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .map((h) => ({
      ...h,
      user: mockDb.profiles.find((p) => p.id === h.changed_by_user_id),
    }));

  const populated = {
    ...incident,
    reporter: mockDb.profiles.find((p) => p.id === incident.reporter_id) || incident.reporter,
    assigned_responder: incident.assigned_responder_id
      ? mockDb.responders.find((r) => r.id === incident.assigned_responder_id)
      : null,
    history,
  };

  return res.json({ incident: populated });
});

// 5. PATCH /api/v1/incidents/:id/status
router.patch('/:id/status', requireAuth, validateRequest(UpdateStatusSchema), async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const id = req.params.id as string;
  const { status, notes, assignedResponderId } = req.body as {
    status: IncidentStatus;
    notes?: string;
    assignedResponderId?: string;
  };

  const incidentIndex = mockDb.emergency_incidents.findIndex((inc) => inc.id === id);
  if (incidentIndex === -1) {
    return res.status(404).json({ error: 'Not Found', message: 'Incident not found' });
  }

  const incident = mockDb.emergency_incidents[incidentIndex];

  // Role permissions
  if (user.role === 'CITIZEN') {
    if (incident.reporter_id !== user.id) {
      return res.status(403).json({ error: 'Forbidden', message: 'Cannot modify someone else’s incident.' });
    }
    if (status !== 'Cancelled') {
      return res.status(403).json({ error: 'Forbidden', message: 'Citizens can only cancel their own reports.' });
    }
  }

  const nowIso = new Date().toISOString();
  incident.status = status;

  if (status === 'Under Review' && !incident.acknowledged_at) {
    incident.acknowledged_at = nowIso;
  }
  if (status === 'Resolved') {
    incident.resolved_at = nowIso;
  }
  if (assignedResponderId) {
    incident.assigned_responder_id = assignedResponderId;
  }

  // Create status history log
  const statusLog: StatusHistoryItem = {
    id: `sh-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
    incident_id: id,
    status,
    changed_by_user_id: user.id,
    notes: notes || `Status transitioned to "${status}" by ${user.full_name} (${user.role}).`,
    created_at: nowIso,
    user,
  };
  mockDb.status_history.unshift(statusLog);

  // Trigger notification for citizen reporter
  const notification: NotificationItem = {
    id: `notif-${Date.now().toString(36)}`,
    incident_id: id,
    recipient_id: incident.reporter_id,
    title: `Status Update: ${status}`,
    message: notes || `Incident "${incident.title}" has been updated to "${status}".`,
    is_read: false,
    created_at: nowIso,
  };
  mockDb.notifications.unshift(notification);

  // Broadcast realtime event
  realtimeEmitter.emit('incident:updated', { incident, statusLog, notification });
  realtimeEmitter.emit('status:changed', statusLog);

  return res.json({
    incident,
    statusHistory: statusLog,
    message: `Status updated to ${status}.`,
  });
});

// 6. POST /api/v1/incidents/mock-disaster (Demo Trigger)
router.post('/mock-disaster', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const disasterTypes = [
    {
      category: 'DISASTER' as const,
      title: 'Structural Collapse & Gas Leak Warning',
      description: 'Major tremor caused partial parking structure collapse. Strong odor of natural gas reported and multiple civilians trapped on mezzanine floor.',
      severity: 'CRITICAL' as const,
      lat: 37.7785,
      lng: -122.4178,
      address: '780 Howard St, Financial District, SF, CA',
      affected: 8,
    },
    {
      category: 'MEDICAL' as const,
      title: 'Mass Heat Exhaustion at Outdoor Marathon',
      description: 'Multiple runners collapsed with signs of severe hyperthermia and altered mental status. Medical tents overwhelmed, urgent paramedic backup requested.',
      severity: 'HIGH' as const,
      lat: 37.7699,
      lng: -122.4469,
      address: 'Golden Gate Park Panhandle, SF, CA',
      affected: 6,
    },
    {
      category: 'FIRE' as const,
      title: 'Industrial Warehouse Fire with Chemical Drums',
      description: 'Plumes of black smoke issuing from chemical packaging plant. Potential toxic runoff into local stormwater. Evacuation boundary expanding.',
      severity: 'CRITICAL' as const,
      lat: 37.7521,
      lng: -122.3892,
      address: 'Illinois St & 24th St, Dogpatch, SF, CA',
      affected: 12,
    }
  ];

  const pick = disasterTypes[Math.floor(Math.random() * disasterTypes.length)];

  // Run AI triage
  const triage = await analyzeEmergencyReport({
    category: pick.category,
    description: pick.description,
    affectedPeopleCount: pick.affected,
    userSelectedSeverity: pick.severity,
    addressText: pick.address,
    latitude: pick.lat,
    longitude: pick.lng,
  });

  const nowIso = new Date().toISOString();
  const mockIncident: EmergencyIncident = {
    id: `inc-mock-${Date.now().toString(36)}`,
    reporter_id: user.id,
    category: pick.category,
    title: pick.title,
    description: pick.description,
    priority: triage.calculatedPriority,
    ai_priority_reasoning: triage.priorityReasoning,
    ai_suggested_guidance: triage.safetyGuidance,
    latitude: pick.lat,
    longitude: pick.lng,
    address_text: pick.address,
    is_location_verified: true,
    affected_people_count: pick.affected,
    status: 'Reported',
    assigned_responder_id: null,
    created_at: nowIso,
    reporter: user,
  };

  const statusLog: StatusHistoryItem = {
    id: `sh-mock-${Date.now().toString(36)}`,
    incident_id: mockIncident.id,
    status: 'Reported',
    changed_by_user_id: user.id,
    notes: 'Triggered via RescuOS Demo Mock Incident Generator.',
    created_at: nowIso,
    user,
  };

  mockDb.emergency_incidents.unshift(mockIncident);
  mockDb.status_history.unshift(statusLog);

  realtimeEmitter.emit('incident:created', mockIncident);
  realtimeEmitter.emit('status:changed', statusLog);

  return res.status(201).json({
    incident: mockIncident,
    message: 'Mock disaster incident spawned successfully for live demonstration.',
  });
});

// 7. GET /api/v1/incidents/notifications/list
router.get('/notifications/list', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const notifs = mockDb.notifications.filter((n) => n.recipient_id === user.id);
  res.json({ notifications: notifs });
});

// 8. PATCH /api/v1/incidents/notifications/:id/read
router.patch('/notifications/:id/read', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const notif = mockDb.notifications.find((n) => n.id === id);
  if (notif) {
    notif.is_read = true;
  }
  res.json({ success: true });
});

export default router;
