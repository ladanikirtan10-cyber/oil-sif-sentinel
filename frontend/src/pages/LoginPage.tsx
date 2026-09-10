import React, { useState } from 'react';
import { Flame, Shield, ArrowRight, CheckCircle2, Lock, Mail, Activity, Sparkles, Key, Radio, Layers } from 'lucide-react';
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
    { role: 'HSE_OFFICER', title: 'Lead HSE Officer', email: 'hse@oil-demo.com', site: 'Duliajan Central Field', color: 'from-emerald-500 to-teal-700', badge: 'OPERATIONAL' },
    { role: 'SITE_MANAGER', title: 'Asset Site Manager', email: 'manager@oil-demo.com', site: 'Moran Drilling Field', color: 'from-blue-500 to-indigo-700', badge: 'ASSET LEAD' },
    { role: 'CORPORATE_HSE', title: 'Corporate HSE VP', email: 'corporate@oil-demo.com', site: 'All Assets (HQ)', color: 'from-purple-500 to-indigo-800', badge: 'EXECUTIVE' },
    { role: 'ADMIN', title: 'System Administrator', email: 'admin@oil-demo.com', site: 'Enterprise Operations', color: 'from-amber-500 to-orange-700', badge: 'ROOT ADMIN' },
    { role: 'DATA_SCIENTIST', title: 'Safety ML Engineer', email: 'ds@oil-demo.com', site: 'Safety AI Labs', color: 'from-cyan-500 to-sky-700', badge: 'AI & NLP' },
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
      setError(err.message || 'Authentication failed. Please verify your credentials.');
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
      setError(err.message || 'Instant demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060A12] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-amber-500/30">
      {/* Tricolor top header stripe */}
      <div className="fixed top-0 inset-x-0 h-1 bg-gradient-to-r from-[#FF9933] via-white to-[#138808] z-50 shadow-md"></div>

      {/* Atmospheric ambient glows */}
      <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-sky-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center z-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-red-600 shadow-xl shadow-amber-500/20 border border-amber-300/40 mb-3">
          <Flame className="w-9 h-9 text-slate-950 fill-slate-950" />
        </div>

        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-[10px] font-bold text-amber-400 tracking-wider uppercase">
            Oil India Limited • Navratna PSU
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-red-950/80 border border-red-500/50 text-[10px] font-mono font-bold text-red-400 tracking-wider">
            SIH26165
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          OIL SIF SENTINEL
        </h1>
        <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-300">
          AI Precursor Intelligence & Life-Saving Rules Platform
        </p>
        <p className="mt-2 text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
          Proactive industrial safety intelligence analyzing unstructured field observations across Duliajan, Moran, Digboi, Naharkatiya, and offshore terminal operations.
        </p>
      </div>

      {/* Card Container */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-2xl z-10">
        <div className="glass-card py-8 px-6 shadow-2xl rounded-2xl border border-slate-800 sm:px-10 relative overflow-hidden">
          {/* Top highlight */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />

          {/* Security Clearance Header */}
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-slate-200 tracking-wide">ENTERPRISE HSE ACCESS CONTROL</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
              RESTRICTED SYSTEM
            </span>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-950/70 border border-red-500/60 text-red-300 text-xs flex items-center gap-2.5 shadow-md">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
              <span className="font-semibold">{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Work Email (UID)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/40 transition-all font-mono"
                    placeholder="hse@oil-demo.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Access Key (Password)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/40 transition-all font-mono"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all duration-150 shadow-lg shadow-amber-950/50 flex items-center justify-center gap-2 mt-2 active:scale-[0.99]"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                  Authenticating Session...
                </span>
              ) : (
                <>
                  <span>Enter HSE Intelligence Terminal</span>
                  <ArrowRight className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Switcher */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-[11px] font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                SIH Hackathon 1-Click Role Login
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Password: <strong className="text-slate-200">password123</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => handleDemoSwitch(acc.role)}
                  className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/60 hover:bg-slate-850 text-left transition-all group relative overflow-hidden shadow-sm"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-white group-hover:text-amber-300 transition-colors truncate">
                      {acc.title}
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                      {acc.badge}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate font-mono">{acc.email}</div>
                  <div className="text-[10px] text-amber-400/90 font-medium truncate mt-0.5">{acc.site}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-5 text-center text-slate-400 text-xs flex items-center justify-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>FastAPI + SQLite Active</span>
          </span>
          <span>•</span>
          <span>7 Field Assets</span>
          <span>•</span>
          <span>273 Verified Records</span>
        </div>
      </div>
    </div>
  );
};
