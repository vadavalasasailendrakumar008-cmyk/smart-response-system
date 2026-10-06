import React, { useState, useEffect } from 'react';
import { incidentApi } from '../services/api';
import { subscribeToEmergencyRealtime } from '../services/realtime';
import { EmergencyIncident, IncidentStatus, PriorityLevel, EmergencyCategory } from '../shared/types';
import { StatMetricCard } from '../components/dashboard/StatMetricCard';
import { IncidentFilterBar } from '../components/dashboard/IncidentFilterBar';
import { ResponderActionModal } from '../components/dashboard/ResponderActionModal';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import {
  Radio,
  Truck,
  CheckCircle,
  AlertTriangle,
  Flame,
  Users,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  Shield,
  Activity,
  Layers,
} from 'lucide-react';

const createPriorityPin = (priority: PriorityLevel) => {
  const color = {
    CRITICAL: '#ef4444',
    HIGH: '#f97316',
    MEDIUM: '#f59e0b',
    LOW: '#64748b',
  }[priority];

  return L.divIcon({
    className: 'responder-map-pin',
    html: `
      <div style="position: relative; width: 32px; height: 32px;">
        <div style="position: absolute; inset: 0; background: ${color}; border-radius: 50%; opacity: 0.4; animation: ping 1.5s infinite;"></div>
        <div style="position: relative; width: 32px; height: 32px; background: ${color}; border: 2.5px solid #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">
          <span style="color: white; font-size: 11px; font-weight: bold; font-family: monospace;">!</span>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

export const ResponderDashboard: React.FC = () => {
  const [incidents, setIncidents] = useState<EmergencyIncident[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedIncident, setSelectedIncident] = useState<EmergencyIncident | null>(null);
  const [actionModalIncident, setActionModalIncident] = useState<EmergencyIncident | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [viewMode, setViewMode] = useState<'feed' | 'map'>('feed');

  const fetchIncidents = async () => {
    try {
      const data = await incidentApi.list({
        status: selectedStatus,
        priority: selectedPriority,
        category: selectedCategory,
        search: searchQuery,
      });
      setIncidents(data.incidents);
      if (!selectedIncident && data.incidents.length > 0) {
        setSelectedIncident(data.incidents[0]);
      }
    } catch (e) {
      console.warn('Failed to fetch incidents:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();

    // Subscribe to Realtime updates
    const unsubscribe = subscribeToEmergencyRealtime({
      onIncidentCreated: (newInc) => {
        setIncidents((prev) => [newInc, ...prev]);
      },
      onIncidentUpdated: ({ incident: updated }) => {
        setIncidents((prev) =>
          prev.map((i) => (i.id === updated.id ? { ...i, ...updated } : i))
        );
        setSelectedIncident((prev) => (prev?.id === updated.id ? updated : prev));
      },
      onStatusChanged: () => {
        fetchIncidents();
      },
    });

    return () => unsubscribe();
  }, [searchQuery, selectedPriority, selectedCategory, selectedStatus]);

  // Quick Action Handler for instant button triggers
  const handleQuickAction = async (incident: EmergencyIncident, newStatus: IncidentStatus, notes: string) => {
    try {
      const res = await incidentApi.updateStatus(incident.id, {
        status: newStatus,
        notes,
      });
      setIncidents((prev) =>
        prev.map((i) => (i.id === incident.id ? { ...i, ...res.incident } : i))
      );
      if (selectedIncident?.id === incident.id) {
        setSelectedIncident(res.incident);
      }
    } catch (e: any) {
      alert('Action failed: ' + (e?.response?.data?.message || e.message));
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedPriority('ALL');
    setSelectedCategory('ALL');
    setSelectedStatus('ALL');
  };

  // Metrics
  const criticalCount = incidents.filter((i) => i.priority === 'CRITICAL').length;
  const activeCount = incidents.filter((i) => i.status !== 'Resolved' && i.status !== 'Cancelled').length;
  const enRouteCount = incidents.filter((i) => i.status === 'Responder En Route').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Console Header */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            <span>First Responder Triage Desk</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Live Incident Command Grid</h1>
          <p className="text-xs text-slate-400">
            Real-time multi-agency dispatch feed • San Francisco Metropolitan Sector
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center space-x-2 bg-slate-900/90 p-1 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => setViewMode('feed')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'feed'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Incident Feed
          </button>
          <button
            type="button"
            onClick={() => setViewMode('map')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'map'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Geospatial Radar Map
          </button>
        </div>
      </div>

      {/* KPI Count Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatMetricCard
          label="Active Incidents"
          value={activeCount}
          subValue="requiring dispatch"
          icon={Activity}
          variant="primary"
          trend={{ value: 'Live Queue', isPositive: true }}
        />
        <StatMetricCard
          label="Critical Urgency"
          value={criticalCount}
          subValue="immediate life hazard"
          icon={Flame}
          variant="danger"
          trend={{ value: '< 5 min target', isPositive: false }}
        />
        <StatMetricCard
          label="Units En Route"
          value={enRouteCount}
          subValue="code 3 sirens"
          icon={Truck}
          variant="warning"
          trend={{ value: 'Active traversal', isNeutral: true }}
        />
      </div>

      {/* Filter Toolbar */}
      <IncidentFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedPriority={selectedPriority}
        onPriorityChange={setSelectedPriority}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        onReset={handleResetFilters}
      />

      {/* View Mode: Map Radar View */}
      {viewMode === 'map' && (
        <div className="glass-panel p-4 rounded-3xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-2">
            <span className="font-bold text-white uppercase tracking-wider">
              Live Tactical GPS Incident Cluster ({incidents.length} pins)
            </span>
            <span className="font-mono text-[11px]">CartoDB Dark Matter Grid</span>
          </div>

          <div className="h-[520px] rounded-2xl overflow-hidden border border-slate-700/80">
            <MapContainer
              center={[37.7749, -122.4194]}
              zoom={13}
              className="w-full h-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
              {incidents.map((inc) => (
                <Marker
                  key={inc.id}
                  position={[inc.latitude, inc.longitude]}
                  icon={createPriorityPin(inc.priority)}
                >
                  <Popup>
                    <div className="font-sans space-y-1">
                      <span className="font-bold text-xs text-white block">{inc.title}</span>
                      <span className="text-[11px] text-red-400 font-bold block">{inc.priority} - {inc.category}</span>
                      <span className="text-[11px] text-slate-300 block">{inc.address_text}</span>
                      <button
                        onClick={() => setActionModalIncident(inc)}
                        className="mt-2 w-full py-1 rounded bg-blue-600 text-white font-bold text-[10px]"
                      >
                        Open Action Desk
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      )}

      {/* View Mode: Split Feed View */}
      {viewMode === 'feed' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Incident Cards Feed (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span className="font-bold text-slate-300 uppercase tracking-wider">
                Incoming Emergency Queue ({incidents.length})
              </span>
              <span className="text-[11px] font-mono">Sorted by Urgency</span>
            </div>

            {incidents.length === 0 ? (
              <div className="glass-panel p-12 rounded-2xl text-center text-slate-400 text-xs">
                No incidents matching the active filter criteria.
              </div>
            ) : (
              incidents.map((inc) => {
                const isSelected = selectedIncident?.id === inc.id;
                const priorityBorder = {
                  CRITICAL: 'border-l-4 border-l-red-500',
                  HIGH: 'border-l-4 border-l-orange-500',
                  MEDIUM: 'border-l-4 border-l-amber-500',
                  LOW: 'border-l-4 border-l-slate-500',
                }[inc.priority];

                return (
                  <div
                    key={inc.id}
                    onClick={() => setSelectedIncident(inc)}
                    className={`glass-panel p-4 rounded-2xl border transition-all cursor-pointer ${priorityBorder} ${
                      isSelected
                        ? 'bg-slate-800/90 border-blue-500 shadow-xl'
                        : 'border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-0.2 rounded text-[10px] font-black uppercase tracking-wider ${
                              inc.priority === 'CRITICAL'
                                ? 'bg-red-500/20 text-red-400'
                                : inc.priority === 'HIGH'
                                ? 'bg-orange-500/20 text-orange-400'
                                : 'bg-amber-500/20 text-amber-400'
                            }`}
                          >
                            {inc.priority}
                          </span>
                          <span className="text-[11px] font-bold text-slate-300">
                            {inc.category}
                          </span>
                        </div>
                        <h3 className="font-bold text-sm text-white">{inc.title}</h3>
                      </div>

                      <span className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-700 text-[10px] font-semibold text-slate-300 shrink-0">
                        {inc.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                      {inc.description}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
                      <div className="flex items-center space-x-1.5 truncate max-w-xs">
                        <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        <span className="truncate">{inc.address_text}</span>
                      </div>

                      <div className="flex items-center space-x-1 font-mono text-slate-500">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(inc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right: Selected Incident Telemetry & Quick Action Desk (5 cols) */}
          <div className="lg:col-span-5">
            {selectedIncident ? (
              <div className="glass-panel-elevated p-6 rounded-3xl border border-slate-700 space-y-5 sticky top-20 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      Selected Incident Telemetry
                    </span>
                    <h2 className="text-base font-extrabold text-white">
                      #{selectedIncident.id.slice(-6)}: {selectedIncident.category}
                    </h2>
                  </div>

                  <button
                    onClick={() => setActionModalIncident(selectedIncident)}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-blue-600/30 transition-colors"
                  >
                    <span>Full Action Desk</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Priority & Victims Stats */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block text-[10px] uppercase">Assessed Priority</span>
                    <span className="font-extrabold text-red-400 text-sm">{selectedIncident.priority}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block text-[10px] uppercase">Affected Victims</span>
                    <span className="font-extrabold text-white text-sm">
                      {selectedIncident.affected_people_count} Person(s)
                    </span>
                  </div>
                </div>

                {/* Location Box */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center space-x-1.5 font-bold text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-red-400" />
                    <span>Coordinates & Landmark</span>
                  </div>
                  <p className="text-slate-400">{selectedIncident.address_text}</p>
                  <p className="font-mono text-[10px] text-slate-500">
                    LAT: {selectedIncident.latitude.toFixed(5)} | LNG: {selectedIncident.longitude.toFixed(5)}
                  </p>
                </div>

                {/* AI Reasoning Preview */}
                {selectedIncident.ai_priority_reasoning && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1">
                    <div className="flex items-center space-x-1.5 font-bold text-amber-300">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Gemini AI Priority Rationale</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {selectedIncident.ai_priority_reasoning}
                    </p>
                  </div>
                )}

                {/* Reporter Contact Info */}
                {selectedIncident.reporter && (
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                    <span className="text-slate-400 font-bold block">Witness / Reporter Info:</span>
                    <p className="text-white font-medium">{selectedIncident.reporter.full_name}</p>
                    <p className="text-slate-400 font-mono text-[11px]">{selectedIncident.reporter.phone}</p>
                  </div>
                )}

                {/* Quick 1-Click Status Dispatch Actions */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Quick Operational Actions:
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => handleQuickAction(selectedIncident, 'Under Review', 'Dispatcher acknowledged incident and initiated unit query.')}
                      className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold flex items-center justify-center space-x-1.5 transition-colors"
                    >
                      <Radio className="w-3.5 h-3.5 text-blue-400" />
                      <span>Acknowledge</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickAction(selectedIncident, 'Responder En Route', 'Tactical unit dispatched code 3 sirens.')}
                      className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center justify-center space-x-1.5 shadow-lg shadow-blue-600/30 transition-colors"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Dispatch Unit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickAction(selectedIncident, 'Assistance Arrived', 'First responder unit arrived on scene.')}
                      className="p-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-bold flex items-center justify-center space-x-1.5 transition-colors"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span>Unit Arrived</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickAction(selectedIncident, 'Resolved', 'Scene secured and medical transport completed.')}
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold flex items-center justify-center space-x-1.5 transition-colors"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Mark Resolved</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-panel p-12 rounded-3xl text-center text-slate-400 text-xs">
                Select an incident from the feed to view real-time telemetry.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Responder Action Modal */}
      <ResponderActionModal
        isOpen={Boolean(actionModalIncident)}
        incident={actionModalIncident}
        onClose={() => setActionModalIncident(null)}
        onSuccess={(updated) => {
          setIncidents((prev) =>
            prev.map((i) => (i.id === updated.id ? { ...i, ...updated } : i))
          );
          if (selectedIncident?.id === updated.id) {
            setSelectedIncident(updated);
          }
        }}
      />
    </div>
  );
};
