import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Users,
  Shield,
  Radio,
  Flame,
  ChevronDown,
  ChevronUp,
  Zap,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { incidentApi } from '../../services/api';
import { UserRole } from '../../shared/types';

export const DemoRoleSwitcher: React.FC = () => {
  const { user, loginAsDemoRole, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const [isTriggering, setIsTriggering] = useState(false);
  const [lastActionMsg, setLastActionMsg] = useState<string | null>(null);

  const handleSwitch = async (role: UserRole) => {
    try {
      await loginAsDemoRole(role);
      setLastActionMsg(`Switched to ${role}`);
      setTimeout(() => setLastActionMsg(null), 3000);

      if (role === 'CITIZEN') navigate('/dashboard');
      else if (role === 'RESPONDER') navigate('/responder');
      else if (role === 'ADMIN') navigate('/admin');
    } catch (e) {
      console.error(e);
    }
  };

  const handleTriggerMockDisaster = async () => {
    setIsTriggering(true);
    try {
      const res = await incidentApi.triggerMockDisaster();
      setLastActionMsg(`🚨 Disaster Spawned: ${res.incident.title.substring(0, 24)}...`);
      setTimeout(() => setLastActionMsg(null), 4500);
      // If currently responder or admin, keep them there; if citizen, take them to view or dashboard
      if (user?.role === 'RESPONDER') {
        navigate('/responder');
      } else if (user?.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      alert('Failed to trigger mock disaster: ' + (err?.message || 'Server error'));
    } finally {
      setIsTriggering(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <div className="glass-panel-elevated rounded-2xl border border-indigo-500/30 shadow-2xl backdrop-blur-xl overflow-hidden transition-all duration-300 w-80 sm:w-88">
        {/* Header Bar */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-2.5 bg-gradient-to-r from-indigo-900/60 via-slate-900/80 to-purple-900/60 flex items-center justify-between cursor-pointer border-b border-indigo-500/20 select-none"
        >
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded bg-indigo-500/20 text-indigo-400">
              <Zap className="w-4 h-4" />
            </span>
            <span className="font-bold text-xs uppercase tracking-wider text-indigo-200">
              Judges Sandbox & Role Switcher
            </span>
          </div>
          <button className="text-slate-400 hover:text-white p-1">
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>

        {/* Content Body */}
        {isOpen && (
          <div className="p-3.5 space-y-3 bg-[#090d16]/95">
            {/* Active User display */}
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
              <span className="text-slate-400">Current Persona:</span>
              <div className="flex items-center space-x-1.5 font-semibold text-white">
                <span className="truncate max-w-[140px]">{user?.full_name || 'Guest'}</span>
                <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-400 font-mono text-[10px] border border-indigo-500/30">
                  {user?.role || 'NONE'}
                </span>
              </div>
            </div>

            {/* Quick 1-Click Role Buttons */}
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>1-Click Role Swap</span>
                <span className="text-[10px] text-indigo-400 lowercase">no relogin needed</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleSwitch('CITIZEN')}
                  className={`px-2 py-2 rounded-xl text-xs font-semibold flex flex-col items-center justify-center space-y-1 transition-all border ${
                    user?.role === 'CITIZEN'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/20 shadow-lg shadow-emerald-500/10'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Citizen</span>
                </button>

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleSwitch('RESPONDER')}
                  className={`px-2 py-2 rounded-xl text-xs font-semibold flex flex-col items-center justify-center space-y-1 transition-all border ${
                    user?.role === 'RESPONDER'
                      ? 'bg-blue-500/20 border-blue-500 text-blue-300 ring-2 ring-blue-500/20 shadow-lg shadow-blue-500/10'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>Responder</span>
                </button>

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleSwitch('ADMIN')}
                  className={`px-2 py-2 rounded-xl text-xs font-semibold flex flex-col items-center justify-center space-y-1 transition-all border ${
                    user?.role === 'ADMIN'
                      ? 'bg-purple-500/20 border-purple-500 text-purple-300 ring-2 ring-purple-500/20 shadow-lg shadow-purple-500/10'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </button>
              </div>
            </div>

            {/* Instant Mock Disaster Trigger */}
            <div className="pt-1">
              <button
                type="button"
                disabled={isTriggering}
                onClick={handleTriggerMockDisaster}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-red-600/30 hover:shadow-red-600/50 transition-all transform active:scale-95 disabled:opacity-50"
              >
                <Flame className={`w-4 h-4 text-amber-200 ${isTriggering ? 'animate-spin' : 'animate-bounce'}`} />
                <span>
                  {isTriggering ? 'Simulating Realtime Surge...' : 'Trigger Live Disaster Surge'}
                </span>
              </button>
              <p className="text-[10px] text-slate-400 mt-1 text-center">
                Spawns a real-time critical incident with instant AI triage
              </p>
            </div>

            {/* Status Toast Toast */}
            {lastActionMsg && (
              <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2 animate-fade-in">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">{lastActionMsg}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
