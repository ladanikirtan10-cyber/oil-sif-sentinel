import React from 'react';
import { 
  LayoutDashboard, FileText, PlusCircle, CheckSquare, Zap, Shield, 
  BarChart3, AlertTriangle, Search, Bot, Activity, UploadCloud, Users, 
  Settings, Flame, ChevronRight, Sparkles, Database, Layers
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  openAlertsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, openAlertsCount }) => {
  const navSections = [
    {
      title: 'EXECUTIVE INTELLIGENCE',
      items: [
        { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
        { id: 'precursors', label: 'Precursor Intelligence', icon: Zap, isPrecursor: true },
        { id: 'analytics', label: 'Sites & Asset Risk', icon: BarChart3 },
      ],
    },
    {
      title: 'SAFETY INCIDENTS & AI',
      items: [
        { id: 'reports', label: 'Safety Reports', icon: FileText },
        { id: 'new-report', label: 'New Report & AI Studio', icon: PlusCircle, highlight: true },
        { id: 'review-queue', label: 'AI Review Queue', icon: CheckSquare },
        { id: 'alerts', label: 'Alert Center', icon: AlertTriangle, badge: openAlertsCount },
      ],
    },
    {
      title: 'NLP & COMPLIANCE',
      items: [
        { id: 'rules', label: 'Life-Saving Rules', icon: Shield },
        { id: 'search', label: 'Semantic Vector Search', icon: Search },
        { id: 'assistant', label: 'AI Safety Assistant', icon: Bot, isNew: true },
        { id: 'models', label: 'Model Performance', icon: Activity },
      ],
    },
    {
      title: 'SYSTEM & GOVERNANCE',
      items: [
        { id: 'import', label: 'Data Management', icon: UploadCloud },
        { id: 'admin', label: 'Users & Audit Logs', icon: Users },
        { id: 'settings', label: 'System Settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-[#080D18] border-r border-slate-800/80 flex flex-col h-screen select-none sticky top-0 shadow-2xl z-20">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80 bg-gradient-to-b from-[#0C1427] to-[#080D18]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-amber-500/25 border border-amber-300/30">
            <Flame className="w-6 h-6 text-slate-950 fill-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-black text-sm tracking-wider text-white">OIL SIF SENTINEL</h1>
            </div>
            <p className="text-[10px] font-bold text-amber-400 tracking-wider uppercase">
              Oil India Limited • HSE
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between px-2.5 py-1 rounded-md bg-slate-950/80 border border-slate-800/80 text-[10px]">
          <span className="text-slate-400 font-medium">SIH26165 Defense</span>
          <span className="font-mono text-amber-400 font-bold">PSU GRADE</span>
        </div>
      </div>

      {/* Grouped Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <div className="px-3 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>{section.title}</span>
            </div>

            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 relative group ${
                    isActive
                      ? 'bg-gradient-to-r from-sky-900/80 via-indigo-950/70 to-slate-900 text-white border-l-4 border-amber-500 shadow-md shadow-sky-950/40'
                      : item.highlight
                      ? 'text-amber-300 hover:bg-amber-950/30 border border-amber-500/40 bg-amber-950/10'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 transition-colors ${
                      isActive 
                        ? 'text-amber-400' 
                        : item.highlight 
                        ? 'text-amber-400' 
                        : 'text-slate-400 group-hover:text-slate-200'
                    }`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-red-600/30 text-red-400 border border-red-500/50 animate-pulse">
                        {item.badge}
                      </span>
                    )}
                    {item.isNew && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                        RAG
                      </span>
                    )}
                    {item.isPrecursor && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* System Status Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-[#060A12]/95">
        <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-emerald-400 font-bold text-[10px]">Zero Hallucination</span>
            </span>
            <span className="font-mono text-[10px] text-slate-400">v1.10</span>
          </div>
          <div className="text-[10px] text-slate-400 truncate flex items-center gap-1">
            <Layers className="w-3 h-3 text-slate-400" />
            <span>7 Active Asset Fields</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
