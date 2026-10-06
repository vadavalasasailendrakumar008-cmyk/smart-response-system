import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { incidentApi } from '../services/api';
import { subscribeToEmergencyRealtime } from '../services/realtime';
import { EmergencyIncident } from '../shared/types';
import { IncidentTimeline } from '../components/emergency/IncidentTimeline';
import { GuidanceCard } from '../components/emergency/GuidanceCard';
import { EmergencyButton } from '../components/emergency/EmergencyButton';
import {
  Activity,
  AlertTriangle,
  Clock,
  MapPin,
  Siren,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  Plus,
} from 'lucide-react';

export const CitizenDashboard: React.FC = () => {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<EmergencyIncident[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeIncidentId, setActiveIncidentId] = useState<string | null>(null);

  const fetchIncidents = async () => {
    try {
      const data = await incidentApi.list();
      setIncidents(data.incidents);

      // Select latest active incident if available
      const active = data.incidents.find(
        (i) => i.status !== 'Resolved' && i.status !== 'Cancelled'
      );
      if (active) {
        setActiveIncidentId(active.id);
      } else if (data.incidents.length > 0) {
        setActiveIncidentId(data.incidents[0].id);
      }
    } catch (e) {
      console.warn('Error fetching citizen incidents:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();

    // Subscribe to live WebSocket / SSE realtime changes
    const unsubscribe = subscribeToEmergencyRealtime({
      onIncidentCreated: (newInc) => {
        if (newInc.reporter_id === user?.id) {
          setIncidents((prev) => [newInc, ...prev]);
          setActiveIncidentId(newInc.id);
        }
      },
      onIncidentUpdated: ({ incident: updated }) => {
        setIncidents((prev) =>
          prev.map((i) => (i.id === updated.id ? { ...i, ...updated } : i))
        );
      },
      onStatusChanged: (statusLog) => {
        // Refetch full incident details if needed
        fetchIncidents();
      },
    });

    return () => unsubscribe();
  }, [user]);

  const activeIncident = incidents.find((i) => i.id === activeIncidentId) || incidents[0] || null;

  const handleCancelIncident = async (id: string) => {
    if (!confirm('Are you certain you wish to stand down and cancel this emergency report?')) return;
    try {
      await incidentApi.updateStatus(id, {
        status: 'Cancelled',
        notes: 'Emergency signal cancelled by reporting citizen.',
      });
      fetchIncidents();
    } catch (e: any) {
      alert('Failed to cancel incident: ' + (e?.response?.data?.message || e.message));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome & Panic Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-1 text-center md:text-left z-10">
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Citizen Safety Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Welcome back, {user?.full_name?.split(' ')[0] || 'Citizen'}
          </h1>
          <p className="text-xs text-slate-400 max-w-lg leading-relaxed">
            Telemetry is actively connected to the city emergency response network. In immediate danger, tap the panic beacon below.
          </p>
        </div>

        {/* SOS Button mini launcher */}
        <div className="flex items-center space-x-4 z-10">
          <Link
            to="/report"
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-black uppercase tracking-wider flex items-center space-x-2 shadow-xl shadow-red-600/30 transition-all hover:scale-105"
          >
            <Siren className="w-4 h-4 animate-spin" />
            <span>Report New Emergency</span>
          </Link>
        </div>
      </div>

      {/* Main Grid: Active Incident Tracker & Guidance */}
      {isLoading ? (
        <div className="glass-panel p-12 rounded-3xl text-center text-slate-400 text-sm">
          Connecting to Supabase Realtime dispatch grid...
        </div>
      ) : activeIncident ? (
        <div className="space-y-6">
          {/* Active Incident Banner Card */}
          <div className="glass-panel-elevated p-6 rounded-3xl border border-red-500/20 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-black uppercase tracking-wider">
                    {activeIncident.category}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Incident #{activeIncident.id.slice(-6)}
                  </span>
                </div>
                <h2 className="text-xl font-black text-white">{activeIncident.title}</h2>
                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span>{activeIncident.address_text}</span>
                </div>
              </div>

              {/* Priority & Assigned Unit */}
              <div className="text-left sm:text-right space-y-1">
                <div className="text-xs text-slate-400">Priority Level</div>
                <span
                  className={`inline-block px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider border ${
                    activeIncident.priority === 'CRITICAL'
                      ? 'bg-red-500/20 text-red-400 border-red-500 animate-pulse'
                      : activeIncident.priority === 'HIGH'
                      ? 'bg-orange-500/20 text-orange-400 border-orange-500'
                      : 'bg-amber-500/20 text-amber-400 border-amber-500'
                  }`}
                >
                  {activeIncident.priority}
                </span>

                {activeIncident.assigned_responder && (
                  <p className="text-[11px] text-blue-400 font-semibold mt-1">
                    Assigned: {activeIncident.assigned_responder.department} ({activeIncident.assigned_responder.badge_number})
                  </p>
                )}
              </div>
            </div>

            {/* Live Visual Timeline */}
            <IncidentTimeline
              currentStatus={activeIncident.status}
              canCancel={activeIncident.reporter_id === user?.id}
              onCancelReport={() => handleCancelIncident(activeIncident.id)}
            />

            {/* AI Survival Guidance */}
            {activeIncident.ai_suggested_guidance && activeIncident.ai_suggested_guidance.length > 0 && (
              <GuidanceCard
                guidance={activeIncident.ai_suggested_guidance}
                priorityReasoning={activeIncident.ai_priority_reasoning}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="glass-panel p-12 rounded-3xl text-center space-y-4 border border-slate-800">
          <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Active Emergency Reports</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            You do not have any active emergency dispatches under review. All systems normal.
          </p>
          <Link
            to="/report"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
          >
            <span>Submit Emergency Report</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Historical Report Logs Table */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-white">
              My Incident History & Audit Logs
            </h3>
          </div>
          <button
            onClick={fetchIncidents}
            className="text-xs text-slate-400 hover:text-white flex items-center space-x-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {incidents.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">No previous incidents recorded.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">Date / Time</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Incident Title</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {incidents.map((inc) => (
                  <tr
                    key={inc.id}
                    onClick={() => setActiveIncidentId(inc.id)}
                    className={`hover:bg-slate-800/40 cursor-pointer transition-colors ${
                      inc.id === activeIncidentId ? 'bg-slate-800/30' : ''
                    }`}
                  >
                    <td className="py-3 px-3 font-mono text-slate-400">
                      {new Date(inc.created_at).toLocaleDateString()} {new Date(inc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-200">{inc.category}</span>
                    </td>
                    <td className="py-3 px-3 font-medium text-white max-w-xs truncate">
                      {inc.title}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                          inc.priority === 'CRITICAL'
                            ? 'text-red-400 bg-red-500/10'
                            : inc.priority === 'HIGH'
                            ? 'text-orange-400 bg-orange-500/10'
                            : 'text-amber-400 bg-amber-500/10'
                        }`}
                      >
                        {inc.priority}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-slate-300 font-semibold">{inc.status}</span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        to={`/incidents/${inc.id}`}
                        className="text-red-400 hover:text-red-300 font-bold"
                      >
                        Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
