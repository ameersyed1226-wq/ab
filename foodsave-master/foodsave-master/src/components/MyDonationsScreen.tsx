import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Leaf, Clock, ArrowRight, CheckCircle, ChevronDown, ChevronUp, AlertCircle, RefreshCw, Phone, MapPin, Navigation, Truck, Package, ShieldCheck } from 'lucide-react';
import { DonationDetailsScreen } from './DonationDetailsScreen';
import { Donation } from '../types';

// Status config for each donation status
const getStatusConfig = (donation: Donation) => {
  switch (donation.status) {
    case 'waiting_pickup':
      return {
        label: 'Broadcasting to Couriers',
        sublabel: 'Finding nearby volunteers...',
        color: 'bg-amber-50 text-amber-800 border-amber-100',
        dotColor: 'bg-amber-500',
        icon: '📡',
        progress: 20,
        progressColor: 'bg-amber-400',
      };
    case 'volunteer_assigned':
      return {
        label: 'Courier Assigned',
        sublabel: donation.courier ? `${donation.courier.name.split(' ')[0]} accepted • ETA ${donation.courier.eta}` : 'Volunteer matched!',
        color: 'bg-blue-50 text-blue-800 border-blue-100',
        dotColor: 'bg-blue-500',
        icon: '🤝',
        progress: 40,
        progressColor: 'bg-blue-500',
      };
    case 'en_route_to_pickup':
      return {
        label: 'En Route to Pickup',
        sublabel: donation.courier ? `${donation.courier.name.split(' ')[0]} is heading to you` : 'Courier on the way',
        color: 'bg-violet-50 text-violet-800 border-violet-100',
        dotColor: 'bg-violet-500',
        icon: '🚗',
        progress: 55,
        progressColor: 'bg-violet-500',
      };
    case 'courier_on_way':
      return {
        label: 'Volunteer Arrived',
        sublabel: 'Ready for food handover',
        color: 'bg-emerald-50 text-emerald-800 border-emerald-100',
        dotColor: 'bg-emerald-500',
        icon: '📍',
        progress: 70,
        progressColor: 'bg-emerald-500',
      };
    case 'food_collected':
      return {
        label: 'Food Collected',
        sublabel: 'Food secured, delivering to shelter',
        color: 'bg-teal-50 text-teal-800 border-teal-100',
        dotColor: 'bg-teal-500',
        icon: '✅',
        progress: 85,
        progressColor: 'bg-teal-500',
      };
    case 'delivered':
      return {
        label: 'Delivered Safe',
        sublabel: `${donation.portions} meals rescued!`,
        color: 'bg-emerald-50 text-[#006b2c] border-emerald-100',
        dotColor: 'bg-[#006b2c]',
        icon: '🎉',
        progress: 100,
        progressColor: 'bg-[#006b2c]',
      };
    case 'expired':
      return {
        label: 'Expired',
        sublabel: 'Unclaimed, past best-before time',
        color: 'bg-rose-50 text-rose-700 border-rose-100',
        dotColor: 'bg-rose-500',
        icon: '⏰',
        progress: 0,
        progressColor: 'bg-rose-400',
      };
    default:
      return {
        label: 'Processing',
        sublabel: '',
        color: 'bg-slate-50 text-slate-600 border-slate-100',
        dotColor: 'bg-slate-400',
        icon: '⏳',
        progress: 0,
        progressColor: 'bg-slate-400',
      };
  }
};

// Mini timeline steps for the card
const TIMELINE_STEPS = [
  { key: 'posted', label: 'Posted' },
  { key: 'assigned', label: 'Assigned' },
  { key: 'enroute', label: 'En Route' },
  { key: 'collected', label: 'Collected' },
  { key: 'delivered', label: 'Delivered' },
];

const getCompletedSteps = (status: string): number => {
  switch (status) {
    case 'waiting_pickup': return 1;
    case 'volunteer_assigned': return 2;
    case 'en_route_to_pickup': return 3;
    case 'courier_on_way': return 3;
    case 'food_collected': return 4;
    case 'delivered': return 5;
    default: return 0;
  }
};

