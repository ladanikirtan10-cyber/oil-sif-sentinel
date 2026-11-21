import React from 'react';
import { 
  LayoutDashboard, FileText, PlusCircle, CheckSquare, Zap, Shield, 
  BarChart3, AlertTriangle, Search, Bot, Activity, UploadCloud, Users, 
  Settings, Flame, Layers, Camera
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  openAlertsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, openAlertsCount }) => {
  const { t } = useLanguage();

  const navSections = [
    {
      title: t('nav.executiveIntelligence', 'EXECUTIVE INTELLIGENCE'),
      items: [
        { id: 'dashboard', label: t('nav.dashboard', 'Executive Dashboard'), icon: LayoutDashboard },
        { id: 'precursors', label: t('nav.precursors', 'Precursor Intelligence'), icon: Zap, isPrecursor: true },
        { id: 'analytics', label: t('nav.analytics', 'Sites & Asset Risk'), icon: BarChart3 },
      ],
    },
    {
      title: t('nav.safetyIncidents', 'SAFETY INCIDENTS & AI'),
      items: [
        { id: 'camera', label: t('nav.camera', 'AI Safety Camera'), icon: Camera, isNew: true },
        { id: 'reports', label: t('nav.reports', 'Safety Reports'), icon: FileText },
        { id: 'new-report', label: t('nav.newReport', 'New Report & AI Studio'), icon: PlusCircle, highlight: true },
        { id: 'review-queue', label: t('nav.reviewQueue', 'AI Review Queue'), icon: CheckSquare },
        { id: 'alerts', label: t('nav.alerts', 'Alert Center'), icon: AlertTriangle, badge: openAlertsCount },
      ],
    },
    {
      title: t('nav.nlpCompliance', 'NLP & COMPLIANCE'),
      items: [
        { id: 'rules', label: t('nav.rules', 'Life-Saving Rules'), icon: Shield },
        { id: 'search', label: t('nav.search', 'Semantic Vector Search'), icon: Search },
        { id: 'assistant', label: t('nav.assistant', 'AI Safety Assistant'), icon: Bot, isNew: true },
        { id: 'models', label: t('nav.models', 'Model Performance'), icon: Activity },
      ],
    },
    {
      title: t('nav.systemGovernance', 'SYSTEM & GOVERNANCE'),
      items: [
        { id: 'import', label: t('nav.import', 'Data Management'), icon: UploadCloud },
        { id: 'admin', label: t('nav.admin', 'Users & Audit Logs'), icon: Users },
        { id: 'settings', label: t('nav.settings', 'System Settings'), icon: Settings },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen select-none sticky top-0 shadow-[2px_0_12px_rgba(0,0,0,0.03)] z-20">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-200 bg-gradient-to-b from-slate-50/80 to-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-600 flex items-center justify-center shadow-md shadow-amber-500/25 border border-amber-300">
            <Flame className="w-6 h-6 text-white fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-black text-sm tracking-wider text-slate-900">OIL SIF SENTINEL</h1>
            </div>
            <p className="text-[10px] font-bold text-amber-600 tracking-wider uppercase">
              Oil India Limited • HSE
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between px-2.5 py-1 rounded-md bg-amber-50/70 border border-amber-200/80 text-[10px]">
          <span className="text-slate-600 font-semibold">{t('nav.sihDefense', 'SIH26165 Defense')}</span>
          <span className="font-mono text-amber-700 font-black">{t('nav.psuGrade', 'PSU GRADE')}</span>
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
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-md shadow-blue-500/25 border-l-4 border-amber-400'
                      : item.highlight
                      ? 'text-amber-800 bg-amber-50 hover:bg-amber-100/80 border border-amber-300/80 font-bold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 transition-colors ${
                      isActive 
                        ? 'text-white' 
                        : item.highlight 
                        ? 'text-amber-600' 
                        : 'text-slate-400 group-hover:text-blue-600'
                    }`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-red-100 text-red-700 border border-red-300 animate-pulse">
                        {item.badge}
                      </span>
                    )}
                    {item.isNew && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-indigo-100 text-indigo-700 border border-indigo-200">
                        RAG
                      </span>
                    )}
                    {item.isPrecursor && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* System Status Footer */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/80">
        <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-emerald-700 font-bold text-[10px]">Zero Hallucination</span>
            </span>
            <span className="font-mono text-[10px] text-slate-400 font-semibold">v1.12</span>
          </div>
          <div className="text-[10px] text-slate-500 truncate flex items-center gap-1">
            <Layers className="w-3 h-3 text-slate-400" />
            <span>7 Active Asset Fields</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
