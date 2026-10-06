import React, { useState } from 'react';
import { SafetyGuidanceItem } from '../../shared/types';
import {
  Sparkles,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Volume2,
  VolumeX,
  ShieldCheck,
} from 'lucide-react';

interface GuidanceCardProps {
  guidance: SafetyGuidanceItem[];
  priorityReasoning?: string | null;
  responderBriefing?: string | null;
}

export const GuidanceCard: React.FC<GuidanceCardProps> = ({
  guidance,
  priorityReasoning,
  responderBriefing,
}) => {
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const toggleStep = (stepNumber: number) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [stepNumber]: !prev[stepNumber],
    }));
  };

  const handleSpeakGuidance = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported by your browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToRead = guidance
      .map((g) => `Step ${g.stepNumber}: ${g.title}. ${g.instruction}`)
      .join('. ');

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  if (!guidance || guidance.length === 0) {
    return (
      <div className="glass-panel p-6 rounded-2xl text-center text-slate-400 text-xs">
        Emergency guidance will appear immediately once triage evaluation completes.
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl border border-red-500/20 p-5 space-y-4 shadow-xl relative overflow-hidden">
      {/* Decorative gradient glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight flex items-center space-x-2">
              <span>Gemini 2.5 AI Survival Guidance</span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                LIVE PROTOCOL
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Immediate action steps to execute while rescue units are en route
            </p>
          </div>
        </div>

        {/* Hands-free Voice Reader */}
        <button
          type="button"
          onClick={handleSpeakGuidance}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors border ${
            isSpeaking
              ? 'bg-amber-500/20 border-amber-500 text-amber-300 animate-pulse'
              : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
          }`}
          title="Hands-free audio readout"
        >
          {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          <span>{isSpeaking ? 'Stop Audio' : 'Read Aloud'}</span>
        </button>
      </div>

      {/* Priority Reasoning Note */}
      {priorityReasoning && (
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
          <div className="font-bold text-slate-300 flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>AI Triage Assessment Rationale</span>
          </div>
          <p className="text-slate-400 leading-relaxed">{priorityReasoning}</p>
        </div>
      )}

      {/* Action Steps List */}
      <div className="space-y-2.5">
        {guidance.map((step) => {
          const isDone = completedSteps[step.stepNumber] || false;
          return (
            <div
              key={step.stepNumber}
              onClick={() => toggleStep(step.stepNumber)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start space-x-3 ${
                isDone
                  ? 'bg-emerald-500/5 border-emerald-500/30 opacity-70'
                  : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="pt-0.5 shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-500 hover:text-slate-300" />
                )}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-red-400">
                      #{step.stepNumber}
                    </span>
                    <h4
                      className={`font-bold text-xs sm:text-sm ${
                        isDone ? 'line-through text-slate-400' : 'text-white'
                      }`}
                    >
                      {step.title}
                    </h4>
                  </div>

                  {step.warningTag && (
                    <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-bold tracking-wider uppercase flex items-center space-x-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>{step.warningTag}</span>
                    </span>
                  )}
                </div>

                <p
                  className={`text-xs leading-relaxed ${
                    isDone ? 'text-slate-500' : 'text-slate-300'
                  }`}
                >
                  {step.instruction}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Responder Briefing footer */}
      {responderBriefing && (
        <div className="pt-2 border-t border-slate-800 text-xs flex items-center justify-between text-slate-400">
          <span className="font-semibold text-slate-300">Unit Tactical Memo:</span>
          <span className="italic truncate max-w-xs">{responderBriefing}</span>
        </div>
      )}
    </div>
  );
};
