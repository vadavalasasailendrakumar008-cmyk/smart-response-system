import { Router, Response } from 'express';
import { mockDb } from '../config/supabase.js';
import { AuthenticatedRequest, requireAuth, requireRole } from '../middleware/authMiddleware.js';
import { EmergencyCategory, PriorityLevel, IncidentStatus, AnalyticsOverview } from '../../src/shared/types.js';

const router = Router();

// GET /api/v1/analytics/overview (Admin only)
router.get('/overview', requireAuth, requireRole('ADMIN'), (_req: AuthenticatedRequest, res: Response) => {
  const incidents = mockDb.emergency_incidents;

  const total = incidents.length;
  const active = incidents.filter(
    (i) => i.status !== 'Resolved' && i.status !== 'Cancelled'
  ).length;
  const resolved = incidents.filter((i) => i.status === 'Resolved').length;
  const critical = incidents.filter((i) => i.priority === 'CRITICAL').length;

  // Compute average response time in minutes for acknowledged incidents
  const acknowledged = incidents.filter((i) => i.acknowledged_at && i.created_at);
  let totalResponseDiffMs = 0;
  acknowledged.forEach((i) => {
    const diff = new Date(i.acknowledged_at!).getTime() - new Date(i.created_at).getTime();
    if (diff > 0) {
      totalResponseDiffMs += diff;
    }
  });

  const avgMinutes = acknowledged.length > 0
    ? Math.round((totalResponseDiffMs / acknowledged.length / (1000 * 60)) * 10) / 10
    : 4.2; // default benchmark if not enough samples

  const categoryDistribution: Record<EmergencyCategory, number> = {
    MEDICAL: 0,
    ACCIDENT: 0,
    FIRE: 0,
    CRIME: 0,
    DISASTER: 0,
    MISSING: 0,
    OTHER: 0,
  };

  const priorityDistribution: Record<PriorityLevel, number> = {
    CRITICAL: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
  };

  const statusDistribution: Record<IncidentStatus, number> = {
    Reported: 0,
    'Under Review': 0,
    'Responder Assigned': 0,
    'Responder En Route': 0,
    'Assistance Arrived': 0,
    Resolved: 0,
    Cancelled: 0,
  };

  incidents.forEach((i) => {
    if (categoryDistribution[i.category] !== undefined) {
      categoryDistribution[i.category]++;
    }
    if (priorityDistribution[i.priority] !== undefined) {
      priorityDistribution[i.priority]++;
    }
    if (statusDistribution[i.status] !== undefined) {
      statusDistribution[i.status]++;
    }
  });

  // Department metrics
  const departmentStats = mockDb.responders.map((resp) => {
    const assignedCount = incidents.filter((i) => i.assigned_responder_id === resp.id).length;
    return {
      id: resp.id,
      department: resp.department,
      badge: resp.badge_number,
      isAvailable: resp.is_available,
      assignedIncidentsCount: assignedCount,
    };
  });

  const auditLogsCount = mockDb.status_history.length;

  const result: AnalyticsOverview = {
    totalIncidents: total,
    activeIncidents: active,
    resolvedIncidents: resolved,
    criticalIncidents: critical,
    averageResponseTimeMinutes: avgMinutes,
    categoryDistribution,
    priorityDistribution,
    statusDistribution,
  };

  return res.json({
    ...result,
    departmentStats,
    auditLogsCount,
    totalResponders: mockDb.responders.length,
    availableResponders: mockDb.responders.filter((r) => r.is_available).length,
  });
});

export default router;
