import React from 'react';
import { useApp } from '../AppContext';
import { Bell, User } from 'lucide-react';

export const Header: React.FC = () => {
  const { activeTab, setActiveTab, notifications, userRole, setIsLoggedIn, restaurantName } = useApp();

  const getTitle = () => {
    switch (activeTab) {
      case 'home':
        return 'Home';
      case 'my-donations':
        return 'My Donations';
      case 'add-food':
        return 'Add Food';
      case 'notifications':
        return 'Notifications';
      case 'profile':
        return 'Profile';
      default:
        return 'Home';
    }
  };

  const hasUnread = notifications.some(n => !n.read);

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-[#f2fcf2]/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.03)] pt-safe">
      <div className="h-16 px-4 flex items-center justify-between max-w-[480px] mx-auto">
        <div className="flex items-center gap-2">
          <img
            alt="FoodSave Logo"
            className="h-8 w-auto object-contain cursor-pointer"
            src="https://ik.imagekit.io/72dmudtmj/WhatsApp%20Image%202026-09-19%20at%2010.23.50%20PM.jpeg"
            onClick={() => setActiveTab('home')}
          />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[#006b2c] tracking-wider uppercase leading-none">
              {userRole === 'volunteer' ? 'Volunteer Portal' : 'Donor Portal'}
            </span>
            <span className="text-lg font-bold text-slate-800 leading-tight">
              {getTitle()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Active Role Indicator */}
          <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-[#006b2c] border border-emerald-200">
            {userRole === 'volunteer' ? '🚴 Volunteer' : '🏪 Donor'}
          </span>

          {/* Dedicated Logout Button */}
          <button
            onClick={() => {
              if (window.confirm("Do you want to sign out and switch accounts?")) {
                setIsLoggedIn(false);
              }
            }}
            className="px-2 py-1 rounded-lg text-[10px] font-bold border border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-600 transition-all cursor-pointer shadow-2xs active:scale-95 flex items-center gap-1"
            title="Sign Out"
          >
            <span>Exit</span>
          </button>
          {/* Bell Notifications button */}
          <button
            aria-label="Notifications"
            className="w-10 h-10 relative flex items-center justify-center rounded-full text-slate-600 hover:text-[#006b2c] hover:bg-emerald-50 transition-colors"
            onClick={() => setActiveTab('notifications')}
          >
            <Bell size={20} />
            {hasUnread && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-rose-600 ring-2 ring-[#f2fcf2]"></span>
            )}
          </button>

          {/* Profile Shortcut */}
          <button
            aria-label="Profile"
            className="w-10 h-10 flex items-center justify-center rounded-full overflow-hidden hover:opacity-90 transition-opacity border-2 border-emerald-100"
            onClick={() => setActiveTab('profile')}
          >
            <img
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCUauo2o-KmTHDl8nV286n1LlzfUs-pwIKUoylkoL3X4LPuQKfO3ZolUIbVSuEp11R3ddpP0MksbHUVkrjqmi7AbAIC96yK1UBI-JqwzgMiBuKWquIpmKVwoa5mlgoDqYppj7CUB33bbUVwSKxsagg7NJ8Oob3eKFbiq-NQzegWFAuLUMynm1edkWpmH6YfR9_XEwfCoBDSDekL2JsIVsgZtegR32f88YjDmA0DuDdmyyfJX_IR0z8"
            />
          </button>
        </div>
      </div>
    </header>
  );
};
