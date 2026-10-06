import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LocationPickerMap } from '../components/emergency/LocationPickerMap';
import { GuidanceCard } from '../components/emergency/GuidanceCard';
import { incidentApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  EmergencyCategory,
  PriorityLevel,
  AIAnalysisResult,
} from '../shared/types';
import {
  HeartPulse,
  CarFront,
  Flame,
  ShieldAlert,
  CloudLightning,
  UserSearch,
  AlertTriangle,
  MapPin,
  FileText,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Siren,
  Users,
  ShieldCheck,
} from 'lucide-react';

export const EmergencyReportPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [latitude, setLatitude] = useState<number>(37.7749);
  const [longitude, setLongitude] = useState<number>(-122.4194);
  const [addressText, setAddressText] = useState<string>('San Francisco Civic Center, CA');
  const [isLocationVerified, setIsLocationVerified] = useState<boolean>(false);

  const [category, setCategory] = useState<EmergencyCategory>(
    (searchParams.get('category') as EmergencyCategory) || 'MEDICAL'
  );
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [affectedPeopleCount, setAffectedPeopleCount] = useState<number>(1);
  const [userSelectedSeverity, setUserSelectedSeverity] = useState<PriorityLevel>('HIGH');

  // AI Triage State
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);

  // Check URL parameters on mount
  useEffect(() => {
    if (searchParams.get('instantSos') === 'true') {
      setTitle('Immediate Panic SOS Alert Triggered');
      setDescription('Witness triggered emergency double-tap panic beacon. Immediate on-scene paramedic or police assistance requested.');
      setUserSelectedSeverity('CRITICAL');
      setCategory('MEDICAL');
    }
  }, [searchParams]);

  const categories: { type: EmergencyCategory; label: string; icon: any; color: string }[] = [
    { type: 'MEDICAL', label: 'Medical Emergency', icon: HeartPulse, color: 'text-red-400' },
    { type: 'ACCIDENT', label: 'Road Accident', icon: CarFront, color: 'text-orange-400' },
    { type: 'FIRE', label: 'Fire Emergency', icon: Flame, color: 'text-amber-400' },
    { type: 'CRIME', label: 'Crime / Active Threat', icon: ShieldAlert, color: 'text-purple-400' },
    { type: 'DISASTER', label: 'Natural Disaster', icon: CloudLightning, color: 'text-blue-400' },
    { type: 'MISSING', label: 'Missing Person', icon: UserSearch, color: 'text-indigo-400' },
    { type: 'OTHER', label: 'Other Hazard', icon: AlertTriangle, color: 'text-slate-400' },
  ];

  const handleLocationChange = (lat: number, lng: number, addr: string, verified: boolean) => {
    setLatitude(lat);
    setLongitude(lng);
    setAddressText(addr);
    setIsLocationVerified(verified);
  };

  // Step 2 -> Step 3: Trigger Gemini Pre-Analysis
  const handleProceedToAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || description.trim().length < 10) {
      setErrorMessage('Please provide at least 10 characters describing what is occurring.');
      return;
    }

    if (!title.trim()) {
      setTitle(`${category} Emergency at ${addressText.slice(0, 30)}`);
    }

    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const result = await incidentApi.analyze({
        category,
        description,
        affectedPeopleCount,
        userSelectedSeverity,
        addressText,
        latitude,
        longitude,
      });

      setAiAnalysis(result);
      setCurrentStep(3);
    } catch (err: any) {
      console.warn('Analysis error:', err);
      // Fallback: proceed to step 3 even if analyze fails so the report is never blocked!
      setCurrentStep(3);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Final Transmission
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        category,
        title: title || `${category} Emergency Signal`,
        description,
        userSelectedSeverity,
        affectedPeopleCount,
        latitude,
        longitude,
        addressText,
        isLocationVerified,
        calculatedPriority: aiAnalysis?.calculatedPriority || userSelectedSeverity,
        aiPriorityReasoning: aiAnalysis?.priorityReasoning,
        aiSuggestedGuidance: aiAnalysis?.safetyGuidance,
      };

      const res = await incidentApi.create(payload);
      navigate(`/incidents/${res.incident.id}`);
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message || err?.message || 'Failed to transmit emergency signal.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Top Wizard Steps Header */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center">
            <Siren className="w-4 h-4 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-white">Emergency Report Dispatch Wizard</h1>
            <p className="text-[11px] text-slate-400">Step {currentStep} of 3 • Direct 911 Triage Uplink</p>
          </div>
        </div>

        {/* Step pills */}
        <div className="hidden sm:flex items-center space-x-2 text-xs font-bold">
          <span
            className={`px-3 py-1 rounded-xl border ${
              currentStep === 1
                ? 'bg-red-500/20 border-red-500 text-red-300'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            1. Location
          </span>
          <span
            className={`px-3 py-1 rounded-xl border ${
              currentStep === 2
                ? 'bg-red-500/20 border-red-500 text-red-300'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            2. Situation
          </span>
          <span
            className={`px-3 py-1 rounded-xl border ${
              currentStep === 3
                ? 'bg-red-500/20 border-red-500 text-red-300'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            3. AI Triage & Transmit
          </span>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center space-x-2 animate-fade-in">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ================= STEP 1: LOCATION ================= */}
      {currentStep === 1 && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5 animate-fade-in">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-red-400" />
              <span>Step 1: Confirm Incident Location</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Ensure accurate GPS telemetry for arriving first responder units. Drag pin or use GPS.
            </p>
          </div>

          <LocationPickerMap
            latitude={latitude}
            longitude={longitude}
            addressText={addressText}
            isLocationVerified={isLocationVerified}
            onLocationChange={handleLocationChange}
            height="380px"
            interactive={true}
          />

          <div className="pt-3 border-t border-slate-800 flex justify-end">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-red-600/25 transition-all"
            >
              <span>Confirm Location & Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 2: CATEGORY & DETAILS ================= */}
      {currentStep === 2 && (
        <form onSubmit={handleProceedToAnalysis} className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6 animate-fade-in">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <FileText className="w-5 h-5 text-amber-400" />
              <span>Step 2: Emergency Category & Incident Details</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select the matching emergency class and provide raw observation details.
            </p>
          </div>

          {/* Category Picker */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Select Emergency Category:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {categories.map((c) => {
                const Icon = c.icon;
                const isSelected = category === c.type;
                return (
                  <button
                    key={c.type}
                    type="button"
                    onClick={() => setCategory(c.type)}
                    className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center space-y-2 transition-all ${
                      isSelected
                        ? 'bg-red-500/20 border-red-500 text-white ring-2 ring-red-500/30'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${c.color}`} />
                    <span className="text-center">{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Incident Title & Description */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Brief Title / Headline (Optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Unconscious pedestrian on sidewalk, irregular breathing"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Detailed Situation Description *
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                placeholder="Describe what you see: victim condition, weapons present, fire spread, entrapment, bleeding, smoke, vehicle count..."
                className="w-full p-3.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 leading-relaxed"
              />
            </div>
          </div>

          {/* Severity & Affected Victims */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                <span>Estimated People Affected:</span>
              </label>
              <input
                type="number"
                min={1}
                max={500}
                value={affectedPeopleCount}
                onChange={(e) => setAffectedPeopleCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Witness Assessed Severity:</span>
              </label>
              <select
                value={userSelectedSeverity}
                onChange={(e) => setUserSelectedSeverity(e.target.value as PriorityLevel)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-red-500"
              >
                <option value="CRITICAL">CRITICAL (Immediate Life Hazard)</option>
                <option value="HIGH">HIGH (Severe Injury / Active Danger)</option>
                <option value="MEDIUM">MEDIUM (Non-Life-Threatening)</option>
                <option value="LOW">LOW (Non-Urgent Assistance)</option>
              </select>
            </div>
          </div>

          {/* Wizard Navigation */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold flex items-center space-x-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Map</span>
            </button>

            <button
              type="submit"
              disabled={isAnalyzing}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-amber-600/25 transition-all disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isAnalyzing ? 'Running Gemini 2.5 AI Triage...' : 'Execute AI Triage Analysis'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* ================= STEP 3: AI TRIAGE PREVIEW & TRANSMIT ================= */}
      {currentStep === 3 && (
        <div className="space-y-6 animate-fade-in">
          {/* Priority Intelligence Card */}
          <div className="glass-panel p-6 rounded-2xl border border-red-500/30 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  AI Decision-Support Assessment
                </span>
                <h3 className="text-xl font-black text-white flex items-center space-x-2 mt-0.5">
                  <span>Assessed Urgency:</span>
                  <span
                    className={`px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider border ${
                      aiAnalysis?.calculatedPriority === 'CRITICAL'
                        ? 'bg-red-500/20 text-red-400 border-red-500 animate-pulse'
                        : aiAnalysis?.calculatedPriority === 'HIGH'
                        ? 'bg-orange-500/20 text-orange-400 border-orange-500'
                        : 'bg-amber-500/20 text-amber-400 border-amber-500'
                    }`}
                  >
                    {aiAnalysis?.calculatedPriority || userSelectedSeverity}
                  </span>
                </h3>
              </div>

              <div className="text-right text-xs">
                <span className="text-slate-400 block">Response Window:</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {aiAnalysis?.calculatedPriority === 'CRITICAL'
                    ? '< 5 Minutes (ALS Immediate)'
                    : '< 10 Minutes (Standard Code 3)'}
                </span>
              </div>
            </div>

            {/* AI Reasoning */}
            {aiAnalysis?.priorityReasoning && (
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                <div className="font-bold text-slate-300 flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Clinical & Tactical Priority Reasoning</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {aiAnalysis.priorityReasoning}
                </p>
              </div>
            )}

            {/* Responder Briefing */}
            {aiAnalysis?.responderBriefing && (
              <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs space-y-1 text-blue-200">
                <span className="font-bold block">First Responder Tactical Briefing:</span>
                <p className="leading-relaxed">{aiAnalysis.responderBriefing}</p>
              </div>
            )}
          </div>

          {/* Real-time Survival Guidance */}
          {aiAnalysis?.safetyGuidance && (
            <GuidanceCard
              guidance={aiAnalysis.safetyGuidance}
              priorityReasoning={aiAnalysis.priorityReasoning}
            />
          )}

          {/* Final Dispatch Confirmation Buttons */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold flex items-center space-x-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Edit Report Details</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleFinalSubmit}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-sm flex items-center space-x-3 shadow-xl shadow-red-600/40 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              <Siren className="w-5 h-5 text-white animate-spin" />
              <span>{isSubmitting ? 'Uplinking to 911 Grid...' : 'Transmit Emergency SOS to Dispatch'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
