import React, { useState } from 'react';
import { Flame, Shield, ArrowRight, CheckCircle2, Lock, Mail, Activity, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { User } from '../types';

interface LoginPageProps {
  onLoginSuccess: (token: string, user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('hse@oil-demo.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const demoAccounts = [
    { role: 'HSE_OFFICER', title: 'Lead HSE Officer', email: 'hse@oil-demo.com', site: 'Duliajan Central Field' },
    { role: 'SITE_MANAGER', title: 'Asset Site Manager', email: 'manager@oil-demo.com', site: 'Moran Drilling Field' },
    { role: 'CORPORATE_HSE', title: 'Corporate HSE VP', email: 'corporate@oil-demo.com', site: 'All Assets (HQ)' },
    { role: 'ADMIN', title: 'System Admin', email: 'admin@oil-demo.com', site: 'Enterprise Operations' },
    { role: 'DATA_SCIENTIST', title: 'Safety ML Engineer', email: 'ds@oil-demo.com', site: 'Safety AI Labs' },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await api.login(email, password);
      localStorage.setItem('oil_sif_token', data.access_token);
      onLoginSuccess(data.access_token, data.user);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSwitch = async (role: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.demoSwitch(role);
      localStorage.setItem('oil_sif_token', data.access_token);
      onLoginSuccess(data.access_token, data.user);
    } catch (err: any) {
      setError(err.message || 'Role switch failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070B14] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 via-red-500 to-rose-600 shadow-xl shadow-amber-500/20 mb-4">
          <Flame className="w-9 h-9 text-white" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">OIL SIF SENTINEL</h2>
        <p className="mt-1 text-xs uppercase tracking-widest text-amber-400 font-bold">
          AI-Powered Serious Injury & Fatality Precursor Intelligence Platform
        </p>
        <p className="mt-2 text-xs text-slate-400 max-w-sm mx-auto">
          Transforming free-form Unsafe Acts, Conditions, and Near-Miss reports into proactive life-saving intelligence.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl z-10">
        <div className="bg-[#0C1222] py-8 px-6 shadow-2xl rounded-2xl border border-slate-800 sm:px-10">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400"></span>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Official Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-sm text-white focus:outline-none focus:border-sky-500 transition-colors"
                  placeholder="hse@oil-demo.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Access Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-sm text-white focus:outline-none focus:border-sky-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold uppercase tracking-wider transition-all duration-150 shadow-lg shadow-sky-900/40 flex items-center justify-center gap-2"
            >
              {loading ? 'Authenticating...' : 'Sign In to Safety Intelligence'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Switcher */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                SIH Hackathon Demo Quick Access
              </span>
              <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> 1-Click Role Login
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => handleDemoSwitch(acc.role)}
                  className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-sky-500/50 hover:bg-slate-850 text-left transition-all group"
                >
                  <div className="text-xs font-bold text-white group-hover:text-sky-300 flex items-center justify-between">
                    <span>{acc.title}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                      {acc.role}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">{acc.email}</div>
                  <div className="text-[10px] text-amber-400/80 mt-0.5">{acc.site}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-slate-400 text-xs">
          Oil India Limited Safety Intelligence Platform • SIH Problem Statement SIH26165
        </div>
      </div>
    </div>
  );
};
