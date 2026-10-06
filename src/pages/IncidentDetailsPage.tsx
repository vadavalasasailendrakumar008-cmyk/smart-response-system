import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { incidentApi } from '../services/api';
import { subscribeToEmergencyRealtime } from '../services/realtime';
import { useAuth } from '../context/AuthContext';
import { EmergencyIncident } from '../shared/types';
import { IncidentTimeline } from '../components/emergency/IncidentTimeline';
import { GuidanceCard } from '../components/emergency/GuidanceCard';
import { ResponderActionModal } from '../components/dashboard/ResponderActionModal';
import { LocationPickerMap } from '../components/emergency/LocationPickerMap';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Radio,
  Users,
  ShieldAlert,
  Edit,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';

export const IncidentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [incident, setIncident] = useState<EmergencyIncident | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const fetchIncident = async () => {
    if (!id) return;
    try {
      const data = await incidentApi.getById(id);
      setIncident(data.incident);
    } catch (e: any) {
      setErrorMsg(e?.response?.data?.message || 'Incident not found or unauthorized.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncident();

    // Subscribe to realtime updates for this incident
    const unsubscribe = subscribeToEmergencyRealtime({
      onIncidentUpdated: ({ incident: updated }) => {
        if (updated.id === id) {
          setIncident((prev) => (prev ? { ...prev, ...updated } : updated));
        }
      },
      onStatusChanged: (statusLog) => {
        if (statusLog.incident_id === id) {
          fetchIncident();
        }
      },
    });

    return () => unsubscribe();
  }, [id]);

  const handleCancelReport = async () => {
    if (!incident || !confirm('Are you sure you want to cancel this emergency incident?')) return;
    try {
      const res = await incidentApi.updateStatus(incident.id, {
        status: 'Cancelled',
        notes: 'Emergency signal cancelled by citizen.',
      });
      setIncident(res.incident);
    } catch (e: any) {
      alert('Failed to cancel: ' + (e?.response?.data?.message || e.message));
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-slate-400">
        Loading emergency dispatch record telemetry...
      </div>
    );
  }

  if (errorMsg || !incident) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-white">Record Unavailable</h2>
        <p className="text-xs text-slate-400">{errorMsg || 'Unable to access incident.'}</p>
        <Link
          to="/"
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800 text-xs text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
      </div>
    );
  }

  const isResponderOrAdmin = user?.role === 'RESPONDER' || user?.role === 'ADMIN';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top back bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Feed</span>
        </button>

        <div className="flex items-center space-x-2">
          {isResponderOrAdmin && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-blue-600/30 transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Update Dispatch Status</span>
            </button>
          )}

          <button
            onClick={fetchIncident}
            title="Refresh record"
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Incident Overview Header */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-black uppercase tracking-wider">
                {incident.category}
              </span>
              <span className="text-xs font-mono text-slate-400">
                Case #{incident.id.slice(-8)}
              </span>
            </div>
            <h1 className="text-2xl font-black text-white">{incident.title}</h1>
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-red-400" />
              <span>{incident.address_text}</span>
            </div>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <span
              className={`inline-block px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider border ${
                incident.priority === 'CRITICAL'
                  ? 'bg-red-500/20 text-red-400 border-red-500 animate-pulse'
                  : incident.priority === 'HIGH'
                  ? 'bg-orange-500/20 text-orange-400 border-orange-500'
                  : 'bg-amber-500/20 text-amber-400 border-amber-500'
              }`}
            >
              {incident.priority} URGENCY
            </span>
            <div className="text-[11px] font-mono text-slate-400">
              Logged {new Date(incident.created_at).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80">
          <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Witness Statement / Situation Telemetry:
          </span>
          <p>{incident.description}</p>
        </div>

        {/* Key Telemetry Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-500 block text-[10px] uppercase">Affected Victims</span>
            <span className="font-bold text-white">{incident.affected_people_count} Person(s)</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-500 block text-[10px] uppercase">GPS Reliability</span>
            <span className="font-bold text-emerald-400">
              {incident.is_location_verified ? 'Hardware GPS' : 'Manual Placement'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-500 block text-[10px] uppercase">Assigned Unit</span>
            <span className="font-bold text-blue-400 truncate block">
              {incident.assigned_responder?.badge_number || 'Dispatch Staged'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-500 block text-[10px] uppercase">Reporter</span>
            <span className="font-bold text-slate-200 truncate block">
              {incident.reporter?.full_name || 'Citizen'}
            </span>
          </div>
        </div>
      </div>

      {/* Live Lifecycle Stepper & Audit Log */}
      <IncidentTimeline
        currentStatus={incident.status}
        history={(incident as any).history || []}
        canCancel={user?.id === incident.reporter_id}
        onCancelReport={handleCancelReport}
      />

      {/* Map Coordinate Pin Visualizer */}
      <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-bold text-white uppercase tracking-wider">
            Incident GPS Pin Location
          </span>
          <span className="font-mono text-[11px]">
            LAT {incident.latitude.toFixed(5)}, LNG {incident.longitude.toFixed(5)}
          </span>
        </div>

        <LocationPickerMap
          latitude={incident.latitude}
          longitude={incident.longitude}
          addressText={incident.address_text}
          isLocationVerified={incident.is_location_verified}
          onLocationChange={() => {}}
          height="280px"
          interactive={false}
        />
      </div>

      {/* AI Survival Guidance */}
      {incident.ai_suggested_guidance && incident.ai_suggested_guidance.length > 0 && (
        <GuidanceCard
          guidance={incident.ai_suggested_guidance}
          priorityReasoning={incident.ai_priority_reasoning}
        />
      )}

      {/* Responder Action Modal */}
      <ResponderActionModal
        isOpen={isModalOpen}
        incident={incident}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(updated) => {
          setIncident(updated);
          fetchIncident();
        }}
      />
    </div>
  );
};
