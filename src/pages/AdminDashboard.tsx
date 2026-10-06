import React, { useState, useEffect } from 'react';
import { analyticsApi, authApi } from '../services/api';
import { StatMetricCard } from '../components/dashboard/StatMetricCard';
import {
  Activity,
  Flame,
  Clock,
  ShieldCheck,
  Users,
  Radio,
  FileText,
  RotateCcw,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [responders, setResponders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchData = async () => {
    try {
      const [analyticsData, respondersData] = await Promise.all([
        analyticsApi.getOverview(),
        authApi.getResponders(),
      ]);
      setAnalytics(analyticsData);
      setResponders(respondersData.responders);
    } catch (e) {
      console.warn('Error fetching admin overview:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading || !analytics) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400">
        Aggregating citywide municipal telemetry & response metrics...
      </div>
    );
  }

  const categoryEntries = Object.entries(analytics.categoryDistribution || {}) as [string, number][];
  const maxCategoryCount = Math.max(...categoryEntries.map(([_, count]) => count), 1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold uppercase">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
            <span>Directorate Command Post</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Platform Analytics & Emergency Oversight</h1>
          <p className="text-xs text-slate-400">
            System-wide response SLAs, unit allocation metrics, and compliance audit trail
          </p>
        </div>

        <button
          onClick={fetchData}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-2 border border-slate-700 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatMetricCard
          label="Total Incident Volume"
          value={analytics.totalIncidents}
          subValue="all-time reports"
          icon={Activity}
          variant="primary"
          trend={{ value: '+12% this week', isPositive: true }}
        />
        <StatMetricCard
          label="Active In-Progress"
          value={analytics.activeIncidents}
          subValue="requiring action"
          icon={Flame}
          variant="danger"
          trend={{ value: 'Live triage', isPositive: false }}
        />
        <StatMetricCard
          label="Avg Response Time"
          value={`${analytics.averageResponseTimeMinutes}m`}
          subValue="report to dispatch"
          icon={Clock}
          variant="warning"
          trend={{ value: 'Target < 5.0m', isPositive: true }}
        />
        <StatMetricCard
          label="Resolved Incidents"
          value={analytics.resolvedIncidents}
          subValue="successfully cleared"
          icon={ShieldCheck}
          variant="success"
          trend={{ value: '98.4% resolution rate', isPositive: true }}
        />
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Breakdown (7 cols) */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-white">
                Emergency Category Distribution
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">100% Volume</span>
          </div>

          <div className="space-y-3.5 pt-2">
            {categoryEntries.map(([cat, count]) => {
              const pct = analytics.totalIncidents > 0
                ? Math.round((count / analytics.totalIncidents) * 100)
                : 0;

              return (
                <div key={cat} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between text-slate-300 font-semibold">
                    <span>{cat}</span>
                    <span className="font-mono text-slate-400">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-red-500 via-amber-500 to-blue-500 transition-all duration-500"
                      style={{ width: `${(count / maxCategoryCount) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority & Department Summary (5 cols) */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-slate-800 space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-white">
              Urgency Severity Breakdown
            </h3>
            <p className="text-xs text-slate-400">Proportion of high vs medium priority reports</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 space-y-1">
              <span className="font-mono text-[10px] uppercase font-bold block">CRITICAL</span>
              <span className="text-2xl font-black text-white">
                {analytics.priorityDistribution?.CRITICAL || 0}
              </span>
              <p className="text-[10px] text-red-400">Immediate ALS Response</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-300 space-y-1">
              <span className="font-mono text-[10px] uppercase font-bold block">HIGH</span>
              <span className="text-2xl font-black text-white">
                {analytics.priorityDistribution?.HIGH || 0}
              </span>
              <p className="text-[10px] text-orange-400">Rapid Code 3 Dispatch</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-1">
              <span className="font-mono text-[10px] uppercase font-bold block">MEDIUM</span>
              <span className="text-2xl font-black text-white">
                {analytics.priorityDistribution?.MEDIUM || 0}
              </span>
              <p className="text-[10px] text-amber-400">Controlled Staging</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700 text-slate-300 space-y-1">
              <span className="font-mono text-[10px] uppercase font-bold block">LOW</span>
              <span className="text-2xl font-black text-white">
                {analytics.priorityDistribution?.LOW || 0}
              </span>
              <p className="text-[10px] text-slate-400">Routine Assistance</p>
            </div>
          </div>

          {/* Responder Fleet Status */}
          <div className="pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-300 font-semibold mb-2">
              <span>First Responder Fleet</span>
              <span className="text-emerald-400">
                {analytics.availableResponders} / {analytics.totalResponders} Available
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{
                  width: `${(analytics.availableResponders / Math.max(analytics.totalResponders, 1)) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Responder Rosters & Team Management */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-400" />
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-white">
              Registered Responder Units & Active Assignments
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Live Roster</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Badge #</th>
                <th className="py-3 px-3">Lead Officer / Medic</th>
                <th className="py-3 px-3">Department Division</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Assigned Incidents</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {responders.map((resp) => (
                <tr key={resp.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-blue-400">
                    {resp.badge_number}
                  </td>
                  <td className="py-3 px-3 font-semibold text-white">
                    {resp.profile?.full_name || 'Designated Responder'}
                  </td>
                  <td className="py-3 px-3 text-slate-300">
                    {resp.department}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        resp.is_available
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {resp.is_available ? 'Available' : 'Engaged On Scene'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-300">
                    {resp.assignedIncidentsCount ?? 1}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
