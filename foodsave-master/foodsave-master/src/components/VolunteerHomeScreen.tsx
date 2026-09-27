import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { 
  CheckCircle, MapPin, HeartHandshake, Utensils, Clock, ChevronRight, Sparkles, 
  Navigation, AlertCircle, Phone, Building, Eye, ShieldCheck, Check, MessageCircle, Info
} from 'lucide-react';
import { VolunteerDonorDetailsModal } from './VolunteerDonorDetailsModal';
import { Donation } from '../types';

export const VolunteerHomeScreen: React.FC = () => {
  const { donations, setActiveTab, setSelectedDonationId, restaurantName, acceptDonation } = useApp();
  const [selectedHub, setSelectedHub] = useState('Chidambaram, TN');
  const [selectedModalDonation, setSelectedModalDonation] = useState<Donation | null>(null);
  const [acceptedToast, setAcceptedToast] = useState<{ show: boolean; donorName: string; foodName: string } | null>(null);

  // Filter donations that are waiting for a volunteer
  const availableDonations = donations.filter(
    d => d.status === 'waiting_pickup'
  );

  // The latest pending donation submitted by a donor
  const latestPendingDonation = availableDonations[0] || null;

  const handleAcceptPickup = (id: string) => {
    const target = donations.find(d => d.id === id);
    acceptDonation(id);
    setAcceptedToast({
      show: true,
      donorName: target?.donorName || restaurantName || 'Donor Partner',
      foodName: target?.name || 'Food Batch'
    });

    // Auto-dismiss toast after 4s
    setTimeout(() => {
      setAcceptedToast(null);
    }, 4000);
  };

  const handleOpenDetails = (donation: Donation) => {
    setSelectedModalDonation(donation);
  };

  return (
    <div className="flex flex-col gap-5 py-1">
      {/* Top Welcome Card */}
      <section className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#16A34A] tracking-wider uppercase">
              Rescue Agent Active
            </span>
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-1.5 mt-0.5">
              <span>Hello, Ameer Syed</span>
              <span className="text-base">👋</span>
            </h1>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-[#16A34A] text-[10px] font-extrabold border border-emerald-100 shadow-3xs">
            <CheckCircle size={11} className="fill-[#16A34A] stroke-white" />
            <span>Verified Volunteer</span>
          </div>
        </div>

        {/* Location Selector */}
        <div className="flex items-center gap-1.5 mt-2 bg-white rounded-xl border border-slate-100 px-3 py-2 w-fit shadow-3xs">
          <MapPin size={13} className="text-[#16A34A]" />
          <span className="text-xs font-bold text-slate-700">{selectedHub}</span>
          <ChevronRight size={12} className="text-slate-400 rotate-90" />
        </div>
      </section>

      {/* Acceptance Success Toast Banner */}
      {acceptedToast && (
        <div className="bg-emerald-600 text-white p-4 rounded-2xl shadow-lg border border-emerald-500 animate-slide-up flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Check size={18} className="stroke-[3px]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-black uppercase tracking-wider">🎉 Pickup Assigned to You!</span>
              <span className="text-xs font-medium opacity-90 truncate">
                Assigned to {acceptedToast.donorName} for "{acceptedToast.foodName}"
              </span>
            </div>
          </div>
          <p className="text-[11px] text-emerald-100 leading-relaxed font-semibold">
            Donor has been notified with your volunteer phone (+91 94443 12260) &amp; live GPS coordinates.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => setActiveTab('map')}
              className="flex-1 h-9 bg-white text-[#16A34A] hover:bg-emerald-50 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all active:scale-95"
            >
              <Navigation size={13} className="fill-[#16A34A]" />
              <span>Open Live Route on Map</span>
            </button>
            <button
              onClick={() => setAcceptedToast(null)}
              className="px-3 h-9 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* LATEST SUBMITTED DONOR PICKUP ALERT CARD */}
      {latestPendingDonation && (
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4.5 shadow-xl border border-slate-700/50 flex flex-col gap-3.5 animate-fade-in">
          {/* Top Live Broadcast Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-black text-emerald-400 uppercase tracking-wider">
                🚨 New Food Donation from Donor!
              </span>
            </div>
            <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded-full border border-white/10">
              Waiting for Volunteer
            </span>
          </div>

          {/* Donor Information Row */}
          <div className="bg-white/10 rounded-xl p-3 border border-white/10 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Building size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Donor / Restaurant</span>
                  <span className="text-xs font-black text-white">
                    {latestPendingDonation.donorName || restaurantName || 'ABC Grand Kitchen'}
                  </span>
                </div>
              </div>

              {/* Direct Call Donor Button */}
              <a
                href={`tel:${latestPendingDonation.donorPhone || '+91 94443 12260'}`}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold transition-all shadow-xs"
              >
                <Phone size={12} className="stroke-[2.5px]" />
                <span>Call Donor</span>
              </a>
            </div>

            <div className="flex items-start gap-1.5 text-[11px] text-slate-300">
              <MapPin size={12} className="text-rose-400 shrink-0 mt-0.5" />
              <span className="leading-snug">
                <strong className="text-white">Pickup Location: </strong>
                {latestPendingDonation.location}
              </span>
            </div>
          </div>

          {/* Food Details Row */}
          <div className="flex items-start gap-3 bg-white/5 rounded-xl p-2.5 border border-white/5">
            <div className="w-14 h-14 rounded-lg bg-white/10 overflow-hidden shrink-0 border border-white/10">
              <img
                src={latestPendingDonation.image}
                alt={latestPendingDonation.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <h3 className="text-xs font-black text-white truncate">{latestPendingDonation.name}</h3>
                <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase shrink-0 ${
                  latestPendingDonation.classification === 'veg'
                    ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                    : 'bg-rose-500/30 text-rose-300 border border-rose-500/40'
                }`}>
                  {latestPendingDonation.classification === 'veg' ? '🥗 Veg' : '🍗 Non-Veg'}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-black text-emerald-400">
                  {latestPendingDonation.portions} Meals
                </span>
                <span className="text-[10px] text-slate-300">
                  • Consume before <strong className="text-white">{latestPendingDonation.bestBefore}</strong>
                </span>
              </div>
              {latestPendingDonation.notes && (
                <p className="text-[10px] text-slate-400 italic mt-0.5 truncate">
                  "{latestPendingDonation.notes}"
                </p>
              )}
            </div>
          </div>

          {/* Two Action Buttons: OK (Accept & Assign) + View Details */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleOpenDetails(latestPendingDonation)}
              className="h-11 bg-white/15 hover:bg-white/25 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 border border-white/10 transition-all cursor-pointer"
            >
              <Eye size={14} />
              <span>Donor Details</span>
            </button>

            <button
              type="button"
              onClick={() => handleAcceptPickup(latestPendingDonation.id)}
              className="h-11 bg-[#16A34A] hover:bg-[#166534] text-white text-xs font-black rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/40 transition-all active:scale-95 cursor-pointer"
            >
              <ShieldCheck size={16} className="fill-white stroke-[#16A34A]" />
              <span>OK - Accept Pickup</span>
            </button>
          </div>
        </section>
      )}

      {/* Primary Summary Call-to-action Banner */}
      <section 
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#16A34A] to-[#166534] p-5 text-white shadow-md cursor-pointer"
        onClick={() => setActiveTab('map')}
      >
        <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/10 blur-xl"></div>
        <div className="absolute right-4 top-4">
          <Sparkles size={24} className="opacity-20 text-white" />
        </div>

        <div className="relative z-10 flex flex-col gap-1">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black leading-none">
              {availableDonations.length}
            </span>
            <span className="text-xs font-medium opacity-90">food donations waiting for pickup</span>
          </div>
          <p className="text-xs font-semibold opacity-90 mt-1 max-w-[240px] leading-relaxed">
            Fresh prepared surplus meals are ready for transport and distribution to local shelter networks.
          </p>
          <div className="mt-3.5 flex items-center gap-1.5 text-xs font-bold bg-white/20 hover:bg-white/35 w-fit px-3 py-1.5 rounded-lg border border-white/10 transition-all">
            <span>Explore Map View</span>
            <ChevronRight size={12} />
          </div>
        </div>
      </section>

      {/* High Fidelity Impact Numbers */}
      <section className="flex flex-col gap-2.5">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Your Rescue Impact
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-3xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Pickups</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#16A34A] flex items-center justify-center">
                <HeartHandshake size={14} />
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-800 tracking-tight">42</span>
              <span className="text-[10px] font-bold text-[#16A34A] bg-emerald-50 px-1 py-0.5 rounded">Completed</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-3xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Meals Rescued</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#16A34A] flex items-center justify-center">
                <Utensils size={14} />
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-800 tracking-tight">1,860</span>
              <span className="text-[10px] font-bold text-slate-400">Portions</span>
            </div>
          </div>
        </div>
      </section>

      {/* Available Near You Listings */}
      <section className="flex flex-col gap-3 pb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Available Near You ({availableDonations.length})
          </h2>
          <button 
            className="text-xs font-bold text-[#16A34A] hover:underline cursor-pointer"
            onClick={() => setActiveTab('map')}
          >
            See Map View
          </button>
        </div>

        {availableDonations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col items-center text-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
              <AlertCircle size={20} />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-xs font-bold text-slate-700">All caught up!</p>
              <p className="text-[10px] text-slate-400">No pending donations waiting for volunteer pickup right now.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {availableDonations.map((item) => (
              <div 
                key={item.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-3xs hover:border-slate-200 transition-all overflow-hidden flex flex-col p-4 gap-3.5 relative"
              >
                {/* Diet Classification Tag */}
                <div className="absolute right-4 top-4">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${
                    item.classification === 'veg'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
                      : 'bg-rose-50 text-rose-800 border-rose-100'
                  }`}>
                    {item.classification === 'veg' ? '🥗 VEG' : '🍗 NON-VEG'}
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                    <img 
                      alt={item.name}
                      src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col min-w-0 pr-12">
                    <h3 className="font-bold text-slate-800 text-sm truncate">{item.name}</h3>
                    <p className="text-[11px] font-semibold text-slate-400 mt-0.5 flex items-center gap-1">
                      <span>Donor:</span>
                      <span className="text-slate-700 font-bold truncate">
                        {item.donorName || restaurantName || 'ABC Grand Kitchen'}
                      </span>
                    </p>
                    <p className="text-xs font-black text-[#16A34A] mt-1 bg-emerald-50/50 w-fit px-2 py-0.5 rounded border border-emerald-100/40">
                      {item.portions} Meals Available
                    </p>
                  </div>
                </div>

                {/* Donor Contact & Address Strip */}
                <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 flex flex-col gap-1.5 text-[10px]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-slate-500 font-semibold truncate">
                      <Building size={11} className="text-[#16A34A] shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>
                    <a
                      href={`tel:${item.donorPhone || '+91 94443 12260'}`}
                      className="text-[#16A34A] font-bold hover:underline flex items-center gap-0.5 shrink-0 ml-1"
                    >
                      <Phone size={10} />
                      <span>{item.donorPhone || '+91 94443 12260'}</span>
                    </a>
                  </div>

                  <div className="flex items-center justify-between text-slate-400 font-medium pt-1 border-t border-slate-200/50">
                    <div className="flex items-center gap-1">
                      <MapPin size={10} className="text-slate-400" />
                      <span>0.8 km from your hub</span>
                    </div>
                    <div className="flex items-center gap-1 text-rose-500 font-semibold">
                      <Clock size={10} />
                      <span>Before {item.bestBefore || '12:30 PM'}</span>
                    </div>
                  </div>
                </div>

                {/* Two Action Buttons: Donor Details & OK (Accept) */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    className="h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    onClick={() => handleOpenDetails(item)}
                  >
                    <Eye size={13} />
                    <span>Donor Details</span>
                  </button>

                  <button
                    type="button"
                    className="h-10 bg-[#16A34A] hover:bg-[#166534] text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-3xs cursor-pointer transition-all active:scale-95"
                    onClick={() => handleAcceptPickup(item.id)}
                  >
                    <ShieldCheck size={14} className="fill-white stroke-[#16A34A]" />
                    <span>OK - Accept</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* DONOR DETAILS MODAL POPUP */}
      {selectedModalDonation && (
        <VolunteerDonorDetailsModal
          donation={selectedModalDonation}
          onClose={() => setSelectedModalDonation(null)}
          onAccept={(id) => {
            handleAcceptPickup(id);
            setSelectedModalDonation(null);
          }}
        />
      )}
    </div>
  );
};
