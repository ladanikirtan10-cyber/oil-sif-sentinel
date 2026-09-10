sidebar_code = """import React from 'react';
import { 
  LayoutDashboard, FileText, PlusCircle, CheckSquare, Zap, Shield, 
  BarChart3, AlertTriangle, Search, Bot, Activity, UploadCloud, Users, 
  Settings, Flame, ChevronRight
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  openAlertsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, openAlertsCount }) => {
  const navItems = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'reports', label: 'Safety Reports', icon: FileText },
    { id: 'new-report', label: 'New Report & AI Studio', icon: PlusCircle, highlight: true },
    { id: 'review-queue', label: 'AI Review Queue', icon: CheckSquare },
    { id: 'precursors', label: 'Precursor Intelligence', icon: Zap },
    { id: 'rules', label: 'Life-Saving Rules', icon: Shield },
    { id: 'analytics', label: 'Sites & Activities', icon: BarChart3 },
    { id: 'alerts', label: 'Alert Center', icon: AlertTriangle, badge: openAlertsCount },
    { id: 'search', label: 'Semantic Search', icon: Search },
    { id: 'assistant', label: 'AI Safety Assistant', icon: Bot, isNew: true },
    { id: 'models', label: 'Model Performance', icon: Activity },
    { id: 'import', label: 'Data Management', icon: UploadCloud },
    { id: 'admin', label: 'User & Audit Logs', icon: Users },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0A0F1D] border-r border-slate-800/80 flex flex-col h-screen select-none sticky top-0">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 via-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
          <Flame className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="font-extrabold text-sm tracking-wider text-white">OIL SIF SENTINEL</h1>
          </div>
          <p className="text-[11px] font-medium text-amber-400/90 tracking-wide uppercase">Precursor Intelligence</p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        <div className="px-3 pb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Safety Operations
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md shadow-sky-900/30'
                  : item.highlight
                  ? 'text-amber-300 hover:bg-amber-950/30 border border-amber-500/30'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              <div className="flex items-center gap-1">
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
                    {item.badge}
                  </span>
                )}
                {item.isNew && (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    RAG
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </nav>

      {/* System Status Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-[#070B14]/80">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-emerald-400 font-semibold">Engine Active</span>
          </span>
          <span className="font-mono text-[10px] text-slate-400">v1.4-prod</span>
        </div>
        <div className="text-[10px] text-slate-400 truncate">
          OIL Asset Intelligence Platform
        </div>
      </div>
    </aside>
  );
};
"""

navbar_code = """import React from 'react';
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
"""

app_layout_code = """import React from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { User } from '../../types';

interface AppLayoutProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  currentUser: User | null;
  onRoleSwitch: (role: string) => void;
  openAlertsCount: number;
  onLogout: () => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onRoleSwitch,
  openAlertsCount,
  onLogout,
  children,
}) => {
  return (
    <div className="flex min-h-screen bg-[#070B14]">
      <Sidebar
        currentTab={currentTab}
        onSelectTab={onSelectTab}
        openAlertsCount={openAlertsCount}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          currentUser={currentUser}
          onRoleSwitch={onRoleSwitch}
          onQuickSearch={() => onSelectTab('search')}
          openAlertsCount={openAlertsCount}
          onOpenAlerts={() => onSelectTab('alerts')}
          onLogout={onLogout}
        />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
"""

with open('frontend/src/components/layout/Sidebar.tsx', 'w', encoding='utf-8') as f:
    f.write(sidebar_code)
with open('frontend/src/components/layout/Navbar.tsx', 'w', encoding='utf-8') as f:
    f.write(navbar_code)
with open('frontend/src/components/layout/AppLayout.tsx', 'w', encoding='utf-8') as f:
    f.write(app_layout_code)
print('Created Layout components: Sidebar, Navbar, AppLayout.')
