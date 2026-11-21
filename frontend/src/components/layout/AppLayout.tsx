import React from 'react';
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
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900">
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
        <main className="flex-1 p-6 overflow-y-auto bg-[#F8FAFC]">
          {children}
        </main>
      </div>
    </div>
  );
};
