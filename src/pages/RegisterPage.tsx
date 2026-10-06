import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import {
  ShieldAlert,
  User,
  Mail,
  Lock,
  Phone,
  HeartHandshake,
  ArrowRight,
  AlertCircle,
  Building,
} from 'lucide-react';
import { UserRole } from '../shared/types';

export const RegisterPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    role: 'CITIZEN' as UserRole,
    department: '',
    badgeNumber: '',
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.password || !formData.phone) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await authApi.register(formData);
      localStorage.setItem('rescuos_token', res.token);
      await login(formData.email, formData.password);

      if (formData.role === 'RESPONDER') {
        navigate('/responder');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.message || err?.message || 'Registration failed. Please check your data.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 items-center justify-center shadow-lg shadow-red-600/30 mb-2">
            <ShieldAlert className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Register Citizen Profile</h1>
          <p className="text-xs text-slate-400">
            Emergency telemetry and medical contacts sync with 911 dispatch
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider text-slate-400">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Jane Doe"
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider text-slate-400">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="jane@example.com"
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider text-slate-400">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider text-slate-400">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min 8 characters"
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contact Info */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <span className="font-bold text-slate-300 flex items-center space-x-1.5">
                <HeartHandshake className="w-4 h-4 text-rose-400" />
                <span>Next-of-Kin / Emergency Contact</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleChange}
                  placeholder="Contact Name (e.g. John Doe - Spouse)"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />

                <input
                  type="tel"
                  name="emergencyContactPhone"
                  value={formData.emergencyContactPhone}
                  onChange={handleChange}
                  placeholder="Contact Phone Number"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            {/* Account Role Selector */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <label className="font-bold uppercase tracking-wider text-slate-400">
                Registering As:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'CITIZEN' })}
                  className={`p-2.5 rounded-xl border font-semibold flex items-center justify-center space-x-2 transition-all ${
                    formData.role === 'CITIZEN'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <span>Citizen Reporter</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'RESPONDER' })}
                  className={`p-2.5 rounded-xl border font-semibold flex items-center justify-center space-x-2 transition-all ${
                    formData.role === 'RESPONDER'
                      ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <span>First Responder</span>
                </button>
              </div>

              {formData.role === 'RESPONDER' && (
                <div className="grid grid-cols-2 gap-2 pt-2 animate-fade-in">
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="Department (e.g. Fire & Rescue)"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500"
                  />
                  <input
                    type="text"
                    name="badgeNumber"
                    value={formData.badgeNumber}
                    onChange={handleChange}
                    placeholder="Badge # (e.g. R-902)"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-red-600/25 transition-all disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Registering Account...' : 'Create RescuOS Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-red-400 hover:text-red-300 font-bold">
              Sign In Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
