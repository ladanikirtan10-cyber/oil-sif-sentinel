import React from 'react';
import { Shield, Bell, User, ChevronDown, Flame, Search } from 'lucide-react';
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
  const roles = [
    { role: 'HSE_OFFICER', label: 'Lead HSE Officer' },
    { role: 'SITE_MANAGER', label: 'Asset Site Manager' },
    { role: 'CORPORATE_HSE', label: 'Corporate HSE VP' },
    { role: 'ADMIN', label: 'System Administrator' },
    { role: 'DATA_SCIENTIST', label: 'Lead Safety ML Engineer' },
  ];

  return (
    <header className="h-14 bg-[#0A0F1D]/90 backdrop-blur border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left Search Prompt */}
      <div className="flex items-center gap-4">
        <button
          onClick={onQuickSearch}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/60 text-xs text-slate-400 hover:border-slate-500 transition-all w-72"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="truncate">Semantic query (e.g. 'LOTO failures in Moran')...</span>
          <kbd className="ml-auto text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">Ctrl K</kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Role Quick Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/60 px-2 py-1 rounded-lg">
          <span className="text-[11px] text-slate-400 font-medium">Role:</span>
          <select
            value={currentUser?.role || 'HSE_OFFICER'}
            onChange={(e) => onRoleSwitch(e.target.value)}
            className="bg-transparent text-xs text-amber-400 font-semibold focus:outline-none cursor-pointer"
          >
            {roles.map((r) => (
              <option key={r.role} value={r.role} className="bg-slate-900 text-slate-200">
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {/* Alerts Bell */}
        <button
          onClick={onOpenAlerts}
          className="relative p-2 rounded-lg bg-slate-900 border border-slate-700/60 text-slate-300 hover:text-white transition-all"
          title="Active Alerts"
        >
          <Bell className="w-4 h-4" />
          {openAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center animate-bounce">
              {openAlertsCount}
            </span>
          )}
        </button>

        {/* User Card */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow-md">
            {currentUser?.full_name ? currentUser.full_name[0] : 'U'}
          </div>
          <div className="text-left hidden md:block">
            <div className="text-xs font-semibold text-white leading-tight">{currentUser?.full_name || 'HSE Officer'}</div>
            <div className="text-[10px] text-slate-400">{currentUser?.site || 'Duliajan'}</div>
          </div>
          <button
            onClick={onLogout}
            className="text-[11px] text-slate-400 hover:text-red-400 ml-1 transition-colors"
            title="Sign Out"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
};
