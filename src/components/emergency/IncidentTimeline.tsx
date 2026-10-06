import React from 'react';
import { IncidentStatus, StatusHistoryItem } from '../../shared/types';
import {
  CheckCircle2,
  Clock,
  Radio,
  Truck,
  ShieldCheck,
  XCircle,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';

interface IncidentTimelineProps {
  currentStatus: IncidentStatus;
  history?: StatusHistoryItem[];
  onCancelReport?: () => void;
  canCancel?: boolean;
}

const ORDERED_STEPS: IncidentStatus[] = [
  'Reported',
  'Under Review',
  'Responder Assigned',
  'Responder En Route',
  'Assistance Arrived',
  'Resolved',
];

export const IncidentTimeline: React.FC<IncidentTimelineProps> = ({
  currentStatus,
  history = [],
  onCancelReport,
  canCancel = false,
}) => {
  const isCancelled = currentStatus === 'Cancelled';
  const currentStepIndex = ORDERED_STEPS.indexOf(currentStatus);

  const getStepIcon = (step: IncidentStatus, isCompleted: boolean, isCurrent: boolean) => {
    if (isCompleted) {
      return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
    }
    if (isCurrent) {
      if (step === 'Responder En Route') return <Truck className="w-5 h-5 text-blue-400 animate-bounce" />;
      if (step === 'Assistance Arrived') return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
      return <Clock className="w-5 h-5 text-amber-400 animate-spin" />;
    }

    switch (step) {
      case 'Reported':
        return <AlertCircle className="w-4 h-4 text-slate-500" />;
      case 'Under Review':
        return <Clock className="w-4 h-4 text-slate-500" />;
      case 'Responder Assigned':
        return <Radio className="w-4 h-4 text-slate-500" />;
      case 'Responder En Route':
        return <Truck className="w-4 h-4 text-slate-500" />;
      case 'Assistance Arrived':
        return <ShieldCheck className="w-4 h-4 text-slate-500" />;
      case 'Resolved':
        return <CheckCircle2 className="w-4 h-4 text-slate-500" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="font-extrabold text-base text-white tracking-tight flex items-center space-x-2">
            <span>Live Dispatch Lifecycle</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                isCancelled
                  ? 'bg-red-500/10 text-red-400 border-red-500/30'
                  : currentStatus === 'Resolved'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-blue-500/10 text-blue-400 border-blue-500/30 animate-pulse'
              }`}
            >
              {currentStatus}
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Bi-directional real-time telemetry from dispatch headquarters
          </p>
        </div>

        {canCancel && !isCancelled && currentStatus !== 'Resolved' && (
          <button
            type="button"
            onClick={onCancelReport}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors flex items-center space-x-1"
          >
            <XCircle className="w-4 h-4" />
            <span>Cancel Alert</span>
          </button>
        )}
      </div>

      {/* Cancelled State Banner */}
      {isCancelled ? (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center space-x-3 text-red-300">
          <XCircle className="w-6 h-6 shrink-0 text-red-400" />
          <div className="text-xs">
            <p className="font-bold">Incident Alert Cancelled</p>
            <p className="text-red-300/80 mt-0.5">
              This emergency report was stood down by the citizen reporter.
            </p>
          </div>
        </div>
      ) : (
        /* Stepper Progression */
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {ORDERED_STEPS.map((step, idx) => {
              const isCompleted = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div
                  key={step}
                  className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                    isCurrent
                      ? 'bg-blue-500/15 border-blue-500/60 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/30'
                      : isCompleted
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                      : 'bg-slate-900/50 border-slate-800 text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold">0{idx + 1}</span>
                    {getStepIcon(step, isCompleted, isCurrent)}
                  </div>
                  <div className="text-xs font-bold leading-tight truncate">
                    {step}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Audit Log Timeline */}
          {history.length > 0 && (
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Dispatch Event Log & Audit Trail
              </h4>
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {history.map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/80 text-xs flex items-start space-x-3"
                  >
                    <div className="pt-1">
                      <span className="w-2 h-2 rounded-full bg-blue-400 block ring-4 ring-blue-400/20" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200">{log.status}</span>
                        <span className="text-[11px] font-mono text-slate-500">
                          {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                      {log.notes && <p className="text-slate-400 text-[11px] leading-relaxed">{log.notes}</p>}
                      {log.user && (
                        <p className="text-[10px] text-slate-500">
                          Updated by {log.user.full_name} ({log.user.role})
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
