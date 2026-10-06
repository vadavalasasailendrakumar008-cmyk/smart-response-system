import React, { useState, useEffect } from 'react';
import { EmergencyIncident, IncidentStatus, Responder } from '../../shared/types';
import { authApi, incidentApi } from '../../services/api';
import {
  X,
  Radio,
  Truck,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Send,
  UserCheck,
} from 'lucide-react';

interface ResponderActionModalProps {
  incident: EmergencyIncident | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updated: EmergencyIncident) => void;
}

export const ResponderActionModal: React.FC<ResponderActionModalProps> = ({
  incident,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<IncidentStatus>('Under Review');
  const [notes, setNotes] = useState<string>('');
  const [assignedResponderId, setAssignedResponderId] = useState<string>('');
  const [responders, setResponders] = useState<Responder[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (incident) {
      setSelectedStatus(incident.status);
      setAssignedResponderId(incident.assigned_responder_id || '');
      setNotes('');
      setErrorMsg(null);
    }
  }, [incident]);

  useEffect(() => {
    if (isOpen) {
      authApi
        .getResponders()
        .then((res) => setResponders(res.responders))
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen || !incident) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await incidentApi.updateStatus(incident.id, {
        status: selectedStatus,
        notes: notes.trim() || undefined,
        assignedResponderId: assignedResponderId || undefined,
      });

      onSuccess(res.incident);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || err?.message || 'Failed to update status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusOptions: { value: IncidentStatus; label: string; icon: any }[] = [
    { value: 'Under Review', label: 'Under Review (Triage Active)', icon: Radio },
    { value: 'Responder Assigned', label: 'Responder Assigned (Unit Tagged)', icon: UserCheck },
    { value: 'Responder En Route', label: 'Responder En Route (Code 3 Lights/Siren)', icon: Truck },
    { value: 'Assistance Arrived', label: 'Assistance Arrived (On Scene)', icon: ShieldCheck },
    { value: 'Resolved', label: 'Resolved (Incident Concluded)', icon: CheckCircle },
    { value: 'Cancelled', label: 'Cancelled (False Alarm / Duplicate)', icon: AlertTriangle },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel-elevated w-full max-w-xl rounded-2xl border border-slate-700/80 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-white tracking-tight flex items-center space-x-2">
              <Radio className="w-5 h-5 text-blue-400" />
              <span>Dispatch Action Desk</span>
            </h3>
            <p className="text-xs text-slate-400 truncate max-w-sm mt-0.5">
              Incident #{incident.id.slice(-6)}: {incident.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-300">
              {errorMsg}
            </div>
          )}

          {/* Current Incident Glance */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs grid grid-cols-2 gap-2 text-slate-300">
            <div>
              <span className="text-slate-500 block">Priority:</span>
              <span className="font-bold text-red-400">{incident.priority}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Location:</span>
              <span className="truncate block">{incident.address_text}</span>
            </div>
          </div>

          {/* New Status Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Transition Status To:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {statusOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = selectedStatus === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSelectedStatus(opt.value)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center space-x-2 transition-all ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300 ring-2 ring-blue-500/20'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Assigned Responder Unit */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Assigned First Responder Unit:
            </label>
            <select
              value={assignedResponderId}
              onChange={(e) => setAssignedResponderId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="">-- No Unit Assigned (Dispatch Pool) --</option>
              {responders.map((resp) => (
                <option key={resp.id} value={resp.id}>
                  {resp.department} ({resp.badge_number}) {resp.profile?.full_name ? `- ${resp.profile.full_name}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Dispatch Log Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Dispatch Action Notes (Visible in Audit Log & Citizen Timeline):
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Unit 4 cleared intersection with code 3 sirens. Approaching site in 2 mins..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center space-x-2 shadow-lg shadow-blue-600/25 transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Transmitting...' : 'Confirm Status Update'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
