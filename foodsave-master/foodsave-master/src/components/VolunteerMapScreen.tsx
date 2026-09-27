import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Search, MapPin, Navigation, SlidersHorizontal, Clock, ArrowRight, ShieldCheck, Heart, Info, CheckCircle2, Phone, Building, Eye } from 'lucide-react';
import { VolunteerRescueFlow } from './VolunteerRescueFlow';
import { GoogleMap, MarkerData } from './GoogleMap';
import { VolunteerDonorDetailsModal } from './VolunteerDonorDetailsModal';

export const VolunteerMapScreen: React.FC = () => {
  const { donations, selectedDonationId, setSelectedDonationId, activeRescueId, acceptDonation } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [distanceFilter, setDistanceFilter] = useState<'all' | '1km' | '3km'>('all');
  const [dietFilter, setDietFilter] = useState<'all' | 'veg' | 'nonveg'>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<'all' | 'soon'>('all');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // If a rescue is active, render the rescue tracking workflow right on the map tab
  if (activeRescueId) {
    return <VolunteerRescueFlow />;
  }

  // Filter donations that can be picked up
  const openDonations = donations.filter(d => d.status === 'waiting_pickup');

  // Match queried/filtered items
  const filteredDonations = openDonations.filter(item => {
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (dietFilter !== 'all' && item.classification !== dietFilter) return false;
    return true;
  });

  const selectedItem = donations.find(d => d.id === selectedDonationId) || filteredDonations[0];

  const handleSelectPin = (id: string) => {
    setSelectedDonationId(id);
  };

  const handleAcceptPickup = (id: string) => {
    acceptDonation(id);
  };

  // Convert donations to Google Map marker format
  const mapMarkers: MarkerData[] = openDonations.map(d => ({
    id: d.id,
    name: d.name,
    portions: d.portions,
    classification: d.classification,
    lat: d.latitude || 11.3962,
    lng: d.longitude || 79.6936,
    location: d.location,
    notes: d.notes
  }));

  return (
    <div className="flex flex-col gap-4 py-1">
      {/* Top Search bar & filtering widgets */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-white border border-slate-100 rounded-xl px-3 py-2 flex items-center gap-2 shadow-3xs focus-within:ring-2 focus-within:ring-[#16A34A]/10">
            <Search size={14} className="text-slate-400" />
            <input 
              type="text"
              placeholder="Search donations..."
              className="bg-transparent text-xs text-slate-800 placeholder-slate-300 w-full focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
              showFilterPanel 
                ? 'border-[#16A34A] bg-emerald-50 text-[#16A34A]' 
                : 'border-slate-100 bg-white text-slate-500'
            }`}
            onClick={() => setShowFilterPanel(!showFilterPanel)}
          >
            <SlidersHorizontal size={15} />
          </button>
        </div>

        {/* Floating Filter Options */}
        {showFilterPanel && (
          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-md flex flex-col gap-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Map Filter Preferences</span>
              <button 
                className="text-[10px] text-slate-400 font-bold hover:underline"
                onClick={() => {
                  setDistanceFilter('all');
                  setDietFilter('all');
                  setUrgencyFilter('all');
                }}
              >
                Reset All
              </button>
            </div>

            <div className="flex flex-col gap-2.5">
              {/* Distance */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Distance</span>
                <div className="flex gap-1.5">
                  <button 
                    onClick={() => setDistanceFilter('all')} 
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all border ${
                      distanceFilter === 'all' 
                        ? 'bg-slate-800 text-white border-slate-800' 
                        : 'bg-slate-50 text-slate-600 border-transparent hover:border-slate-200'
                    }`}
                  >
                    Any distance
                  </button>
                  <button 
                    onClick={() => setDistanceFilter('1km')} 
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all border ${
                      distanceFilter === '1km' 
                        ? 'bg-slate-800 text-white border-slate-800' 
                        : 'bg-slate-50 text-slate-600 border-transparent hover:border-slate-200'
                    }`}
                  >
                    &lt; 1 km
                  </button>
                  <button 
                    onClick={() => setDistanceFilter('3km')} 
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all border ${
                      distanceFilter === '3km' 
                        ? 'bg-slate-800 text-white border-slate-800' 
                        : 'bg-slate-50 text-slate-600 border-transparent hover:border-slate-200'
                    }`}
                  >
                    1–3 km
                  </button>
                </div>
              </div>

              {/* Diet Classification */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Diet Classification</span>
                <div className="flex gap-1.5">
                  <button 
                    onClick={() => setDietFilter('all')} 
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all border ${
                      dietFilter === 'all' 
                        ? 'bg-slate-800 text-white border-slate-800' 
                        : 'bg-slate-50 text-slate-600 border-transparent hover:border-slate-200'
                    }`}
                  >
                    All Food Types
                  </button>
                  <button 
                    onClick={() => setDietFilter('veg')} 
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all border ${
                      dietFilter === 'veg' 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-100' 
                        : 'bg-slate-50 text-slate-600 border-transparent hover:border-slate-200'
                    }`}
                  >
                    🥗 Veg
                  </button>
                  <button 
                    onClick={() => setDietFilter('nonveg')} 
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all border ${
                      dietFilter === 'nonveg' 
                        ? 'bg-rose-50 text-rose-800 border-rose-100' 
                        : 'bg-slate-50 text-slate-600 border-transparent hover:border-slate-200'
                    }`}
                  >
                    🍗 Non-Veg
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Real Google Map Integration */}
      <section className="relative h-64 rounded-2xl overflow-hidden shadow-3xs border border-slate-100">
        <GoogleMap 
          mode="volunteer_view_all"
          markers={mapMarkers}
          selectedMarkerId={selectedItem?.id}
          onMarkerClick={handleSelectPin}
        />
      </section>

      {/* Selected Donation Detailed Bottom Card */}
      {selectedItem ? (
        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col gap-3.5 relative animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
              <img 
                src={selectedItem.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120'} 
                alt={selectedItem.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex-1 min-w-0 flex flex-col">
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-slate-800 text-sm truncate">{selectedItem.name}</h3>
                <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-extrabold border shrink-0 ${
                  selectedItem.classification === 'veg'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
                    : 'bg-rose-50 text-rose-800 border-rose-100'
                }`}>
                  {selectedItem.classification === 'veg' ? 'VEG' : 'NON-VEG'}
                </span>
              </div>
              
              <p className="text-[11px] text-slate-500 font-semibold mt-1">
                Store: <span className="font-bold text-slate-700">{selectedItem.location}</span>
              </p>

              {/* Badges strip */}
              <div className="flex gap-1.5 mt-2.5">
                <span className="bg-emerald-50 text-[#16A34A] border border-emerald-100/30 px-2 py-0.5 rounded-md font-bold text-[10px]">
                  {selectedItem.portions} Meals
                </span>
                <span className="bg-slate-50 text-slate-500 border border-slate-100 px-2 py-0.5 rounded-md font-bold text-[10px] flex items-center gap-1">
                  <Clock size={10} className="text-rose-500" />
                  <span>Before {selectedItem.bestBefore}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Dynamic Donor Request Box */}
          <div className="bg-emerald-50/60 rounded-xl p-3.5 border border-emerald-100 flex flex-col gap-1 text-xs text-slate-700 font-medium">
            <span className="text-[10px] font-extrabold text-[#16A34A] uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 size={11} className="fill-[#16A34A] stroke-white" />
              <span>Donor Special Requests &amp; Notes</span>
            </span>
            <p className="text-[11px] leading-relaxed text-slate-600 mt-1 font-bold italic">
              "{selectedItem.notes || 'No custom notes provided by donor.'}"
            </p>
          </div>

          {/* Donor Contact Strip */}
          <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 truncate">
              <Building size={13} className="text-[#16A34A] shrink-0" />
              <span className="font-bold text-slate-700 truncate">
                Donor: {selectedItem.donorName || 'ABC Grand Kitchen'}
              </span>
            </div>
            <a
              href={`tel:${selectedItem.donorPhone || '+91 94443 12260'}`}
              className="text-[#16A34A] font-extrabold flex items-center gap-1 shrink-0 hover:underline"
            >
              <Phone size={11} />
              <span>{selectedItem.donorPhone || '+91 94443 12260'}</span>
            </a>
          </div>

          {/* Action Buttons: View Donor Details & OK Accept */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className="h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              onClick={() => setShowDetailsModal(true)}
            >
              <Eye size={14} />
              <span>Donor Details</span>
            </button>

            <button
              type="button"
              className="h-11 bg-[#16A34A] hover:bg-[#166534] text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all active:scale-[0.98]"
              onClick={() => handleAcceptPickup(selectedItem.id)}
            >
              <ShieldCheck size={16} className="fill-white stroke-[#16A34A]" />
              <span>OK - Accept Pickup</span>
            </button>
          </div>
        </section>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 p-8 flex flex-col items-center text-center gap-3">
          <Info size={24} className="text-[#16A34A]" />
          <p className="text-xs font-bold text-slate-700">No donations available nearby at this moment.</p>
        </div>
      )}

      {/* Volunteer Donor Details Modal */}
      {showDetailsModal && selectedItem && (
        <VolunteerDonorDetailsModal
          donation={selectedItem}
          onClose={() => setShowDetailsModal(false)}
          onAccept={(id) => {
            handleAcceptPickup(id);
            setShowDetailsModal(false);
          }}
        />
      )}
    </div>
  );
};
