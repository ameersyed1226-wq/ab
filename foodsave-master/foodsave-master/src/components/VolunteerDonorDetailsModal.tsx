import React from 'react';
import { X, Phone, MapPin, Clock, ShieldCheck, Utensils, Navigation, MessageCircle, Building, FileText } from 'lucide-react';
import { Donation } from '../types';
import { GoogleMap } from './GoogleMap';

interface VolunteerDonorDetailsModalProps {
  donation: Donation;
  onClose: () => void;
  onAccept?: (id: string) => void;
}

export const VolunteerDonorDetailsModal: React.FC<VolunteerDonorDetailsModalProps> = ({ donation, onClose, onAccept }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center" onClick={onClose}>
      <div 
        className="bg-white rounded-t-3xl w-full max-w-[480px] max-h-[88vh] overflow-y-auto shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200"></div>
        </div>

        {/* Header */}
        <div className="px-5 pt-2 pb-4 flex items-center justify-between border-b border-slate-100">
          <div className="flex flex-col">
            <span className="text-[10px] font-extrabold text-[#16A34A] uppercase tracking-wider">Donor Information</span>
            <h2 className="text-base font-black text-slate-800 mt-0.5">Contact &amp; Pickup Details</h2>
          </div>
          <button 
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-all cursor-pointer"
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-4 flex flex-col gap-4">
          {/* Donor / Restaurant Profile Card */}
          <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl p-4 border border-emerald-100 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#16A34A] text-white flex items-center justify-center font-black text-lg shadow-sm">
                <Building size={22} />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-black text-slate-800 truncate">{donation.donorName || 'ABC Grand Kitchen'}</h3>
                  <ShieldCheck size={14} className="text-[#16A34A] fill-emerald-50 shrink-0" />
                </div>
                <p className="text-[11px] font-bold text-slate-400 mt-0.5">Verified Food Donor Partner</p>
              </div>
            </div>
          </div>

          {/* Phone Contact Card — Primary CTA */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col gap-3">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">📞 Contact Donor</span>
            
            <div className="flex items-center gap-3">
              <a
                href={`tel:${donation.donorPhone || '+91 94443 55678'}`}
                className="flex-1 h-12 bg-[#16A34A] hover:bg-[#166534] text-white rounded-xl flex items-center justify-center gap-2 font-bold text-xs shadow-sm transition-all active:scale-95"
              >
                <Phone size={16} className="stroke-[2.5px]" />
                <span>Call Donor: {donation.donorPhone || '+91 94443 55678'}</span>
              </a>
            </div>

            <a 
              href={`sms:${donation.donorPhone || '+91 94443 55678'}`}
              className="w-full h-10 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center gap-2 text-slate-700 font-bold text-xs transition-all"
            >
              <MessageCircle size={14} />
              <span>Send SMS Message</span>
            </a>
          </div>

          {/* Pickup Location with Map */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="h-40 relative">
              <GoogleMap 
                mode="volunteer_route"
                activeRoute={{
                  startLat: 11.3962,
                  startLng: 79.6936,
                  endLat: donation.latitude || 11.3985,
                  endLng: donation.longitude || 79.6965
                }}
              />
              <div className="absolute bottom-2 left-2 z-10 bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded-lg border border-slate-100 shadow-sm">
                <span className="text-[10px] font-extrabold text-slate-700">📍 Pickup Point</span>
              </div>
            </div>

            <div className="p-4 flex flex-col gap-2.5">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin size={14} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Pickup Address</span>
                  <span className="text-xs font-bold text-slate-800 mt-0.5 leading-relaxed">{donation.location}</span>
                </div>
              </div>

              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${donation.latitude || 11.3985},${donation.longitude || 79.6965}`}
                target="_blank"
                referrerPolicy="no-referrer"
                className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center gap-2 font-bold text-xs shadow-xs transition-all active:scale-95"
              >
                <Navigation size={12} className="fill-white" />
                <span>Open in Google Maps</span>
              </a>
            </div>
          </div>

          {/* Food Details */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col gap-3">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">🍽️ Food Package Details</span>
            
            <div className="flex items-start gap-3">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0">
                <img src={donation.image} alt={donation.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col min-w-0">
                <h4 className="text-sm font-black text-slate-800 truncate">{donation.name}</h4>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="bg-emerald-50 text-[#16A34A] border border-emerald-100 px-2 py-0.5 rounded-full text-[10px] font-extrabold">
                    {donation.portions} Meals
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                    donation.classification === 'veg'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
                      : 'bg-rose-50 text-rose-800 border-rose-100'
                  }`}>
                    {donation.classification === 'veg' ? '🥗 VEG' : '🍗 NON-VEG'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-slate-50 rounded-xl p-2.5 border border-slate-100">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
                <Clock size={11} className="text-slate-400" />
                <span>Prepared: <strong className="text-slate-700">{donation.preparedTime}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
                <Clock size={11} className="text-rose-500" />
                <span>Before: <strong className="text-rose-600">{donation.bestBefore}</strong></span>
              </div>
            </div>
          </div>

          {/* Special Notes */}
          {donation.notes && (
            <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-100 flex flex-col gap-2">
              <div className="flex items-center gap-1.5">
                <FileText size={13} className="text-amber-600" />
                <span className="text-[10px] font-extrabold text-amber-700 uppercase tracking-wider">Special Instructions</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-semibold italic">
                "{donation.notes}"
              </p>
            </div>
          )}

          {/* Handoff PIN */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#16A34A] text-white flex items-center justify-center font-bold text-sm">
                🔐
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Handoff PIN</span>
                <span className="text-lg font-mono font-black tracking-[0.25em] text-slate-800">{donation.pin}</span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-slate-400">Ask donor for PIN</span>
          </div>

          {/* Action CTA when in waiting_pickup state */}
          {donation.status === 'waiting_pickup' && onAccept && (
            <div className="sticky bottom-0 bg-white/95 backdrop-blur-md pt-2 pb-1 border-t border-slate-100 flex flex-col gap-2 mt-2">
              <button
                type="button"
                className="w-full h-12 bg-[#16A34A] hover:bg-[#166534] text-white font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 active:scale-[0.98] transition-all cursor-pointer"
                onClick={() => {
                  onAccept(donation.id);
                  onClose();
                }}
              >
                <ShieldCheck size={18} className="fill-white stroke-[#16A34A]" />
                <span>OK - Accept &amp; Assign to Donor</span>
              </button>
            </div>
          )}

          {donation.status !== 'waiting_pickup' && donation.courier && (
            <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-100 flex items-center gap-2 text-emerald-800 text-xs font-bold">
              <ShieldCheck size={16} className="text-[#16A34A]" />
              <span>Assigned to: {donation.courier.name} ({donation.courier.phone})</span>
            </div>
          )}

          {/* Bottom Spacer */}
          <div className="h-2"></div>
        </div>
      </div>
    </div>
  );
};
