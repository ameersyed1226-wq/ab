import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { ArrowLeft, Check, Copy, Phone, ShieldCheck, MapPin, Sparkles, Navigation, Clock, Activity, Award, MessageCircle, Eye } from 'lucide-react';
import { GoogleMap } from './GoogleMap';
import { calculateDistanceKm, formatDistanceString, calculateEtaMinutes } from '../utils/distance';

interface DonationDetailsScreenProps {
  id: string;
}

export const DonationDetailsScreen: React.FC<DonationDetailsScreenProps> = ({ id }) => {
  const { donations, setSelectedDonationId, simulateStatusProgress, volunteerLocation } = useApp();
  const [copied, setCopied] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [showVolunteerContact, setShowVolunteerContact] = useState(false);

  // Find target donation
  const donation = donations.find(d => d.id === id);

  if (!donation) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-100">
        <p className="text-slate-500 text-sm">Donation batch not found.</p>
        <button
          className="mt-3 text-xs font-bold text-[#006b2c] hover:underline"
          onClick={() => setSelectedDonationId(null)}
        >
          Return to list
        </button>
      </div>
    );
  }

  const handleCopyPin = () => {
    navigator.clipboard.writeText(donation.pin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isCompleted = donation.status === 'delivered';

  // Determine current volunteer location for map
  const volLoc = donation.volunteerLocation || volunteerLocation;

  // Real distance between volunteer live coordinates and donor kitchen coordinates
  const distanceKm = calculateDistanceKm(
    volLoc?.lat || 11.3920,
    volLoc?.lng || 79.6900,
    donation.latitude || 11.3962,
    donation.longitude || 79.6936
  );

  // Get enhanced status label
  const getStatusLabel = () => {
    switch (donation.status) {
      case 'waiting_pickup': return 'Waiting for Pickup';
      case 'volunteer_assigned': return 'Courier Assigned';
      case 'en_route_to_pickup': return 'En Route to Pickup';
      case 'courier_on_way': return 'Volunteer Arrived';
      case 'food_collected': return 'Food Collected';
      case 'delivered': return 'Delivered Safe';
      default: return 'Processing';
    }
  };

  const getStatusColor = () => {
    switch (donation.status) {
      case 'en_route_to_pickup': return 'bg-violet-50 text-violet-800';
      case 'food_collected': return 'bg-teal-50 text-teal-800';
      case 'delivered': return 'bg-emerald-50 text-[#006b2c]';
      default: return isCompleted ? 'bg-emerald-50 text-[#006b2c]' : 'bg-amber-50 text-amber-800';
    }
  };

  return (
    <div className="flex flex-col w-full pb-8">
      {/* Detail Back Header Navigation */}
      <div className="-ml-3 mb-4 flex items-center gap-1">
        <button
          className="w-10 h-10 rounded-full flex items-center justify-center text-slate-800 hover:bg-slate-100 transition-colors"
          onClick={() => setSelectedDonationId(null)}
          aria-label="Back"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Donor Portal</span>
          <h1 className="text-sm font-bold text-slate-800 leading-none">Donation Details</h1>
        </div>
      </div>

      {/* Real-time Status Alert Banner for En Route / Arrived / Collected */}
      {donation.status === 'en_route_to_pickup' && (
        <div className="mb-4 bg-gradient-to-r from-violet-600 to-purple-700 text-white p-3.5 rounded-2xl shadow-md flex items-center justify-between animate-fade-in border border-violet-400/30">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🚗</span>
            <div className="flex flex-col">
              <span className="text-xs font-black uppercase tracking-wider">Volunteer is En Route to Pickup!</span>
              <span className="text-[11px] text-violet-100 font-medium">
                {donation.courier?.name || 'Ameer Syed'} is heading to your kitchen now • Live GPS Active
              </span>
            </div>
          </div>
          <span className="text-[10px] font-extrabold bg-white/20 px-2 py-1 rounded-lg">ETA 5 mins</span>
        </div>
      )}

      {donation.status === 'courier_on_way' && (
        <div className="mb-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-3.5 rounded-2xl shadow-md flex items-center justify-between animate-fade-in border border-emerald-400/30">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">📍</span>
            <div className="flex flex-col">
              <span className="text-xs font-black uppercase tracking-wider">Volunteer Arrived at Kitchen!</span>
              <span className="text-[11px] text-emerald-100 font-medium">
                {donation.courier?.name || 'Ameer Syed'} is outside. Provide Handoff PIN: <strong>{donation.pin}</strong>
              </span>
            </div>
          </div>
        </div>
      )}

      {donation.status === 'food_collected' && (
        <div className="mb-4 bg-gradient-to-r from-teal-600 to-emerald-700 text-white p-3.5 rounded-2xl shadow-md flex items-center justify-between animate-fade-in border border-teal-400/30">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">📦</span>
            <div className="flex flex-col">
              <span className="text-xs font-black uppercase tracking-wider">Food Successfully Collected!</span>
              <span className="text-[11px] text-teal-100 font-medium">
                {donation.courier?.name || 'Ameer Syed'} safely secured the {donation.portions} meals. Now delivering to shelter.
              </span>
            </div>
          </div>
          <span className="text-[10px] font-extrabold bg-white/20 px-2 py-1 rounded-lg">Collected</span>
        </div>
      )}

      {/* Hero Card with Food Media */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-slate-100 shadow-sm aspect-[16/9] mb-4 group border border-slate-100">
        <img
          alt={donation.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
          src={donation.image}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-white border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Steam Hot &amp; Fresh</span>
          </div>
          <div className="flex items-center gap-1 bg-white text-slate-800 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-xs">
            <ShieldCheck size={11} className="text-[#006b2c] fill-emerald-100" />
            <span>Batch #{donation.id.toUpperCase().slice(-7)}</span>
          </div>
        </div>
      </div>

      {/* Title & Primary Status Pill */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-4 border border-slate-100 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col">
            <h2 className="text-base font-bold text-slate-800">{donation.name}</h2>
            <p className="text-xs text-slate-500 font-semibold">{donation.portions} Portions • Prepared Catering Tray</p>
          </div>
          
          {/* Status Pill */}
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold self-start ${getStatusColor()}`}>
            {!isCompleted && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse opacity-60"></span>}
            <span>{getStatusLabel()}</span>
          </div>
        </div>

        {/* Quick Info Grid */}
        <div className="grid grid-cols-2 gap-2 mt-1 pt-3 border-t border-slate-50">
          <div className="bg-slate-50 rounded-xl p-2.5 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-[#006b2c]">
              <Clock size={14} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] font-bold text-slate-400 uppercase">Prepared</span>
              <span className="text-xs font-bold text-slate-800 truncate">{donation.preparedTime}</span>
            </div>
          </div>
          
          <div className="bg-slate-50 rounded-xl p-2.5 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-rose-600">
              <Activity size={14} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] font-bold text-slate-400 uppercase">Consume Before</span>
              <span className="text-xs font-bold text-rose-600 truncate">{donation.bestBefore}</span>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-2.5 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-emerald-600">
              <Award size={14} className="fill-emerald-50" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] font-bold text-slate-400 uppercase">Food Category</span>
              <span className="text-xs font-bold text-slate-800 truncate">
                {donation.classification === 'veg' ? '100% Vegetarian' : 'Non-Vegetarian'}
              </span>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-2.5 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-600">
              <MapPin size={14} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] font-bold text-slate-400 uppercase">Pickup Source</span>
              <span className="text-xs font-bold text-slate-800 truncate">ABC Restaurant</span>
            </div>
          </div>
        </div>

        {/* Display Notes if any */}
        {donation.notes && (
          <div className="bg-emerald-50/20 rounded-xl p-3 border border-emerald-50 text-[11px] text-slate-600 mt-1 leading-relaxed">
            <strong className="text-slate-700 block mb-0.5">Donation Notes:</strong>
            {donation.notes}
          </div>
        )}
      </div>

      {/* Assigned Volunteer Card (Accepted State) - Styled high-fidelity to match mockup */}
      {donation.courier ? (
        <div className="flex flex-col gap-3.5 mb-4">
          {/* Header section with live status bullet and region badge */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#006b2c] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#006b2c]"></span>
              </span>
              <span className="text-sm font-black text-slate-800 tracking-tight">
                Active Courier Assigned
              </span>
            </div>
            <span className="text-[10px] font-bold text-[#006b2c] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 uppercase tracking-wider">
              Chidambaram
            </span>
          </div>

          {/* Full bleed Map container for active live tracking */}
          <div className="h-64 rounded-2xl overflow-hidden border border-slate-100 relative shadow-sm">
            <GoogleMap 
              mode="volunteer_route"
              activeRoute={{
                startLat: volLoc?.lat || 11.3962, // Volunteer's current position
                startLng: volLoc?.lng || 79.6936,
                endLat: donation.latitude || 11.3985, // Donor's pickup spot
                endLng: donation.longitude || 79.6965
              }}
            />
            
            {/* Live Location pulsing overlay badge */}
            <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded-xl border border-slate-100 flex items-center gap-2 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#006b2c] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#006b2c]"></span>
              </span>
              <span className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider">
                {donation.courier.name.split('(')[0].trim()} • {
                  donation.status === 'en_route_to_pickup' ? 'En Route to You' :
                  donation.status === 'courier_on_way' ? 'At Your Location' :
                  donation.status === 'food_collected' ? 'Delivering to Shelter' :
                  'On Standby'
                }
              </span>
            </div>

            {/* LIVE badge */}
            {(donation.status === 'en_route_to_pickup' || donation.status === 'volunteer_assigned') && (
              <div className="absolute top-3 right-3 z-10 bg-rose-600 text-white text-[9px] font-extrabold px-2 py-1 rounded-lg shadow-md flex items-center gap-1 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                <span>LIVE</span>
              </div>
            )}

            {/* Quick floating compass badge */}
            <div className="absolute bottom-3 right-3 z-10 bg-slate-900/85 text-white text-[9px] font-bold px-2 py-1.5 rounded-lg shadow-md">
              GPS Synchronized Live
            </div>
          </div>

          {/* REAL-TIME DISTANCE & GPS TRACKING METRICS CARD */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-4 shadow-md border border-slate-700/60 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-700/50 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400">
                  Real-Time Volunteer Tracking
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-300 bg-white/10 px-2 py-0.5 rounded-lg border border-white/10">
                Live GPS Active
              </span>
            </div>

            {/* Distance & ETA Highlights */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-white/10 rounded-xl p-3 border border-white/10 flex flex-col">
                <span className="text-[9px] font-bold uppercase text-slate-400">Live Distance to Kitchen</span>
                <span className="text-sm font-black text-white mt-1 leading-snug">
                  {formatDistanceString(distanceKm, donation.status)}
                </span>
              </div>

              <div className="bg-white/10 rounded-xl p-3 border border-white/10 flex flex-col">
                <span className="text-[9px] font-bold uppercase text-slate-400">Estimated Arrival (ETA)</span>
                <span className="text-sm font-black text-emerald-400 mt-1 leading-snug">
                  {calculateEtaMinutes(distanceKm, donation.status)}
                </span>
              </div>
            </div>

            {/* Location Coordinates Details */}
            <div className="bg-white/5 rounded-xl p-2.5 border border-white/5 flex flex-col gap-1.5 text-[10px]">
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1">
                  <span>🚴 Volunteer Location:</span>
                </span>
                <span className="font-mono font-bold text-emerald-300">
                  {volLoc ? `${volLoc.lat.toFixed(4)}°N, ${volLoc.lng.toFixed(4)}°E` : '11.3920°N, 79.6900°E'}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-300 border-t border-white/5 pt-1">
                <span className="flex items-center gap-1">
                  <span>🏪 Donor Kitchen Location:</span>
                </span>
                <span className="font-mono font-bold text-slate-200">
                  {(donation.latitude || 11.3962).toFixed(4)}°N, {(donation.longitude || 79.6936).toFixed(4)}°E
                </span>
              </div>
            </div>
          </div>

          {/* Volunteer Contact & Details Card */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100/80 shadow-[0_4px_20px_rgba(0,107,44,0.04)] flex flex-col gap-4">
            
            {/* Volunteer profile row */}
            <div className="flex items-center gap-3 bg-slate-50/80 border border-slate-100/50 p-3 rounded-xl">
              <img
                className="w-10 h-10 rounded-full object-cover border-2 border-emerald-200"
                src={donation.courier.avatar}
                alt={donation.courier.name}
              />
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-black text-slate-800 truncate">{donation.courier.name}</span>
                  <ShieldCheck size={12} className="text-[#006b2c] fill-emerald-50 shrink-0" />
                </div>
                <span className="text-[9px] font-bold text-[#006b2c]">Verified Volunteer Rescuer</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  ⭐ 4.9
                </span>
              </div>
            </div>

            {/* Contact Actions — Phone, SMS, Toggle Details */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                {/* Phone call dialer button */}
                <a
                  className="flex-1 h-12 rounded-xl bg-[#006b2c] hover:bg-emerald-800 text-white flex items-center justify-center gap-2 font-bold text-xs shadow-sm active:scale-95 transition-all"
                  href={`tel:${donation.courier.phone}`}
                  aria-label="Call volunteer courier"
                >
                  <Phone size={16} className="stroke-[2.5px]" />
                  <span>Call: {donation.courier.phone}</span>
                </a>
              </div>

              <div className="flex items-center gap-2">
                <a
                  className="flex-1 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center gap-2 font-bold text-xs transition-all"
                  href={`sms:${donation.courier.phone}`}
                >
                  <MessageCircle size={14} />
                  <span>Send SMS</span>
                </a>
                <button
                  className="flex-1 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center gap-2 font-bold text-xs transition-all cursor-pointer"
                  onClick={() => setShowVolunteerContact(!showVolunteerContact)}
                >
                  <Eye size={14} />
                  <span>{showVolunteerContact ? 'Hide Details' : 'View Details'}</span>
                </button>
              </div>
            </div>

            {/* Expandable Volunteer Details */}
            {showVolunteerContact && (
              <div className="bg-emerald-50/30 rounded-xl p-3 border border-emerald-100/50 flex flex-col gap-2 text-xs animate-fade-in">
                <div className="flex items-center justify-between text-slate-500">
                  <span>📞 Phone Number:</span>
                  <a href={`tel:${donation.courier.phone}`} className="font-bold text-[#006b2c] underline">{donation.courier.phone}</a>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>⏱️ ETA:</span>
                  <span className="font-bold text-slate-800">{donation.courier.eta}</span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>✅ Verified:</span>
                  <span className="font-bold text-[#006b2c]">{donation.courier.verified ? 'Yes — ID Verified' : 'Pending'}</span>
                </div>
                {volLoc && (
                  <div className="flex items-center justify-between text-slate-500">
                    <span>📍 Current Location:</span>
                    <span className="font-bold text-violet-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-ping"></span>
                      {volLoc.lat.toFixed(4)}°N, {volLoc.lng.toFixed(4)}°E
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Large status display bar */}
            <div className={`flex-1 h-12 rounded-xl flex items-center justify-center gap-2 font-black text-xs tracking-wide shadow-sm ${
              donation.status === 'en_route_to_pickup' ? 'bg-violet-600 text-white' :
              donation.status === 'food_collected' ? 'bg-teal-600 text-white' :
              donation.status === 'courier_on_way' ? 'bg-emerald-600 text-white' :
              'bg-[#006b2c] text-white'
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
              <span>
                {donation.status === 'en_route_to_pickup' ? `${donation.courier.name.split(' ')[0].toUpperCase()} EN ROUTE • ${donation.courier.eta}` :
                 donation.status === 'food_collected' ? `FOOD COLLECTED • DELIVERING` :
                 donation.status === 'courier_on_way' ? `${donation.courier.name.split(' ')[0].toUpperCase()} ARRIVED AT LOCATION` :
                 `${donation.courier.name.split(' ')[0].toUpperCase()} EN ROUTE • ${donation.courier.eta}`}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Searching Volunteer State */
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-4 border border-slate-100 text-center flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500">
            <Activity size={20} className="animate-pulse" />
          </div>
          <h3 className="text-xs font-bold text-slate-800">Broadcasting to Couriers...</h3>
          <p className="text-[10px] text-slate-500 leading-relaxed max-w-[280px]">
            The zero-waste network is matching your batch with nearby volunteer riders. Ameer Syed usually claims in under a minute!
          </p>
        </div>
      )}

      {/* Live Donation Lifecycle Timeline & Interactive simulator! */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Donation Status</h3>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold text-slate-400">Step {donation.currentStep} of 5</span>
            
            {/* SIMULATOR BUTTON */}
            {!isCompleted && (
              <button
                className="px-2 py-1 rounded bg-amber-500 text-white text-[9px] font-bold hover:bg-amber-600 active:scale-95 transition-transform shadow-xs cursor-pointer"
                onClick={() => simulateStatusProgress(donation.id)}
                title="Simulate the courier progressing through the checklist steps"
              >
                Simulate Next Step →
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col relative pl-1">
          {/* Step 1: Donation Posted */}
          <div className="flex items-start gap-3.5 relative pb-6">
            <div className={`absolute left-3.5 top-6 bottom-0 w-0.5 ${donation.currentStep > 1 ? 'bg-[#006b2c]' : 'bg-slate-100'}`}></div>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-xs z-10 text-xs font-bold ${
              donation.currentStep >= 1 ? 'bg-[#006b2c] text-white' : 'bg-slate-100 text-slate-400'
            }`}>
              {donation.currentStep > 1 ? <Check size={14} className="stroke-[3px]" /> : '1'}
            </div>
            <div className="flex flex-col pt-0.5 text-xs">
              <span className={`font-bold ${donation.currentStep >= 1 ? 'text-slate-800' : 'text-slate-400'}`}>Donation Posted</span>
              <span className="text-[10px] text-slate-400">Logged by ABC Restaurant Kitchen at 08:35 AM</span>
            </div>
          </div>

          {/* Step 2: Volunteer Notified */}
          <div className="flex items-start gap-3.5 relative pb-6">
            <div className={`absolute left-3.5 top-6 bottom-0 w-0.5 ${donation.currentStep > 2 ? 'bg-[#006b2c]' : 'bg-slate-100'}`}></div>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-xs z-10 text-xs font-bold ${
              donation.currentStep >= 2 ? 'bg-[#006b2c] text-white' : 'bg-slate-100 text-slate-400'
            }`}>
              {donation.currentStep > 2 ? <Check size={14} className="stroke-[3px]" /> : '2'}
            </div>
            <div className="flex flex-col pt-0.5 text-xs">
              <span className={`font-bold ${donation.currentStep >= 2 ? 'text-slate-800' : 'text-slate-400'}`}>Volunteer Notified</span>
              <span className="text-[10px] text-slate-400">Broadcast sent to 8 rescue couriers nearby</span>
            </div>
          </div>

          {/* Step 3: En Route to Pickup */}
          <div className="flex items-start gap-3.5 relative pb-6">
            <div className={`absolute left-3.5 top-6 bottom-0 w-0.5 ${
              (donation.status === 'food_collected' || donation.status === 'delivered') ? 'bg-[#006b2c]' : 'bg-slate-100'
            }`}></div>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-xs z-10 text-xs font-bold ${
              (donation.status === 'food_collected' || donation.status === 'delivered')
                ? 'bg-[#006b2c] text-white'
                : (donation.status === 'en_route_to_pickup' || donation.status === 'courier_on_way')
                ? 'bg-violet-500 text-white ring-4 ring-violet-100'
                : 'bg-slate-100 text-slate-400'
            }`}>
              {(donation.status === 'food_collected' || donation.status === 'delivered') ? <Check size={14} className="stroke-[3px]" /> : '3'}
            </div>
            <div className="flex flex-col pt-0.5 text-xs">
              <span className={`font-bold ${
                (donation.status === 'en_route_to_pickup' || donation.status === 'courier_on_way')
                  ? 'text-violet-700'
                  : (donation.status === 'food_collected' || donation.status === 'delivered')
                  ? 'text-slate-800'
                  : 'text-slate-400'
              }`}>
                En Route to Pickup
              </span>
              <span className="text-[10px] text-slate-400">
                {donation.courier ? `${donation.courier.name} claimed the job and is en route.` : 'Finding closest courier volunteer.'}
              </span>
              {(donation.status === 'en_route_to_pickup' || donation.status === 'courier_on_way') && volLoc && (
                <span className="text-[10px] text-violet-600 font-bold mt-0.5 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-violet-500 animate-ping"></span>
                  Live GPS: {volLoc.lat.toFixed(4)}°N, {volLoc.lng.toFixed(4)}°E
                </span>
              )}
            </div>
          </div>

          {/* Step 4: Food Collected */}
          <div className="flex items-start gap-3.5 relative pb-6">
            <div className={`absolute left-3.5 top-6 bottom-0 w-0.5 ${donation.status === 'delivered' ? 'bg-[#006b2c]' : 'bg-slate-100'}`}></div>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-xs z-10 text-xs font-bold ${
              donation.status === 'delivered'
                ? 'bg-[#006b2c] text-white'
                : donation.status === 'food_collected'
                ? 'bg-teal-500 text-white ring-4 ring-teal-100 animate-pulse'
                : 'bg-slate-100 text-slate-400'
            }`}>
              {donation.status === 'delivered' ? <Check size={14} className="stroke-[3px]" /> : '4'}
            </div>
            <div className="flex flex-col pt-0.5 text-xs">
              <span className={`font-bold ${
                donation.status === 'food_collected'
                  ? 'text-teal-700 font-black'
                  : donation.status === 'delivered'
                  ? 'text-slate-800'
                  : 'text-slate-400'
              }`}>
                Food Collected &amp; Handover
              </span>
              <span className="text-[10px] text-slate-400">
                {donation.status === 'food_collected'
                  ? 'Custody verified! Food safely secured in courier vehicle.'
                  : 'Verify security PIN at dispatch desk for custody handover.'}
              </span>
            </div>
          </div>

          {/* Step 5: Delivered to Shelter */}
          <div className="flex items-start gap-3.5 relative">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-xs z-10 text-xs font-bold ${
              donation.currentStep === 5 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'
            }`}>
              {donation.currentStep === 5 ? <Check size={14} className="stroke-[3px]" /> : '5'}
            </div>
            <div className="flex flex-col pt-0.5 text-xs">
              <span className={`font-bold ${donation.currentStep === 5 ? 'text-emerald-700' : 'text-slate-400'}`}>
                Delivered to Shelter
              </span>
              <span className="text-[10px] text-slate-400">St. Jude Community Kitchen or local partner verified safety receipt.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Verification PIN Modal Dialog Trigger */}
      <div className="mt-4 bg-emerald-50/40 border border-emerald-100 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#006b2c] text-white flex items-center justify-center font-bold">
            ***
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Handoff Verification</span>
            <span className="text-sm font-mono font-bold tracking-widest text-slate-800">PIN: {donation.pin}</span>
          </div>
        </div>
        <button
          className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold active:scale-95 transition-all cursor-pointer shadow-xs"
          onClick={handleCopyPin}
          type="button"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* MOCK MAP MODAL OVERLAY */}
      {showMapModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative">
            {/* Map representation with Google Maps */}
            <div className="h-64 relative overflow-hidden">
              <GoogleMap 
                mode="volunteer_route"
                activeRoute={{
                  startLat: volLoc?.lat || 11.3962,
                  startLng: volLoc?.lng || 79.6936,
                  endLat: donation.latitude || 11.3985,
                  endLng: donation.longitude || 79.6965
                }}
              />
              <span className="absolute bottom-3 left-3 bg-slate-900/85 text-white text-[9px] font-bold px-2 py-1 rounded shadow-md z-10">
                Live GPS Tracker Active
              </span>
            </div>

            <div className="p-5 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <img
                  className="w-10 h-10 rounded-full object-cover"
                  src={donation.courier?.avatar}
                  alt="Courier"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{donation.courier?.name}</h4>
                  <p className="text-[10px] text-slate-500">Riding en route to your location</p>
                </div>
              </div>
              <button
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer"
                onClick={() => setShowMapModal(false)}
              >
                Close Tracking Map
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
