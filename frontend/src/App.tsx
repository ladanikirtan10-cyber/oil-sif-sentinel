import React, { useState, useEffect } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ReportsPage } from './pages/ReportsPage';
import { NewReportPage } from './pages/NewReportPage';
import { ReportDetailPage } from './pages/ReportDetailPage';
import { ReviewQueuePage } from './pages/ReviewQueuePage';
import { PrecursorPage } from './pages/PrecursorPage';
import { LifeSavingRulesPage } from './pages/LifeSavingRulesPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AlertsPage } from './pages/AlertsPage';
import { SearchPage } from './pages/SearchPage';
import { AssistantPage } from './pages/AssistantPage';
import { ModelPerformancePage } from './pages/ModelPerformancePage';
import { DataImportPage } from './pages/DataImportPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { SettingsPage } from './pages/SettingsPage';
import { api } from './services/api';
import { User } from './types';

export const App: React.FC = () => {
  const [authToken, setAuthToken] = useState<string | null>(localStorage.getItem('oil_sif_token'));
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [openAlertsCount, setOpenAlertsCount] = useState<number>(0);

  // Initialize session on load
  useEffect(() => {
    initSession();
  }, [authToken]);

  const initSession = async () => {
    try {
      if (authToken) {
        const user = await api.getMe();
        setCurrentUser(user);
      } else {
        // Auto-bootstrap demo user for immediate instant usability
        const data = await api.demoSwitch('HSE_OFFICER');
        setAuthToken(data.access_token);
        setCurrentUser(data.user);
        localStorage.setItem('oil_sif_token', data.access_token);
      }
      refreshAlerts();
    } catch (err) {
      console.warn('Session init note:', err);
    }
  };

  const refreshAlerts = async () => {
    try {
      const data = await api.getAlerts({ status: 'OPEN' });
      setOpenAlertsCount(data.length);
    } catch (e) {
      // quiet fail
    }
  };

  const handleRoleSwitch = async (role: string) => {
    try {
      const res = await api.demoSwitch(role);
      setAuthToken(res.access_token);
      setCurrentUser(res.user);
      localStorage.setItem('oil_sif_token', res.access_token);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('oil_sif_token');
    setAuthToken(null);
    setCurrentUser(null);
  };

  const handleSelectReport = (reportId: number) => {
    setSelectedReportId(reportId);
    setCurrentTab('report-detail');
  };

  const handleNavigate = (tab: string, param?: any) => {
    if (tab === 'report-detail' && param) {
      setSelectedReportId(param);
    }
    setCurrentTab(tab);
    refreshAlerts();
  };

  // If user explicitly logged out, show LoginPage
  if (!authToken && !currentUser) {
    return (
      <LoginPage
        onLoginSuccess={(token, user) => {
          setAuthToken(token);
          setCurrentUser(user);
          setCurrentTab('dashboard');
          refreshAlerts();
        }}
      />
    );
  }

  return (
    <AppLayout
      currentTab={currentTab}
      onSelectTab={handleNavigate}
      currentUser={currentUser}
      onRoleSwitch={handleRoleSwitch}
      openAlertsCount={openAlertsCount}
      onLogout={handleLogout}
    >
      {currentTab === 'dashboard' && <DashboardPage onNavigate={handleNavigate} />}
      {currentTab === 'reports' && (
        <ReportsPage
          onSelectReport={handleSelectReport}
          onNewReport={() => setCurrentTab('new-report')}
        />
      )}
      {currentTab === 'new-report' && (
        <NewReportPage
          onSuccess={(id) => {
            setSelectedReportId(id);
            refreshAlerts();
          }}
          onViewReport={(id) => handleSelectReport(id)}
        />
      )}
      {currentTab === 'report-detail' && selectedReportId && (
        <ReportDetailPage
          reportId={selectedReportId}
          onBack={() => setCurrentTab('reports')}
        />
      )}
      {currentTab === 'review-queue' && <ReviewQueuePage onSelectReport={handleSelectReport} />}
      {currentTab === 'precursors' && <PrecursorPage />}
      {currentTab === 'rules' && <LifeSavingRulesPage />}
      {currentTab === 'analytics' && <AnalyticsPage />}
      {currentTab === 'alerts' && <AlertsPage onSelectReport={handleSelectReport} />}
      {currentTab === 'search' && <SearchPage onSelectReport={handleSelectReport} />}
      {currentTab === 'assistant' && <AssistantPage onSelectReport={handleSelectReport} />}
      {currentTab === 'models' && <ModelPerformancePage />}
      {currentTab === 'import' && <DataImportPage />}
      {currentTab === 'admin' && <UserManagementPage />}
      {currentTab === 'settings' && <SettingsPage />}
    </AppLayout>
  );
};
