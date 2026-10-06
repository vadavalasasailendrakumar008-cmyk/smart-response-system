import React from 'react';
import { Shield, PhoneCall, Cpu, Sparkles, HeartHandshake } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-[#060910] text-slate-400 py-10 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Column 1: RescuOS */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white text-lg">RescuOS</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Zero-friction, next-generation emergency response platform bridging real-time witness telemetry with municipal first-responder dispatch command centers.
            </p>
            <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>GRID VERSION 2.5.0-PROD</span>
            </div>
          </div>

          {/* Column 2: Emergency Hotlines */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center space-x-2">
              <PhoneCall className="w-3.5 h-3.5 text-red-400" />
              <span>National Hotlines</span>
            </h4>
            <ul className="text-xs space-y-1.5 font-mono">
              <li className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">Emergency Dispatch</span>
                <span className="text-red-400 font-bold">911</span>
              </li>
              <li className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">Suicide & Crisis Lifeline</span>
                <span className="text-amber-400 font-bold">988</span>
              </li>
              <li className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">Poison Control Center</span>
                <span className="text-blue-400 font-bold">1-800-222-1222</span>
              </li>
              <li className="flex justify-between py-1">
                <span className="text-slate-400">Disaster Distress Helpline</span>
                <span className="text-emerald-400 font-bold">1-800-985-5990</span>
              </li>
            </ul>
          </div>

          {/* Column 3: Tech Engine */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center space-x-2">
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
              <span>Infrastructure Stack</span>
            </h4>
            <div className="text-xs space-y-2 text-slate-400">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Google Gemini 2.5 Flash Triage Engine</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Supabase PostgreSQL + Realtime RLS</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                <span>Express TS API + HTML5 Geolocation</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                <span>Leaflet Interactive Coordinate Mapping</span>
              </div>
            </div>
          </div>

          {/* Column 4: Advisory Disclaimer */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center space-x-2">
              <HeartHandshake className="w-3.5 h-3.5 text-emerald-400" />
              <span>Public Safety Notice</span>
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              RescuOS is an advanced decision-support dispatch framework. In an immediate life-threatening emergency, always contact local emergency operators directly if safe to do so.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <div>© {new Date().getFullYear()} RescuOS Smart Emergency Response Network. All rights reserved.</div>
          <div className="mt-2 sm:mt-0 font-mono text-[11px] text-slate-400">
            Engineered for Zero Latency Civilian Protection
          </div>
        </div>
      </div>
    </footer>
  );
};
