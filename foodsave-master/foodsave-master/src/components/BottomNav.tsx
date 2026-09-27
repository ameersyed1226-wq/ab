import React from 'react';
import { useApp } from '../AppContext';
import { Home, Package, Plus, Bell, User, Map, Inbox } from 'lucide-react';
import { AppTab } from '../types';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, notifications, setSelectedDonationId, userRole } = useApp();

  const hasUnread = notifications.some(n => !n.read);

  const handleTabChange = (tab: AppTab) => {
    setSelectedDonationId(null); // Clear selected item to return to list
    setActiveTab(tab);
  };

  if (userRole === 'volunteer') {
    return (
      <nav className="fixed bottom-0 inset-x-0 z-50 pb-[env(safe-area-inset-bottom,0px)] bg-white/95 backdrop-blur-xl shadow-[0_-2px_12px_rgba(0,0,0,0.05)] border-t border-emerald-50">
        <div className="relative flex items-center justify-between h-16 px-4 max-w-[480px] mx-auto">
          {/* Tab 1: Home */}
          <button
            className={`flex flex-1 flex-col items-center justify-center min-w-[56px] h-12 gap-0.5 transition-colors cursor-pointer ${
              activeTab === 'home'
                ? 'text-[#006b2c] font-semibold'
                : 'text-slate-500 hover:text-[#006b2c]'
            }`}
            onClick={() => handleTabChange('home')}
          >
            <Home size={22} className={activeTab === 'home' ? 'stroke-[2.5px]' : 'stroke-[1.8px]'} />
            <span className="text-[11px] tracking-tight">Home</span>
          </button>

          {/* Tab 2: Nearby Food Map */}
          <button
            className={`flex flex-1 flex-col items-center justify-center min-w-[56px] h-12 gap-0.5 transition-colors cursor-pointer ${
              activeTab === 'map'
                ? 'text-[#006b2c] font-semibold'
                : 'text-slate-500 hover:text-[#006b2c]'
            }`}
            onClick={() => handleTabChange('map')}
          >
            <Map size={22} className={activeTab === 'map' ? 'stroke-[2.5px]' : 'stroke-[1.8px]'} />
            <span className="text-[11px] tracking-tight">Map</span>
          </button>

          {/* Tab 3: My Pickups */}
          <button
            className={`flex flex-1 flex-col items-center justify-center min-w-[56px] h-12 gap-0.5 transition-colors cursor-pointer ${
              activeTab === 'pickups'
                ? 'text-[#006b2c] font-semibold'
                : 'text-slate-500 hover:text-[#006b2c]'
            }`}
            onClick={() => handleTabChange('pickups')}
          >
            <Inbox size={22} className={activeTab === 'pickups' ? 'stroke-[2.5px]' : 'stroke-[1.8px]'} />
            <span className="text-[11px] tracking-tight">Pickups</span>
          </button>

          {/* Tab 4: Profile */}
          <button
            className={`flex flex-1 flex-col items-center justify-center min-w-[56px] h-12 gap-0.5 transition-colors cursor-pointer ${
              activeTab === 'profile'
                ? 'text-[#006b2c] font-semibold'
                : 'text-slate-500 hover:text-[#006b2c]'
            }`}
            onClick={() => handleTabChange('profile')}
          >
            <User size={22} className={activeTab === 'profile' ? 'stroke-[2.5px]' : 'stroke-[1.8px]'} />
            <span className="text-[11px] tracking-tight">Profile</span>
          </button>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 pb-[env(safe-area-inset-bottom,0px)] bg-white/95 backdrop-blur-xl shadow-[0_-2px_12px_rgba(0,0,0,0.05)] border-t border-emerald-50">
      <div className="relative flex items-center justify-between h-16 px-2 max-w-[480px] mx-auto">
        {/* Tab 1: Home */}
        <button
          className={`flex flex-1 flex-col items-center justify-center min-w-[56px] h-12 gap-0.5 transition-colors cursor-pointer ${
            activeTab === 'home'
              ? 'text-[#006b2c] font-semibold'
              : 'text-slate-500 hover:text-[#006b2c]'
          }`}
          onClick={() => handleTabChange('home')}
        >
          <Home size={22} className={activeTab === 'home' ? 'stroke-[2.5px]' : 'stroke-[1.8px]'} />
          <span className="text-[11px] tracking-tight">Home</span>
        </button>

        {/* Tab 2: Donations */}
        <button
          className={`flex flex-1 flex-col items-center justify-center min-w-[56px] h-12 gap-0.5 transition-colors cursor-pointer ${
            activeTab === 'my-donations'
              ? 'text-[#006b2c] font-semibold'
              : 'text-slate-500 hover:text-[#006b2c]'
          }`}
          onClick={() => handleTabChange('my-donations')}
        >
          <Package size={22} className={activeTab === 'my-donations' ? 'stroke-[2.5px]' : 'stroke-[1.8px]'} />
          <span className="text-[11px] tracking-tight">Donations</span>
        </button>

        {/* Floating Center Button: Add Donation */}
        <div className="flex flex-1 items-center justify-center relative">
          <button
            className="absolute -top-6 w-14 h-14 rounded-full bg-[#006b2c] text-white flex items-center justify-center shadow-[0_6px_16px_rgba(0,107,44,0.3)] active:scale-95 transition-all hover:bg-emerald-700 cursor-pointer"
            onClick={() => handleTabChange('add-food')}
          >
            <Plus size={28} className="stroke-[2.5px]" />
          </button>
        </div>

        {/* Tab 4: Notifications (Alerts) */}
        <button
          className={`flex flex-1 flex-col items-center justify-center min-w-[56px] h-12 gap-0.5 relative transition-colors cursor-pointer ${
            activeTab === 'notifications'
              ? 'text-[#006b2c] font-semibold'
              : 'text-slate-500 hover:text-[#006b2c]'
          }`}
          onClick={() => handleTabChange('notifications')}
        >
          <div className="relative flex items-center justify-center">
            <Bell size={22} className={activeTab === 'notifications' ? 'stroke-[2.5px]' : 'stroke-[1.8px]'} />
            {hasUnread && (
              <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-rose-600 border border-white"></span>
            )}
          </div>
          <span className="text-[11px] tracking-tight">Alerts</span>
        </button>

        {/* Tab 5: Profile */}
        <button
          className={`flex flex-1 flex-col items-center justify-center min-w-[56px] h-12 gap-0.5 transition-colors cursor-pointer ${
            activeTab === 'profile'
              ? 'text-[#006b2c] font-semibold'
              : 'text-slate-500 hover:text-[#006b2c]'
          }`}
          onClick={() => handleTabChange('profile')}
        >
          <User size={22} className={activeTab === 'profile' ? 'stroke-[2.5px]' : 'stroke-[1.8px]'} />
          <span className="text-[11px] tracking-tight">Profile</span>
        </button>
      </div>
    </nav>
  );
};
