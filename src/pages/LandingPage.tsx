import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EmergencyButton } from '../components/emergency/EmergencyButton';
import { useAuth } from '../context/AuthContext';
import {
  HeartPulse,
  CarFront,
  Flame,
  ShieldAlert,
  CloudLightning,
  UserSearch,
  AlertTriangle,
  Sparkles,
  Radio,
  MapPin,
  Clock,
  ShieldCheck,
  Zap,
  ArrowRight,
  Activity,
  Users,
} from 'lucide-react';
import { EmergencyCategory } from '../shared/types';

export const LandingPage: React.FC = () => {
  const { user, loginAsDemoRole } = useAuth();
  const navigate = useNavigate();

  const categories: {
    type: EmergencyCategory;
    label: string;
    icon: any;
    color: string;
    border: string;
    bg: string;
    desc: string;
  }[] = [
    {
      type: 'MEDICAL',
      label: 'Medical Emergency',
      icon: HeartPulse,
      color: 'text-red-400',
      border: 'border-red-500/30',
      bg: 'bg-red-500/10 hover:bg-red-500/20',
      desc: 'Cardiac arrest, trauma, unconsciousness, severe hemorrhage',
    },
    {
      type: 'ACCIDENT',
      label: 'Road Accident',
      icon: CarFront,
      color: 'text-orange-400',
      border: 'border-orange-500/30',
      bg: 'bg-orange-500/10 hover:bg-orange-500/20',
      desc: 'Vehicular collision, pedestrian impact, trapped occupants',
    },
    {
      type: 'FIRE',
      label: 'Fire Emergency',
      icon: Flame,
      color: 'text-amber-400',
      border: 'border-amber-500/30',
      bg: 'bg-amber-500/10 hover:bg-amber-500/20',
      desc: 'Structure fire, grease fire, wildfire, smoke entrapment',
    },
    {
      type: 'CRIME',
      label: 'Crime / Security Threat',
      icon: ShieldAlert,
      color: 'text-purple-400',
      border: 'border-purple-500/30',
      bg: 'bg-purple-500/10 hover:bg-purple-500/20',
      desc: 'Active shooter, armed robbery, assault, violent threat',
    },
    {
      type: 'DISASTER',
      label: 'Natural Disaster',
      icon: CloudLightning,
      color: 'text-blue-400',
      border: 'border-blue-500/30',
      bg: 'bg-blue-500/10 hover:bg-blue-500/20',
      desc: 'Earthquake, structural collapse, flash flood, hurricane',
    },
    {
      type: 'MISSING',
      label: 'Missing Person',
      icon: UserSearch,
      color: 'text-indigo-400',
      border: 'border-indigo-500/30',
      bg: 'bg-indigo-500/10 hover:bg-indigo-500/20',
      desc: 'Missing child (Amber Alert), endangered elder, abduction',
    },
    {
      type: 'OTHER',
      label: 'Other Critical Emergency',
      icon: AlertTriangle,
      color: 'text-slate-400',
      border: 'border-slate-700',
      bg: 'bg-slate-800/40 hover:bg-slate-800/60',
      desc: 'Power lines down, gas leaks, hazardous chemical spills',
    },
  ];

  const handleCategoryClick = (cat: EmergencyCategory) => {
    navigate(`/report?category=${cat}`);
  };

  return (
    <div className="space-y-24 pb-20 overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 text-center max-w-5xl mx-auto px-4">
        {/* Radar Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[140px] pointer-events-none" />

        {/* Live System Badge */}
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold tracking-wide uppercase mb-6 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-red-500"></span>
          <span>911 Integrated Dispatch Grid • Active AI Decision Support</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-6">
          Zero-Friction Emergency Response.{' '}
          <span className="bg-gradient-to-r from-red-500 via-rose-400 to-amber-400 bg-clip-text text-transparent">
            AI-Prioritized Rescue.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed mb-10">
          RescuOS instantly locks GPS coordinates, analyzes threat levels using Google Gemini 2.5 Flash, delivers immediate life-saving guidance, and dispatches first responders via real-time WebSocket telemetry.
        </p>

        {/* Central SOS Emergency Trigger Button */}
        <div className="mb-14">
          <EmergencyButton size="large" />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/report"
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm flex items-center space-x-2 shadow-xl shadow-red-600/30 transition-all hover:scale-105"
          >
            <span>Guided 3-Step Incident Report</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/safety"
            className="px-6 py-3.5 rounded-2xl glass-panel hover:bg-slate-800 text-slate-200 font-bold text-sm border border-slate-700 flex items-center space-x-2 transition-all"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Search Survival Guides</span>
          </Link>
        </div>
      </section>

      {/* Target Domains Emergency Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Select Emergency Category
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            One-touch categorization automatically primes specialized response units and tailored survival protocols.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.type}
                onClick={() => handleCategoryClick(cat.type)}
                className={`p-5 rounded-2xl border ${cat.border} ${cat.bg} transition-all duration-300 hover:scale-[1.03] cursor-pointer flex flex-col justify-between group shadow-lg`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-slate-950/70 border border-slate-800 ${cat.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                      {cat.type}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base text-white group-hover:text-red-400 transition-colors">
                    {cat.label}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    {cat.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs font-semibold text-slate-300 group-hover:text-white">
                  <span>Report Now</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* High-Reliability Architecture Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-slate-800 relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Gemini 2.5 Flash Triage</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Evaluates threat level in milliseconds using structured JSON Schema outputs to establish priority ratings, detect duplicate signatures, and generate instant civilian first aid steps.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Radio className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Bi-Directional Telemetry</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Supabase Realtime WebSockets sync citizen status updates with responder dashboards instantaneously, broadcasting ETA countdowns and on-scene confirmations.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">High-Accuracy GPS Fallback</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Seamless HTML5 Geolocation with Leaflet draggable fallback pins, address geocoding, and unverified flags ensure zero reports are lost due to hardware permission issues.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Role Console Quick Launchers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl font-extrabold text-white">Multi-Role Tactical Desks</h2>
          <p className="text-xs text-slate-400 mt-1">
            Experience RescuOS from any operational viewpoint with pre-authenticated demo access.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Citizen Console */}
          <div className="glass-panel p-6 rounded-2xl border border-emerald-500/20 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Citizen Portal</h3>
                <span className="text-[11px] text-emerald-400">Live Incident Tracking</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Active incident tracker, step-by-step CPR and survival instructions, emergency timeline, and personal history logs.
            </p>
            <button
              onClick={() => {
                loginAsDemoRole('CITIZEN');
                navigate('/dashboard');
              }}
              className="w-full py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs border border-emerald-500/40 transition-colors"
            >
              Launch Citizen Dashboard
            </button>
          </div>

          {/* Responder Desk */}
          <div className="glass-panel p-6 rounded-2xl border border-blue-500/20 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Responder Desk</h3>
                <span className="text-[11px] text-blue-400">Incident Triage & Dispatch</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Live incoming emergency feed, color-coded priority queue, unit assignment desk, and status action triggers (En Route, Arrived, Resolved).
            </p>
            <button
              onClick={() => {
                loginAsDemoRole('RESPONDER');
                navigate('/responder');
              }}
              className="w-full py-2.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 font-bold text-xs border border-blue-500/40 transition-colors"
            >
              Launch Responder Console
            </button>
          </div>

          {/* Admin Platform */}
          <div className="glass-panel p-6 rounded-2xl border border-purple-500/20 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Command Center</h3>
                <span className="text-[11px] text-purple-400">Analytics & Audit Trails</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Global citywide KPIs, response time benchmarks, category breakdowns, first responder unit rosters, and compliance audit trail.
            </p>
            <button
              onClick={() => {
                loginAsDemoRole('ADMIN');
                navigate('/admin');
              }}
              className="w-full py-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-bold text-xs border border-purple-500/40 transition-colors"
            >
              Launch Admin Analytics
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
