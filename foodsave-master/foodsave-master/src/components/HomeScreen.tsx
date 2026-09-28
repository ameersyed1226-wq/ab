import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { ShieldAlert, Verified, Sliders, ArrowRight, HeartHandshake, Utensils, Award, Clock, ArrowUpRight, PhoneCall, Check, Zap } from 'lucide-react';
import { calculateDistanceKm, formatDistanceString, calculateEtaMinutes } from '../utils/distance';

export const HomeScreen: React.FC = () => {
  const { setActiveTab, donations, stats, setSelectedDonationId, restaurantName, volunteerLocation } = useApp();
  const [showFilterHint, setShowFilterHint] = useState(false);

  // Grab the first active (non-delivered) donation to display in the "Active Donation" card
  const activeDonation = donations.find(d => d.status !== 'delivered' && d.status !== 'expired');

  const homeVolLoc = activeDonation?.volunteerLocation || volunteerLocation;
  const homeDistKm = activeDonation ? calculateDistanceKm(
    homeVolLoc?.lat || 11.3920,
    homeVolLoc?.lng || 79.6900,
    activeDonation.latitude || 11.3962,
    activeDonation.longitude || 79.6936
  ) : 0;

  const handleViewDetails = (id: string) => {
    setSelectedDonationId(id);
    setActiveTab('my-donations');
  };

  return (
    <div className="flex flex-col gap-5 py-1">
      {/* Greeting Header */}
      <section className="flex items-center justify-between">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-slate-500">
            <span className="text-sm">Good Morning</span>
            <span className="text-base select-none">👋</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">
              {restaurantName}
            </h1>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-[#006b2c] text-[11px] font-bold shadow-sm">
              <Verified size={12} className="fill-emerald-600 stroke-white" />
              <span>Verified</span>
            </div>
          </div>
        </div>
        
        {/* Sliders filter button */}
        <div className="relative">
          <button
            className="w-10 h-10 rounded-full bg-emerald-50 text-slate-600 flex items-center justify-center shadow-sm active:scale-95 transition-transform cursor-pointer hover:bg-emerald-100"
            onClick={() => setShowFilterHint(!showFilterHint)}
            aria-label="Filter"
          >
            <Sliders size={18} />
          </button>
          
          {showFilterHint && (
            <div className="absolute right-0 top-12 bg-slate-800 text-white text-xs rounded-xl p-3 shadow-xl z-20 w-48 transition-all">
              <p className="font-semibold mb-1">Filter Preferences</p>
              <p className="text-slate-300 text-[10px] leading-relaxed">
                Currently showing all food postings in the Downtown hub.
              </p>
              <button 
                className="mt-2 text-emerald-400 font-bold hover:underline text-[10px]"
                onClick={() => setShowFilterHint(false)}
              >
                Close
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Hero Main Action Card */}
      <section className="relative overflow-hidden rounded-2xl bg-white p-5 shadow-[0_4px_20px_-4px_rgba(0,107,44,0.08)] border border-emerald-50/50">
        {/* Subtle ambient green tint accent */}
        <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full bg-emerald-100/40 blur-2xl pointer-events-none"></div>
        <div className="absolute -left-10 -bottom-10 w-32 h-32 rounded-full bg-emerald-50/50 blur-xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-xl">🍱</span>
                <span className="text-lg font-bold text-slate-800">
                  Have surplus food?
                </span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                Donate food in less than a minute and rescue freshly prepared meals.
              </p>
            </div>
          </div>
          
          <button
            className="w-full h-[52px] rounded-xl bg-[#006b2c] hover:bg-emerald-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(0,107,44,0.25)] active:scale-[0.98] transition-all cursor-pointer"
            onClick={() => setActiveTab('add-food')}
          >
            <Zap size={18} className="fill-white" />
            <span>+ Donate Food</span>
          </button>
        </div>
      </section>

      {/* Impact Section */}
      <section className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Your Impact
          </span>
          <button
            className="text-xs text-[#006b2c] font-bold flex items-center gap-0.5 hover:underline"
            onClick={() => setActiveTab('profile')}
          >
            <span>All-time stats</span>
            <ArrowRight size={12} />
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {/* Metric 1 */}
          <div className="relative overflow-hidden rounded-2xl bg-white p-4 shadow-[0_1px_3px_0_rgba(23,32,26,0.04)] border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-400">Donations</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-[#006b2c]">
                <HeartHandshake size={15} />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-slate-800 leading-none">
                {stats.donationsCount}
              </span>
              <span className="text-xs text-[#006b2c] font-bold flex items-center">
                <ArrowUpRight size={12} />+3
              </span>
            </div>
          </div>
          
          {/* Metric 2 */}
          <div className="relative overflow-hidden rounded-2xl bg-white p-4 shadow-[0_1px_3px_0_rgba(23,32,26,0.04)] border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-400">Meals Saved</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-[#006b2c]">
                <Utensils size={15} />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-slate-800 leading-none">
                {stats.mealsSaved.toLocaleString()}
              </span>
              <span className="text-xs text-[#006b2c] font-bold flex items-center">
                <Award size={13} className="fill-emerald-100" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Active Donation Section */}
      <section className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Active Donation
            </span>
            {activeDonation && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
            )}
          </div>
          
          {activeDonation ? (
            <button
              className="text-xs text-[#006b2c] hover:underline"
              onClick={() => handleViewDetails(activeDonation.id)}
            >
              View live details
            </button>
          ) : (
            <span className="text-xs text-slate-400">None currently active</span>
          )}
        </div>

        {activeDonation ? (
          /* Active Donation Card */
          <div
            className="relative rounded-2xl bg-white p-4 shadow-[0_2px_8px_rgba(23,32,26,0.03)] border border-slate-100 flex flex-col gap-3.5 cursor-pointer hover:border-emerald-200 transition-colors"
            onClick={() => handleViewDetails(activeDonation.id)}
          >
            <div className="flex items-start gap-3">
              {/* Thumbnail image */}
              <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-slate-100 shadow-inner">
                <img
                  className="w-full h-full object-cover"
                  alt={activeDonation.name}
                  src={activeDonation.image}
                />
                <div className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-slate-900/70 backdrop-blur-xs text-[9px] text-white font-bold">
                  HOT
                </div>
              </div>
              
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h2 className="text-sm font-bold text-slate-800 truncate">
                    {activeDonation.name}
                  </h2>
                </div>
                <span className="text-xs text-slate-500 mt-0.5">
                  {activeDonation.portions} Meals prepared
                </span>
                
                {/* Time warning chip */}
                <div className="flex items-center gap-1.5 mt-2 text-slate-500">
                  <Clock size={13} className="text-amber-600" />
                  <span className="text-xs">
                    Consume before{' '}
                    <strong className="text-slate-700 font-semibold">
                      {activeDonation.bestBefore}
                    </strong>
                  </span>
                </div>
              </div>
            </div>
            
            {/* Footer Status Pill & Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              {/* Dynamic Status Badge */}
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${
                activeDonation.status === 'en_route_to_pickup'
                  ? 'bg-violet-50 text-violet-800 border-violet-200'
                  : activeDonation.status === 'courier_on_way'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : activeDonation.status === 'food_collected'
                  ? 'bg-teal-50 text-teal-800 border-teal-200'
                  : activeDonation.status === 'waiting_pickup'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-blue-50 text-blue-800 border-blue-200'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  activeDonation.status === 'en_route_to_pickup'
                    ? 'bg-violet-600 animate-ping'
                    : activeDonation.status === 'courier_on_way'
                    ? 'bg-emerald-600 animate-ping'
                    : activeDonation.status === 'food_collected'
                    ? 'bg-teal-600'
                    : activeDonation.status === 'waiting_pickup'
                    ? 'bg-amber-500 animate-pulse'
                    : 'bg-blue-600'
                }`}></span>
                <span>
                  {activeDonation.status === 'waiting_pickup'
                    ? 'Waiting for Pickup'
                    : activeDonation.status === 'en_route_to_pickup'
                    ? '🚗 En Route to Pickup'
                    : activeDonation.status === 'courier_on_way'
                    ? '📍 Volunteer Arrived'
                    : activeDonation.status === 'food_collected'
                    ? '✅ Food Collected'
                    : '🤝 Volunteer Assigned'}
                </span>
              </div>


            </div>
          </div>
        ) : (
          /* Empty Active State Card */
          <div className="rounded-2xl bg-emerald-50/30 border-2 border-dashed border-emerald-100 p-6 text-center">
            <p className="text-xs text-slate-500 mb-2">No active surplus food broadcasting right now.</p>
            <button
              className="text-xs text-[#006b2c] font-bold hover:underline"
              onClick={() => setActiveTab('add-food')}
            >
              Post a surplus batch now →
            </button>
          </div>
        )}
      </section>

      {/* Courier Live Dispatch Micro Banner */}
      {activeDonation && activeDonation.courier && (
        <section className={`flex items-center justify-between p-3.5 rounded-2xl border text-slate-800 transition-all ${
          activeDonation.status === 'en_route_to_pickup'
            ? 'bg-violet-50/60 border-violet-200'
            : activeDonation.status === 'food_collected'
            ? 'bg-teal-50/60 border-teal-200'
            : activeDonation.status === 'courier_on_way'
            ? 'bg-emerald-50/60 border-emerald-200'
            : 'bg-emerald-50/30 border-emerald-100/50'
        }`}>
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 border-emerald-200 shadow-sm">
              <img
                alt={activeDonation.courier.name}
                className="w-full h-full object-cover"
                src={activeDonation.courier.avatar}
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-1 ring-white"></span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-slate-800">
                  {activeDonation.status === 'en_route_to_pickup'
                    ? '🚗 Volunteer En Route to You'
                    : activeDonation.status === 'courier_on_way'
                    ? '📍 Volunteer Arrived at Location'
                    : activeDonation.status === 'food_collected'
                    ? '✅ Food Collected & Safe'
                    : '🤝 Courier Assigned'}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium leading-tight truncate">
                {activeDonation.status === 'en_route_to_pickup'
                  ? `${activeDonation.courier.name} is on the way • ${formatDistanceString(homeDistKm)} away • ETA ${calculateEtaMinutes(homeDistKm)} mins`
                  : activeDonation.status === 'courier_on_way'
                  ? `${activeDonation.courier.name} is outside ready for handover (${formatDistanceString(homeDistKm)})`
                  : activeDonation.status === 'food_collected'
                  ? `${activeDonation.courier.name} collected food • Heading to shelter`
                  : `${activeDonation.courier.name} · ${formatDistanceString(homeDistKm)} away`}
              </span>
            </div>
          </div>
          
          <a
            href={`tel:${activeDonation.courier.phone}`}
            className="w-9 h-9 rounded-full bg-emerald-100 hover:bg-emerald-200 text-[#006b2c] flex items-center justify-center shrink-0 active:scale-95 transition-transform"
            aria-label="Call volunteer"
          >
            <PhoneCall size={15} />
          </a>
        </section>
      )}
    </div>
  );
};
