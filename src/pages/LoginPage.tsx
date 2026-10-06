import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldAlert,
  Lock,
  Mail,
  Users,
  Radio,
  Shield,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, loginAsDemoRole, isLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const loggedUser = await login(email, password);
      if (loggedUser.role === 'CITIZEN') navigate('/dashboard');
      else if (loggedUser.role === 'RESPONDER') navigate('/responder');
      else if (loggedUser.role === 'ADMIN') navigate('/admin');
      else navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.message || err?.message || 'Login failed. Try using a Demo Account.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async (role: 'CITIZEN' | 'RESPONDER' | 'ADMIN') => {
    setErrorMsg(null);
    try {
      const loggedUser = await loginAsDemoRole(role);
      if (loggedUser.role === 'CITIZEN') navigate('/dashboard');
      else if (loggedUser.role === 'RESPONDER') navigate('/responder');
      else if (loggedUser.role === 'ADMIN') navigate('/admin');
    } catch (err: any) {
      setErrorMsg('Demo login failed: ' + err.message);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 items-center justify-center shadow-lg shadow-red-600/30 mb-2">
            <ShieldAlert className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Access RescuOS</h1>
          <p className="text-xs text-slate-400">
            Sign in to access your emergency response dispatch console
          </p>
        </div>

        {/* Demo Fast Preset Card */}
        <div className="glass-panel p-4 rounded-2xl border border-indigo-500/30 bg-indigo-950/20 space-y-2.5 shadow-xl">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-indigo-300 uppercase tracking-wider text-[11px]">
              Demo Accounts (1-Click Access)
            </span>
            <span className="text-[10px] text-slate-400">Pre-authenticated</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('CITIZEN')}
              className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-emerald-500/20 border border-slate-700 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-300 text-xs font-semibold flex flex-col items-center justify-center space-y-1 transition-all"
            >
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Citizen</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('RESPONDER')}
              className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-blue-500/20 border border-slate-700 hover:border-blue-500/40 text-slate-300 hover:text-blue-300 text-xs font-semibold flex flex-col items-center justify-center space-y-1 transition-all"
            >
              <Radio className="w-4 h-4 text-blue-400" />
              <span>Responder</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('ADMIN')}
              className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-purple-500/20 border border-slate-700 hover:border-purple-500/40 text-slate-300 hover:text-purple-300 text-xs font-semibold flex flex-col items-center justify-center space-y-1 transition-all"
            >
              <Shield className="w-4 h-4 text-purple-400" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {/* Form Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-red-600/25 transition-all disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Verifying Credentials...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-3 border-t border-slate-800 text-center text-xs text-slate-400">
            Need a citizen account?{' '}
            <Link to="/register" className="text-red-400 hover:text-red-300 font-bold">
              Register New Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
