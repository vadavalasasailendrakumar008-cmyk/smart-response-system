import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldAlert,
  Radio,
  Bell,
  Volume2,
  VolumeX,
  User,
  LogOut,
  ChevronDown,
  BookOpen,
  LayoutDashboard,
  Siren,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { audioAlerts, incidentApi } from '../../services/api';
import { NotificationItem } from '../../shared/types';

export const Header: React.FC = () => {
  const { user, logout, unreadCount, decrementUnread, audioEnabled, setAudioEnabled } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const toggleAudio = () => {
    const nextState = !audioEnabled;
    setAudioEnabled(nextState);
    audioAlerts.enabled = nextState;
    if (nextState) {
      audioAlerts.playSuccessChime();
    }
  };

  const handleOpenNotifications = async () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      setLoadingNotifications(true);
      try {
        const res = await incidentApi.getNotifications();
        setNotifications(res.notifications);
      } catch (e) {
        // ignore
      } finally {
        setLoadingNotifications(false);
      }
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await incidentApi.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      decrementUnread();
    } catch (e) {
      // ignore
    }
  };

  const roleBadgeColor = {
    CITIZEN: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    RESPONDER: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    ADMIN: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  }[user?.role || 'CITIZEN'];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-[#070a12]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Live Ticker */}
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-red-500/25 group-hover:scale-105 transition-transform duration-200">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-white font-sans">
                  Rescu<span className="text-red-500">OS</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                  911 AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Smart Emergency Response Grid</p>
            </div>
          </Link>

          {/* Real-time Heartbeat indicator */}
          <div className="hidden md:flex items-center space-x-2 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-mono text-[11px] text-slate-400">DISPATCH GRID: ONLINE</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-1 text-sm font-medium">
          <Link
            to="/report"
            className={`px-3 py-1.5 rounded-lg flex items-center space-x-2 transition-colors ${
              location.pathname === '/report'
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Siren className="w-4 h-4 text-red-500 animate-pulse" />
            <span>Trigger SOS</span>
          </Link>

          <Link
            to="/dashboard"
            className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-colors ${
              location.pathname === '/dashboard'
                ? 'bg-slate-800 text-white'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Citizen Tracking</span>
          </Link>

          <Link
            to="/responder"
            className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-colors ${
              location.pathname === '/responder'
                ? 'bg-slate-800 text-white'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Radio className="w-4 h-4 text-blue-400" />
            <span>Responder Console</span>
          </Link>

          <Link
            to="/admin"
            className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-colors ${
              location.pathname === '/admin'
                ? 'bg-slate-800 text-white'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-purple-400" />
            <span>Admin Metrics</span>
          </Link>

          <Link
            to="/safety"
            className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-colors ${
              location.pathname === '/safety'
                ? 'bg-slate-800 text-white'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>Survival Guides</span>
          </Link>
        </nav>

        {/* Right Action Tools & Auth */}
        <div className="flex items-center space-x-3">
          {/* Audio Siren Toggle */}
          <button
            onClick={toggleAudio}
            title={audioEnabled ? 'Siren Audio Active (Click to Mute)' : 'Siren Audio Muted (Click to Enable)'}
            className={`p-2 rounded-lg border transition-colors ${
              audioEnabled
                ? 'bg-slate-800/80 border-slate-700 text-amber-400 hover:bg-slate-800'
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-400'
            }`}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={handleOpenNotifications}
              className="p-2 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 relative transition-colors"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl glass-panel-elevated p-3 border border-slate-700 shadow-2xl z-50">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                  <div className="flex items-center space-x-2">
                    <Bell className="w-4 h-4 text-red-400" />
                    <span className="font-semibold text-sm text-white">Emergency Dispatches</span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">Live Feeds</span>
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2">
                  {loadingNotifications ? (
                    <p className="text-xs text-slate-400 text-center py-4">Loading real-time logs...</p>
                  ) : notifications.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">No active notifications</p>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => handleMarkAsRead(notif.id)}
                        className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                          notif.is_read
                            ? 'bg-slate-900/40 border-slate-800 text-slate-400'
                            : 'bg-red-500/10 border-red-500/30 text-slate-200 hover:bg-red-500/15'
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold text-white mb-1">
                          <span className="truncate">{notif.title}</span>
                          {!notif.is_read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                          )}
                        </div>
                        <p className="text-slate-300 leading-relaxed">{notif.message}</p>
                        <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500">
                          <span>{new Date(notif.created_at).toLocaleTimeString()}</span>
                          {!notif.is_read && <span className="text-emerald-400 font-medium">Click to mark read</span>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile / Role Pill */}
          {user ? (
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
              <div className="hidden sm:block text-right">
                <div className="text-xs font-semibold text-white truncate max-w-[120px]">
                  {user.full_name}
                </div>
                <div className="flex items-center justify-end space-x-1">
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${roleBadgeColor}`}
                  >
                    {user.role}
                  </span>
                </div>
              </div>

              <button
                onClick={logout}
                title="Sign Out"
                className="p-2 rounded-lg bg-slate-800/60 hover:bg-red-500/20 hover:text-red-400 border border-slate-700/80 text-slate-300 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 hover:text-white border border-slate-700"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