export const MyDonationsScreen: React.FC = () => {
  const { donations, selectedDonationId, setSelectedDonationId, setActiveTab } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'active' | 'completed' | 'expired'>('active');
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  // Router behavior - if a details sub-page is active, render it!
  if (selectedDonationId) {
    return <DonationDetailsScreen id={selectedDonationId} />;
  }

  // Segment donations based on tabs
  const activeDonations = donations.filter(d => d.status !== 'delivered' && d.status !== 'expired');
  const completedDonations = donations.filter(d => d.status === 'delivered');
  const expiredDonations = donations.filter(d => d.status === 'expired');

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering page navigation
    setExpandedCardId(expandedCardId === id ? null : id);
  };

  const handleCardClick = (id: string) => {
    setSelectedDonationId(id);
  };

  return (
    <div className="flex flex-col w-full pb-8">
      {/* Header with Title and Eco Badge */}
      <div className="flex items-center justify-between mt-2 mb-4">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-slate-800">My Donations</h1>
          <p className="text-xs text-slate-500">Track active rescues and distribution history</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#006b2c]">
          <Leaf size={14} className="fill-emerald-100" />
          <span className="text-xs font-bold">65 Meals Today</span>
        </div>
      </div>

      {/* Horizontal Filter Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-full mb-5">
        <button
          className={`flex-1 py-2 px-3 rounded-full text-center text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === 'active'
              ? 'bg-[#006b2c] text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
          onClick={() => setActiveSubTab('active')}
        >
          <span>Active</span>
          <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold ${
            activeSubTab === 'active' ? 'bg-emerald-800 text-white' : 'bg-slate-200 text-slate-600'
          }`}>
            {activeDonations.length}
          </span>
        </button>

        <button
          className={`flex-1 py-2 px-3 rounded-full text-center text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === 'completed'
              ? 'bg-[#006b2c] text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
          onClick={() => setActiveSubTab('completed')}
        >
          <span>Completed</span>
        </button>

        <button
          className={`flex-1 py-2 px-3 rounded-full text-center text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === 'expired'
              ? 'bg-[#006b2c] text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
          onClick={() => setActiveSubTab('expired')}
        >
          <span>Expired</span>
        </button>
      </div>

      {/* Active Tab Panel */}
      {activeSubTab === 'active' && (
        <div className="flex flex-col gap-4">
          {activeDonations.length === 0 ? (
            <div className="bg-white rounded-xl p-8 border border-slate-100 text-center text-slate-500">
              <AlertCircle size={32} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm">No active rescues at the moment.</p>
              <button
                className="mt-3 text-[#006b2c] font-bold text-xs hover:underline"
                onClick={() => setActiveTab('add-food')}
              >
                Post new surplus batch
              </button>
            </div>
          ) : (
            activeDonations.map(donation => {
              const statusConfig = getStatusConfig(donation);
              const completedSteps = getCompletedSteps(donation.status);
              const isActive = donation.status !== 'waiting_pickup';

              return (
                <article
                  key={donation.id}
                  className="bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col gap-0 transition-transform active:scale-[0.99] cursor-pointer hover:border-emerald-100 overflow-hidden"
                  onClick={() => handleCardClick(donation.id)}
                >
                  {/* Main Content */}
                  <div className="p-4 flex flex-col gap-3.5">
                    <div className="flex items-start gap-3.5">
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                        <img alt={donation.name} className="w-full h-full object-cover" src={donation.image} />
                        <span className="absolute bottom-1 right-1 bg-white/90 backdrop-blur-sm rounded px-1.5 py-0.5 text-[9px] font-bold text-slate-800">
                          HOT
                        </span>
                      </div>
                      
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h2 className="text-sm font-bold text-slate-800 truncate">
                            {donation.classification === 'veg' ? '🍚' : '🍗'} {donation.name}
                          </h2>
                        </div>
                        <p className="text-xs text-[#006b2c] font-bold mt-0.5">
                          {donation.portions} Meals • Ready-to-eat
                        </p>
                        
                        {/* Enhanced Status Badge */}
                        <div className="flex items-center gap-1.5 mt-2">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusConfig.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotColor} ${donation.status !== 'delivered' ? 'animate-ping' : ''}`}></span>
                            <span>{statusConfig.icon}</span>
                            <span>{statusConfig.label}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Live Progress Bar */}
                    <div className="flex flex-col gap-1.5">
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${statusConfig.progressColor} transition-all duration-1000 ease-out`}
                          style={{ width: `${statusConfig.progress}%` }}
                        ></div>
                      </div>
                      <p className="text-[10px] font-semibold text-slate-400">{statusConfig.sublabel}</p>
                    </div>

                    {/* Mini Timeline Steps */}
                    <div className="flex items-center justify-between gap-0.5">
                      {TIMELINE_STEPS.map((step, idx) => {
                        const isCompleted = idx < completedSteps;
                        const isCurrent = idx === completedSteps - 1;
                        return (
                          <div key={step.key} className="flex flex-col items-center gap-1 flex-1">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold transition-all ${
                              isCompleted 
                                ? isCurrent 
                                  ? 'bg-[#006b2c] text-white ring-2 ring-emerald-200 scale-110' 
                                  : 'bg-[#006b2c] text-white' 
                                : 'bg-slate-100 text-slate-400'
                            }`}>
                              {isCompleted ? '✓' : idx + 1}
                            </div>
                            <span className={`text-[8px] font-bold text-center leading-none ${
                              isCompleted ? 'text-[#006b2c]' : 'text-slate-300'
                            }`}>
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Volunteer Info Strip (when assigned) */}
                    {donation.courier && (
                      <div 
                        className="flex items-center gap-2.5 bg-slate-50 rounded-xl p-2.5 border border-slate-100/50"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <img 
                          className="w-8 h-8 rounded-full object-cover border border-emerald-100 shrink-0" 
                          src={donation.courier.avatar} 
                          alt={donation.courier.name} 
                        />
                        <div className="flex flex-col min-w-0 flex-1">
                          <div className="flex items-center gap-1">
                            <span className="text-[11px] font-black text-slate-800 truncate">{donation.courier.name}</span>
                            <ShieldCheck size={11} className="text-[#006b2c] fill-emerald-50 shrink-0" />
                          </div>
                          <span className="text-[9px] font-bold text-slate-400">
                            {donation.status === 'en_route_to_pickup' ? '🚗 On the way' : 
                             donation.status === 'courier_on_way' ? '📍 At your location' : 
                             donation.status === 'food_collected' ? '📦 Delivering to shelter' : 
                             `ETA: ${donation.courier.eta}`}
                          </span>
                        </div>
                        <a
                          href={`tel:${donation.courier.phone}`}
                          className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[#006b2c] hover:bg-emerald-50 active:scale-95 transition-all shrink-0"
                          aria-label="Call volunteer"
                        >
                          <Phone size={13} className="stroke-[2.5px]" />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Footer Actions */}
                  <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-50 bg-slate-50/30">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Clock size={14} className="text-rose-500" />
                      <span className="text-xs">
                        Before <strong className="text-slate-700 font-semibold">{donation.bestBefore}</strong>
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button
                        className="inline-flex items-center gap-0.5 text-xs text-[#006b2c] font-bold hover:underline"
                        onClick={(e) => toggleExpand(donation.id, e)}
                      >
                        <span>{expandedCardId === donation.id ? 'Hide info' : 'Quick Info'}</span>
                        {expandedCardId === donation.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        className="inline-flex items-center gap-0.5 text-xs text-[#006b2c] font-bold hover:underline"
                        onClick={() => handleCardClick(donation.id)}
                      >
                        <span>Track</span>
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Collapsible expanded Quick Info section */}
                  {expandedCardId === donation.id && (
                    <div
                      className="flex flex-col gap-2 px-4 pb-4 pt-2 border-t border-dashed border-slate-100 bg-slate-50/50 text-xs"
                      onClick={(e) => e.stopPropagation()} // Stop click through to details router
                    >
                      <div className="flex items-center justify-between text-slate-500">
                        <span>Dispatch Hub:</span>
                        <span className="text-slate-800 font-semibold">Downtown Central Kitchen</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-500">
                        <span>Temperature:</span>
                        <span className="text-[#006b2c] font-bold">Insulated Steaming Pan (&gt; 63°C)</span>
                      </div>


                      {donation.courier ? (
                        <>
                          <div className="flex items-center justify-between text-slate-500">
                            <span>Courier Assigned:</span>
                            <span className="text-[#006b2c] font-semibold">{donation.courier.name}</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-500">
                            <span>Volunteer Phone:</span>
                            <a href={`tel:${donation.courier.phone}`} className="text-[#006b2c] font-bold underline">
                              {donation.courier.phone}
                            </a>
                          </div>
                          {donation.volunteerLocation && (
                            <div className="flex items-center justify-between text-slate-500">
                              <span>Live Location:</span>
                              <span className="text-violet-600 font-bold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-ping"></span>
                                GPS Active • {donation.volunteerLocation.lat.toFixed(4)}°N
                              </span>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center justify-between text-slate-500">
                          <span>Courier Assigned:</span>
                          <span className="text-amber-600 font-semibold flex items-center gap-1">
                            <RefreshCw size={10} className="animate-spin" /> Searching nearby volunteers...
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })
          )}

          {/* Quick-donate banner */}
          <div className="mt-2 p-4 rounded-xl bg-emerald-50/40 border border-emerald-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#006b2c] shadow-xs shrink-0">
                <Leaf size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800">Have more surplus food?</span>
                <span className="text-[10px] text-slate-500">Average rescue time is under 14 minutes</span>
              </div>
            </div>
            
            <button
              className="px-3.5 py-2 rounded-lg bg-[#006b2c] hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-0.5 shadow-xs transition-transform active:scale-95 cursor-pointer"
              onClick={() => setActiveTab('add-food')}
            >
              <span>Donate</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Completed Tab Panel */}
      {activeSubTab === 'completed' && (
        <div className="flex flex-col gap-4">
          {completedDonations.length === 0 ? (
            <div className="bg-white rounded-xl p-8 border border-slate-100 text-center text-slate-500">
              <CheckCircle size={32} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm">No completed donations yet.</p>
            </div>
          ) : (
            completedDonations.map(donation => (
              <article
                key={donation.id}
                className="bg-white border border-slate-100 rounded-xl p-4 shadow-xs flex flex-col gap-3 transition-transform active:scale-[0.99] cursor-pointer hover:border-emerald-100"
                onClick={() => handleCardClick(donation.id)}
              >
                <div className="flex items-start gap-3.5">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                    <img alt={donation.name} className="w-full h-full object-cover" src={donation.image} />
                    <span className="absolute bottom-1 right-1 bg-emerald-50 px-1.5 py-0.5 rounded text-[9px] text-[#006b2c] font-bold">
                      SAVED
                    </span>
                  </div>
                  
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-bold text-slate-800 truncate">
                        {donation.classification === 'veg' ? '🥖' : '🍖'} {donation.name}
                      </h2>
                      <CheckCircle size={16} className="text-emerald-600 fill-emerald-50" />
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{donation.portions} Meals Delivered</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold">
                        Delivered Today at 10:45 AM
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                  <span>Shelter: <strong className="text-slate-700">Hope Shelter &amp; St. Jude</strong></span>
                  <span className="text-[#006b2c] font-bold">Verified Safe Receipt</span>
                </div>
              </article>
            ))
          )}
        </div>
      )}

      {/* Expired Tab Panel */}
      {activeSubTab === 'expired' && (
        <div className="flex flex-col gap-4">
          {expiredDonations.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 bg-white border border-slate-100 rounded-2xl text-center">
              <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <Clock size={24} />
              </div>
              <h3 className="font-bold text-slate-800 mb-1">No Expired Batches</h3>
              <p className="text-xs text-slate-500 max-w-[280px]">
                All past donation postings were claimed and rescued before their expiration threshold.
              </p>
            </div>
          ) : (
            expiredDonations.map(donation => (
              <article
                key={donation.id}
                className="bg-white border border-slate-100 rounded-xl p-4 shadow-xs opacity-75"
              >
                <div className="flex items-start gap-3.5">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                    <img alt={donation.name} className="w-full h-full object-cover" src={donation.image} />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <h2 className="text-sm font-bold text-slate-400 truncate">{donation.name}</h2>
                    <p className="text-xs text-slate-400">{donation.portions} Meals Expired</p>
                    <span className="inline-flex self-start px-2 py-0.5 rounded bg-rose-50 text-rose-700 text-[10px] font-bold mt-2">
                      Unrescued Expired
                    </span>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      )}
    </div>
  );
};
