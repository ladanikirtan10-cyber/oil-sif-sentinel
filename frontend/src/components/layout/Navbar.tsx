import React, { useState, useEffect } from 'react';
import { Shield, Bell, User, ChevronDown, Flame, Search, Clock, Cpu, LogOut, Radio } from 'lucide-react';
import { User as UserType } from '../../types';

interface NavbarProps {
  currentUser: UserType | null;
  onRoleSwitch: (role: string) => void;
  onQuickSearch: () => void;
  openAlertsCount: number;
  onOpenAlerts: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onRoleSwitch,
  onQuickSearch,
  openAlertsCount,
  onOpenAlerts,
  onLogout,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }) + ' IST'
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const roles = [
    { role: 'HSE_OFFICER', label: 'Lead HSE Officer', badge: 'FIELD OPS' },
    { role: 'SITE_MANAGER', label: 'Asset Site Manager', badge: 'ASSET LEAD' },
    { role: 'CORPORATE_HSE', label: 'Corporate HSE VP', badge: 'EXECUTIVE' },
    { role: 'ADMIN', label: 'System Administrator', badge: 'ROOT ADMIN' },
    { role: 'DATA_SCIENTIST', label: 'Safety ML Engineer', badge: 'AI LABS' },
  ];

  return (
    <header className="h-16 bg-[#090E1A]/95 backdrop-blur-md border-b border-slate-800/80 px-5 flex items-center justify-between sticky top-0 z-30 shadow-md shadow-black/40">
      {/* Left: PSU Branding & Search Prompt */}
      <div className="flex items-center gap-4">
        {/* Tricolor Accent Pill */}
        <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300">
          <div className="w-2.5 h-2.5 rounded-full overflow-hidden flex flex-col border border-slate-700">
            <div className="h-1/3 bg-[#FF9933]"></div>
            <div className="h-1/3 bg-white"></div>
            <div className="h-1/3 bg-[#138808]"></div>
          </div>
          <span className="font-bold tracking-wider uppercase text-amber-400">OIL INDIA LIMITED</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400 font-mono text-[10px]">HSE COMMAND</span>
        </div>

        {/* Global Semantic Search Trigger */}
        <button
          onClick={onQuickSearch}
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg bg-slate-900/90 border border-slate-700/70 text-xs text-slate-400 hover:border-sky-500/70 hover:text-slate-200 transition-all w-64 md:w-80 shadow-inner group"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-400 transition-colors" />
          <span className="truncate">Semantic query (e.g. 'LOTO failures in Moran')...</span>
          <kbd className="ml-auto text-[10px] bg-slate-800/90 border border-slate-700/60 px-1.5 py-0.5 rounded text-slate-400 font-mono">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Center: Live Telemetry Ticker (Hidden on small screens) */}
      <div className="hidden lg:flex items-center gap-3 px-3 py-1 rounded-lg bg-slate-950/60 border border-slate-800/80 text-[11px]">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-mono text-slate-300 font-semibold">{timeStr || '11:45:00 IST'}</span>
          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            SHIFT B
          </span>
        </div>

        <span className="text-slate-700">|</span>

        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-slate-400 text-[11px]">AI Model:</span>
          <span className="font-mono text-[11px] font-semibold text-emerald-400">v1.10 (Recall 97.2%)</span>
        </div>
      </div>

      {/* Right: Controls & Role Persona Switcher */}
      <div className="flex items-center gap-3">
        {/* Role Quick Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/70 px-2.5 py-1.5 rounded-lg shadow-sm">
          <User className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">Role:</span>
          <select
            value={currentUser?.role || 'HSE_OFFICER'}
            onChange={(e) => onRoleSwitch(e.target.value)}
            className="bg-transparent text-xs text-amber-300 font-bold focus:outline-none cursor-pointer tracking-wide"
          >
            {roles.map((r) => (
              <option key={r.role} value={r.role} className="bg-slate-900 text-slate-200">
                {r.label} ({r.badge})
              </option>
            ))}
          </select>
        </div>

        {/* Alerts Bell */}
        <button
          onClick={onOpenAlerts}
          className="relative p-2.5 rounded-lg bg-slate-900/90 border border-slate-700/70 text-slate-300 hover:text-white hover:border-red-500/50 transition-all shadow-sm"
          title="Active Precursor Alerts"
        >
          <Bell className="w-4 h-4 text-slate-300" />
          {openAlertsCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-[10px] font-extrabold text-white flex items-center justify-center border-2 border-[#090E1A] animate-pulse shadow-md shadow-red-950/80">
              {openAlertsCount}
            </span>
          )}
        </button>

        {/* User Card */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-extrabold text-xs text-white shadow-md border border-white/20">
            {currentUser?.full_name ? currentUser.full_name[0] : 'U'}
          </div>
          <div className="text-left hidden md:block">
            <div className="text-xs font-bold text-white leading-tight">{currentUser?.full_name || 'R. K. Sharma'}</div>
            <div className="text-[10px] font-medium text-amber-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              {currentUser?.site || 'Duliajan Field'}
            </div>
          </div>
          <button
            onClick={onLogout}
            className="p-1.5 rounded-md text-slate-400 hover:text-red-400 hover:bg-red-950/30 ml-1 transition-colors"
            title="Sign Out of HSE Terminal"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
