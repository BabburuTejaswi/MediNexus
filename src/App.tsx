/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserProfile } from './types/index.ts';
import { authService } from './services/authService.ts';
import { Navbar } from './components/Navbar.tsx';
import { DisclaimerModal } from './components/DisclaimerModal.tsx';
import { LandingPage } from './pages/LandingPage.tsx';
import { AuthPage } from './pages/AuthPage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { HealthAssistantPage } from './pages/HealthAssistantPage.tsx';
import { ReportAnalysisPage } from './pages/ReportAnalysisPage.tsx';
import { MedicalRecordsPage } from './pages/MedicalRecordsPage.tsx';
import { HealthHistoryPage } from './pages/HealthHistoryPage.tsx';
import { NearbyHospitalsPage } from './pages/NearbyHospitalsPage.tsx';
import { ProfileSettingsPage } from './pages/ProfileSettingsPage.tsx';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(authService.getCurrentUser());
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [showDisclaimerReview, setShowDisclaimerReview] = useState(false);

  useEffect(() => {
    const unsubscribe = authService.subscribe((user) => {
      setCurrentUser(user);
      if (user && (currentTab === 'landing' || currentTab === 'auth')) {
        setCurrentTab('dashboard');
      } else if (!user && currentTab !== 'auth') {
        setCurrentTab('landing');
      }
    });

    return () => unsubscribe();
  }, [currentTab]);

  const handleSelectDemoUser = async (email: string) => {
    try {
      await authService.login(email);
      setCurrentTab('dashboard');
    } catch (e) {
      console.error(e);
      setCurrentTab('auth');
    }
  };

  const handleSelectRecordFromDashboard = (recordId: string) => {
    setSelectedRecordId(recordId);
    setCurrentTab('records');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      
      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab}
        onNavigate={(tab) => {
          setSelectedRecordId(null);
          setCurrentTab(tab);
        }}
        currentUser={currentUser}
        onOpenDisclaimerReview={() => setShowDisclaimerReview(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Landing Page */}
        {!currentUser && currentTab === 'landing' && (
          <LandingPage
            onGetStarted={() => setCurrentTab('auth')}
            onSelectDemoUser={handleSelectDemoUser}
          />
        )}

        {/* Authentication Page */}
        {!currentUser && currentTab === 'auth' && (
          <AuthPage
            onSuccess={() => setCurrentTab('dashboard')}
          />
        )}

        {/* Authenticated Routes */}
        {currentUser && (
          <>
            {currentTab === 'dashboard' && (
              <DashboardPage
                currentUser={currentUser}
                onNavigate={(tab) => setCurrentTab(tab)}
                onSelectRecord={handleSelectRecordFromDashboard}
              />
            )}

            {currentTab === 'assistant' && (
              <HealthAssistantPage
                currentUser={currentUser}
                onNavigateHospitals={() => setCurrentTab('hospitals')}
                onOpenDisclaimerReview={() => setShowDisclaimerReview(true)}
              />
            )}

            {currentTab === 'report-analysis' && (
              <ReportAnalysisPage
                currentUser={currentUser}
                onNavigateRecords={() => setCurrentTab('records')}
              />
            )}

            {currentTab === 'records' && (
              <MedicalRecordsPage
                currentUser={currentUser}
                onNavigateUpload={() => setCurrentTab('report-analysis')}
                selectedRecordId={selectedRecordId}
              />
            )}

            {currentTab === 'history' && (
              <HealthHistoryPage
                currentUser={currentUser}
              />
            )}

            {currentTab === 'hospitals' && (
              <NearbyHospitalsPage
                currentUser={currentUser}
              />
            )}

            {currentTab === 'profile' && (
              <ProfileSettingsPage
                currentUser={currentUser}
                onOpenDisclaimerReview={() => setShowDisclaimerReview(true)}
                onLogout={() => setCurrentTab('landing')}
              />
            )}
          </>
        )}

      </main>

      {/* Permanent AI Disclaimer Modal Reviewer */}
      <DisclaimerModal
        isOpen={showDisclaimerReview}
        isReviewMode={true}
        onAcknowledged={() => setShowDisclaimerReview(false)}
        onCancel={() => setShowDisclaimerReview(false)}
      />

    </div>
  );
}
