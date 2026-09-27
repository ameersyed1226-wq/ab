import React from 'react';
import { AppProvider, useApp } from './AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './components/HomeScreen';
import { MyDonationsScreen } from './components/MyDonationsScreen';
import { AddFoodScreen } from './components/AddFoodScreen';
import { NotificationsScreen } from './components/NotificationsScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { LoginScreen } from './components/LoginScreen';
// Volunteer-specific custom screens
import { VolunteerHomeScreen } from './components/VolunteerHomeScreen';
import { VolunteerMapScreen } from './components/VolunteerMapScreen';
import { VolunteerPickupsScreen } from './components/VolunteerPickupsScreen';

const MainAppContent: React.FC = () => {
  const { activeTab, isLoggedIn, userRole } = useApp();

  if (!isLoggedIn) {
    return <LoginScreen />;
  }

  const renderScreen = () => {
    // If logged in as a volunteer courier
    if (userRole === 'volunteer') {
      switch (activeTab) {
        case 'home':
          return <VolunteerHomeScreen />;
        case 'map':
          return <VolunteerMapScreen />;
        case 'pickups':
          return <VolunteerPickupsScreen />;
        case 'profile':
          return <ProfileScreen />;
        default:
          return <VolunteerHomeScreen />;
      }
    }

    // Default restaurant owner donor
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'my-donations':
        return <MyDonationsScreen />;
      case 'add-food':
        return <AddFoodScreen />;
      case 'notifications':
        return <NotificationsScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <HomeScreen />;
    }
  };

  // Add different bottom-safe heights depending on if floating add button is present
  const pbClass = activeTab === 'add-food' ? 'pb-32' : 'pb-24';

  return (
    <div className="min-h-screen bg-[#f2fcf2] text-slate-800 flex flex-col relative w-full selection:bg-emerald-100 selection:text-[#006b2c]">
      {/* Universal Top Header */}
      <Header />

      {/* Main View Area */}
      <main className={`flex-1 flex flex-col relative w-full pt-20 px-5 max-w-[480px] mx-auto ${pbClass}`}>
        {renderScreen()}
      </main>

      {/* Sticky Bottom Navigation Tab Bar */}
      <BottomNav />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
