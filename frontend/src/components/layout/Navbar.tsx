import React, { useState, useEffect } from 'react';
import { Bell, User, Search, Clock, LogOut, Globe } from 'lucide-react';
import { User as UserType } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';

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
  const { t, language, setLanguage, languages } = useLanguage();
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
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 px-5 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Left: PSU Branding & Search Prompt */}
      <div className="flex items-center gap-4">
        {/* Tricolor Accent Pill */}
        <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] text-slate-700">
          <div className="w-2.5 h-2.5 rounded-full overflow-hidden flex flex-col border border-slate-300">
            <div className="h-1/3 bg-[#FF9933]"></div>
            <div className="h-1/3 bg-white"></div>
            <div className="h-1/3 bg-[#138808]"></div>
          </div>
          <span className="font-bold tracking-wider uppercase text-amber-700">{t('common.oilIndiaLimited', 'OIL INDIA LIMITED')}</span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-500 font-mono text-[10px] font-semibold">{t('common.hseCommand', 'HSE COMMAND')}</span>
        </div>

        {/* Global Semantic Search Trigger */}
        <button
          onClick={onQuickSearch}
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-white border border-slate-200 hover:border-blue-400 text-xs text-slate-500 hover:text-slate-800 transition-all w-64 md:w-80 shadow-inner group"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
          <span className="truncate">{t('common.searchPlaceholder', "Semantic query (e.g. 'LOTO failures in Moran')...")}</span>
          <kbd className="ml-auto text-[10px] bg-white border border-slate-300 px-1.5 py-0.5 rounded text-slate-500 font-mono shadow-sm">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Center: Live Telemetry Ticker */}
      <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px]">
        <div className="flex items-center gap-1.5 text-slate-600">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          <span className="font-mono text-slate-800 font-bold">{timeStr || '11:45:00 IST'}</span>
          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
            {t('common.shift', 'SHIFT')} B
          </span>
        </div>

        <span className="text-slate-300">|</span>

        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-slate-500 text-[11px]">AI Model:</span>
          <span className="font-mono text-[11px] font-bold text-emerald-700">v1.12 (Recall 97.2%)</span>
        </div>
      </div>

      {/* Right: Controls & Role Persona Switcher */}
      <div className="flex items-center gap-2.5">
        {/* Language Switcher Dropdown */}
        <div className="flex items-center gap-1.5 bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200 px-2.5 py-1.5 rounded-lg shadow-sm transition-colors">
          <Globe className="w-3.5 h-3.5 text-blue-600" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            className="bg-transparent text-xs text-blue-900 font-bold focus:outline-none cursor-pointer tracking-wide"
            title={t('common.selectLanguage', 'Select Language')}
          >
            {languages.map((l) => (
              <option key={l.code} value={l.code} className="bg-white text-slate-900 font-medium">
                {l.flag} {l.nativeName} ({l.label})
              </option>
            ))}
          </select>
        </div>

        {/* Role Quick Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-lg shadow-sm">
          <User className="w-3.5 h-3.5 text-amber-600" />
          <span className="text-[11px] text-slate-500 font-semibold hidden sm:inline">{t('common.role', 'Role')}:</span>
          <select
            value={currentUser?.role || 'HSE_OFFICER'}
            onChange={(e) => onRoleSwitch(e.target.value)}
            className="bg-transparent text-xs text-slate-900 font-bold focus:outline-none cursor-pointer tracking-wide"
          >
            {roles.map((r) => (
              <option key={r.role} value={r.role} className="bg-white text-slate-900">
                {r.label} ({r.badge})
              </option>
            ))}
          </select>
        </div>

        {/* Alerts Bell */}
        <button
          onClick={onOpenAlerts}
          className="relative p-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 hover:text-slate-900 transition-all shadow-sm"
          title="Active Precursor Alerts"
        >
          <Bell className="w-4 h-4 text-slate-600" />
          {openAlertsCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-[10px] font-extrabold text-white flex items-center justify-center border-2 border-white animate-pulse shadow-md shadow-red-300">
              {openAlertsCount}
            </span>
          )}
        </button>

        {/* User Card */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-extrabold text-xs text-white shadow-sm border border-slate-200">
            {currentUser?.full_name ? currentUser.full_name[0] : 'U'}
          </div>
          <div className="text-left hidden md:block">
            <div className="text-xs font-bold text-slate-900 leading-tight">{currentUser?.full_name || 'R. K. Sharma'}</div>
            <div className="text-[10px] font-medium text-amber-700 flex items-center gap-1 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              {currentUser?.site || 'Duliajan Field'}
            </div>
          </div>
          <button
            onClick={onLogout}
            className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 ml-1 transition-colors"
            title="Sign Out of HSE Terminal"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
