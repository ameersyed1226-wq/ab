import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Inbox, CheckCircle, Clock, MapPin, ChevronRight, Package, ArrowRight, ShieldAlert, Award } from 'lucide-react';

export const VolunteerPickupsScreen: React.FC = () => {
  const { donations, setDonations, setNotifications, activeRescueId, setActiveTab, setSelectedDonationId, setRescueStep, language } = useApp();
  const [subTab, setSubTab] = useState<'active' | 'completed'>('active');

  const activeDonation = donations.find(d => d.id === activeRescueId);
  const completedDonations = donations.filter(d => d.status === 'delivered');

  const isTamil = language === 'ta';

  const handleTrackActive = () => {
    setActiveTab('map'); // The Map tab houses the active VolunteerRescueFlow!
  };

  const handleEnRoute = () => {
    setDonations(prev => prev.map(d => {
      if (d.id === activeRescueId) {
        return { ...d, status: 'en_route_to_pickup', currentStep: 3 };
      }
      return d;
    }));
    setNotifications(prev => [
      {
        id: `enroute-notif-${Date.now()}`,
        title: '🚗 Volunteer En Route',
        time: 'Just now',
        body: 'Ameer Syed is on the way to collect your food donation!',
        read: false,
        type: 'pickup_started',
        badge: 'En Route'
      },
      ...prev
    ]);
    setRescueStep('on_the_way');
  };

  const handleCollect = () => {
    setDonations(prev => prev.map(d => {
      if (d.id === activeRescueId) {
        return { ...d, status: 'food_collected', currentStep: 4 };
      }
      return d;
    }));
    setNotifications(prev => [
      {
        id: `collected-notif-${Date.now()}`,
        title: '✅ Food Collected!',
        time: 'Just now',
        body: 'Ameer Syed has successfully collected your food donation.',
        read: false,
        type: 'pickup_started',
        badge: 'Collected'
      },
      ...prev
    ]);
    setRescueStep('collected');
  };

  return (
    <div className="flex flex-col gap-4 py-1">
      {/* Sub Tabs Toggle Slider */}
      <div className="flex bg-slate-100 rounded-xl p-1 shrink-0">
        <button
          className={`flex-1 py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
            subTab === 'active'
              ? 'bg-white text-[#16A34A] shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
          onClick={() => setSubTab('active')}
        >
          {isTamil ? 'செயலில் உள்ளவை' : 'Active'}
        </button>
        <button
          className={`flex-1 py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
            subTab === 'completed'
              ? 'bg-white text-[#16A34A] shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
          onClick={() => setSubTab('completed')}
        >
          {isTamil ? 'முடிந்தது' : 'Completed'}
        </button>
      </div>

      {/* RENDER ACTIVE TAB */}
      {subTab === 'active' && (
        <div className="flex flex-col gap-3.5">
          {activeDonation ? (
            <div className="bg-white rounded-2xl border border-slate-100/90 shadow-3xs p-4 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-[10px] font-extrabold text-[#16A34A] uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-full w-fit">
                    Rescue In Progress
                  </span>
                  <h3 className="text-base font-black text-slate-800 mt-2">{activeDonation.name}</h3>
                  <p className="text-xs font-bold text-slate-400 mt-1">
                    Store: <span className="text-slate-700">{activeDonation.location}</span>
                  </p>
                </div>
                
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border shrink-0 ${
                  activeDonation.classification === 'veg'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
                    : 'bg-rose-50 text-rose-800 border-rose-100'
                }`}>
                  {activeDonation.classification === 'veg' ? '🥗 VEG' : '🍗 NON-VEG'}
                </span>
              </div>

              {/* Stats detail row */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 rounded-xl p-2.5 border border-slate-100 text-[10px] font-semibold text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Package size={11} className="text-[#16A34A]" />
                  <span>{activeDonation.portions} Meals on-board</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin size={11} className="text-rose-500" />
                  <span>0.8 km distance</span>
                </div>
              </div>

              {/* Quick Progression Buttons for Volunteer */}
              <div className="flex flex-col gap-2">
                {activeDonation.status === 'volunteer_assigned' && (
                  <button
                    type="button"
                    className="w-full h-11 bg-violet-600 hover:bg-violet-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all active:scale-95"
                    onClick={handleEnRoute}
                  >
                    <span>🚗 Start En Route to Pickup</span>
                  </button>
                )}

                {(activeDonation.status === 'en_route_to_pickup' || activeDonation.status === 'courier_on_way') && (
                  <button
                    type="button"
                    className="w-full h-11 bg-teal-600 hover:bg-teal-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all active:scale-95"
                    onClick={handleCollect}
                  >
                    <span>📦 Confirm &amp; Collect Food</span>
                  </button>
                )}

                <button
                  type="button"
                  className="w-full h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  onClick={handleTrackActive}
                >
                  <span>Track Live on Map →</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 p-8 flex flex-col items-center text-center gap-3 shadow-3xs">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                <Inbox size={20} />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs font-bold text-slate-700">No active rescue routes</p>
                <p className="text-[10px] text-slate-400 max-w-[200px]">You are not currently navigating any pickups or deliveries.</p>
              </div>
              <button
                type="button"
                className="mt-2 h-9 bg-[#16A34A] hover:bg-[#166534] text-white text-xs font-bold px-4 rounded-lg cursor-pointer"
                onClick={() => setActiveTab('home')}
              >
                Find Food to Rescue
              </button>
            </div>
          )}
        </div>
      )}

      {/* RENDER COMPLETED TAB */}
      {subTab === 'completed' && (
        <div className="flex flex-col gap-3">
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3 shadow-3xs">
            <div className="w-9 h-9 rounded-full bg-emerald-100 text-[#16A34A] flex items-center justify-center shrink-0">
              <Award size={18} />
            </div>
            <div className="flex flex-col text-xs">
              <span className="font-extrabold text-slate-800">Total Completed: {completedDonations.length} Rescues</span>
              <span className="text-[10px] text-slate-500 mt-0.5">Your actions feed hungry families!</span>
            </div>
          </div>

          {completedDonations.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-8 flex flex-col items-center text-center gap-2">
              <span className="text-xl">🌱</span>
              <p className="text-xs font-bold text-slate-700">No completed rescues yet</p>
              <p className="text-[10px] text-slate-400">Successfully deliver food and close routes to see history here.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {completedDonations.map((item) => (
                <div 
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-100 p-4 shadow-3xs flex flex-col gap-2.5 relative"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400">ID: #{item.id}</span>
                    <span className="text-[10px] font-bold text-[#16A34A] bg-emerald-50 px-2 py-0.5 rounded-full">
                      ✓ Delivered
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                      <img 
                        src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-extrabold text-slate-800 text-xs truncate">{item.name}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5 font-semibold">
                        Donor: <span className="font-bold text-slate-600">{item.location}</span>
                      </span>
                    </div>
                  </div>

                  {/* Summary of meals rescued */}
                  <div className="border-t border-slate-50 pt-2 flex items-center justify-between text-[10px] font-bold text-slate-500">
                    <span>{item.portions} Portion Meals Saved</span>
                    <span className="text-slate-400 font-semibold">Chidambaram Shelter Hub</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
