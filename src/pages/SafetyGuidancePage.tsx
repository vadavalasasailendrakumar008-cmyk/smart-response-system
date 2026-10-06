import React, { useState } from 'react';
import {
  HeartPulse,
  Flame,
  ShieldAlert,
  CloudLightning,
  Search,
  BookOpen,
  Volume2,
  VolumeX,
  AlertTriangle,
  CheckCircle,
  Activity,
  Layers,
} from 'lucide-react';

interface SurvivalGuide {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  icon: any;
  color: string;
  steps: { step: number; title: string; instruction: string; warning?: string }[];
}

export const SafetyGuidancePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const guides: SurvivalGuide[] = [
    {
      id: 'cpr-adult',
      category: 'MEDICAL',
      title: 'Adult Hands-Only CPR (Cardiac Arrest)',
      subtitle: 'For unresponsive adults with absent or abnormal breathing',
      icon: HeartPulse,
      color: 'text-red-400',
      steps: [
        {
          step: 1,
          title: 'Verify Responsiveness & Breathing',
          instruction: 'Tap the victim firmly on the collarbone and shout loudly. Check chest rise for no more than 10 seconds.',
          warning: 'DO NOT DELAY'
        },
        {
          step: 2,
          title: 'Position Hands on Center of Chest',
          instruction: 'Place the heel of one hand in the center of the chest. Interlock your other hand on top, keeping elbows locked straight.',
        },
        {
          step: 3,
          title: 'Compress Hard and Fast (100–120 BPM)',
          instruction: 'Push down at least 2 inches (5 cm) deep to the beat of "Stayin Alive". Allow full chest recoil between compressions.',
          warning: 'DO NOT STOP UNTIL HELP ARRIVES'
        },
        {
          step: 4,
          title: 'Deploy Automated External Defibrillator (AED)',
          instruction: 'Turn on the AED immediately upon arrival. Follow audible spoken prompts and apply pads to bare skin.',
        }
      ]
    },
    {
      id: 'severe-bleeding',
      category: 'MEDICAL',
      title: 'Severe Arterial Hemorrhage Control',
      subtitle: 'Life-threatening spurting or pooling blood',
      icon: Activity,
      color: 'text-rose-400',
      steps: [
        {
          step: 1,
          title: 'Direct Heavy Pressure',
          instruction: 'Apply immediate continuous two-handed pressure directly over the wound with clean cloth or gauze.',
          warning: 'DO NOT LIFT CLOTH TO PEEK'
        },
        {
          step: 2,
          title: 'Pack Deep Cavity Wounds',
          instruction: 'If the wound is deep, pack cloth tightly into the wound cavity until packed solid, then maintain direct pressure.',
        },
        {
          step: 3,
          title: 'Apply Tourniquet (Extremities Only)',
          instruction: 'Place tourniquet 2 to 3 inches above the bleed (not over a joint). Tighten windlass until bleeding stops completely.',
          warning: 'NOTE APPLICATION TIME'
        }
      ]
    },
    {
      id: 'fire-evac',
      category: 'FIRE',
      title: 'Structural Fire & Smoke Entrapment',
      subtitle: 'Emergency escape procedures in heavy smoke and thermal threat',
      icon: Flame,
      color: 'text-amber-400',
      steps: [
        {
          step: 1,
          title: 'Crawl Low Below Smoke',
          instruction: 'Toxic gases and carbon monoxide rise. Stay on hands and knees where clean oxygen remains near the floor.',
          warning: 'TOXIC AIR HAZARD'
        },
        {
          step: 2,
          title: 'Test Closed Doors with Back of Hand',
          instruction: 'Feel the door and knob with the back of your hand. If hot, do NOT open; use secondary escape window.',
        },
        {
          step: 3,
          title: 'Close Doors Behind You',
          instruction: 'Compartmentalizing rooms slows fire oxygenation by up to 15 critical minutes.',
        },
        {
          step: 4,
          title: 'Stop, Drop, and Roll',
          instruction: 'If clothing ignites, immediately drop to the ground and roll back and forth, shielding your face with your hands.',
        }
      ]
    },
    {
      id: 'active-threat',
      category: 'CRIME',
      title: 'Active Hostile Threat (Run, Hide, Fight)',
      subtitle: 'Immediate civilian survival tactics in weapon incidents',
      icon: ShieldAlert,
      color: 'text-purple-400',
      steps: [
        {
          step: 1,
          title: 'RUN: Evacuate If Safe Path Exists',
          instruction: 'Leave personal belongings behind. Help others escape if possible, but do not hesitate. Prevent others from entering.',
          warning: 'TOP PRIORITY'
        },
        {
          step: 2,
          title: 'HIDE: Lock & Fortify Shelters',
          instruction: 'If evacuation is cut off, lock and barricade doors with heavy furniture. Silence all mobile phones and turn off lights.',
          warning: 'ABSOLUTE SILENCE'
        },
        {
          step: 3,
          title: 'FIGHT: As Absolute Last Resort',
          instruction: 'Only when life is in imminent danger. Act with total commitment and aggressive force using improvised objects.',
        },
        {
          step: 4,
          title: 'Police Arrival Protocol',
          instruction: 'Keep hands empty and visible at all times. Spread fingers, avoid sudden movements or pointing, and obey shouted commands.',
        }
      ]
    },
    {
      id: 'earthquake',
      category: 'DISASTER',
      title: 'Earthquake & Structural Collapse',
      subtitle: 'Drop, Cover, and Hold On protocol during seismic tremors',
      icon: CloudLightning,
      color: 'text-blue-400',
      steps: [
        {
          step: 1,
          title: 'DROP onto Hands and Knees',
          instruction: 'This prevents being knocked down and allows rapid movement to cover.',
        },
        {
          step: 2,
          title: 'COVER Head and Torso',
          instruction: 'Shelter under a sturdy table or desk. If no shelter nearby, crawl next to an interior wall away from windows.',
          warning: 'AVOID DOORWAYS'
        },
        {
          step: 3,
          title: 'HOLD ON Until Shaking Stops',
          instruction: 'Hold onto your shelter with one hand and protect your neck and head with the other hand.',
        },
        {
          step: 4,
          title: 'Inspect Utilities for Leaks',
          instruction: 'If you smell gas or hear hissing, turn off main gas meter immediately if safe to access.',
        }
      ]
    }
  ];

  const handleToggleSpeak = (guide: SurvivalGuide) => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis not supported in this browser.');
      return;
    }

    if (speakingId === guide.id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const text = `${guide.title}. ${guide.steps.map((s) => `Step ${s.step}: ${s.title}. ${s.instruction}`).join(' ')}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(guide.id);
    window.speechSynthesis.speak(utterance);
  };

  const filteredGuides = guides.filter((g) => {
    const matchesCat = selectedCategory === 'ALL' || g.category === selectedCategory;
    const matchesQuery =
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.steps.some((s) => s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.instruction.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Standardized Emergency Protocols</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">Emergency Survival Reference</h1>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          Search actionable first-aid, evacuation, and active threat guides with step-by-step audio readout.
        </p>
      </div>

      {/* Search & Category Filter */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by emergency condition, CPR, tourniquet, fire, earthquake..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
          {['ALL', 'MEDICAL', 'FIRE', 'CRIME', 'DISASTER'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border shrink-0 ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-black border-amber-500 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Guides Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredGuides.map((guide) => {
          const Icon = guide.icon;
          const isSpeaking = speakingId === guide.id;

          return (
            <div
              key={guide.id}
              className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-5 shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2.5 rounded-2xl bg-slate-900 border border-slate-800 ${guide.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-white">{guide.title}</h3>
                      <p className="text-xs text-slate-400">{guide.subtitle}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleSpeak(guide)}
                    className={`p-2 rounded-xl border text-xs flex items-center space-x-1 shrink-0 ${
                      isSpeaking
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 animate-pulse'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                    title="Audio Guidance"
                  >
                    {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>

                {/* Steps List */}
                <div className="space-y-3 pt-2">
                  {guide.steps.map((st) => (
                    <div
                      key={st.step}
                      className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-amber-400">#{st.step}</span>
                          <span className="font-bold text-slate-200">{st.title}</span>
                        </div>
                        {st.warning && (
                          <span className="px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-bold">
                            {st.warning}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 leading-relaxed text-[11px]">{st.instruction}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                <span>Protocol: RescuOS Public Health Standard</span>
                <span className="font-bold text-emerald-400 flex items-center space-x-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Verified SOP</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
