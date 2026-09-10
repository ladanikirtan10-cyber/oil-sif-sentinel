import React from 'react';
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
