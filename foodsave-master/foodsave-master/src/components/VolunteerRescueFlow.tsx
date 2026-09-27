import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { 
  MapPin, Navigation, ArrowLeft, CheckCircle2, ChevronRight, Clock, ShieldCheck, 
  Camera, Package, Heart, Award, Sparkles, Building, User, Check, Send, AlertTriangle, Eye, Phone, FileText
} from 'lucide-react';
import { GoogleMap } from './GoogleMap';
import { VolunteerDonorDetailsModal } from './VolunteerDonorDetailsModal';

export const VolunteerRescueFlow: React.FC = () => {
  const { 
    activeRescueId, setActiveRescueId, rescueStep, setRescueStep, donations, setDonations, setNotifications
  } = useApp();

  // Active donation being tracked
  const matchedDonation = donations.find(d => d.id === activeRescueId);

  // States for optional mock uploads
  const [pickupPhoto, setPickupPhoto] = useState<string | null>(null);
  const [deliveryPhoto, setDeliveryPhoto] = useState<string | null>(null);
  const [recipientConfirmed, setRecipientConfirmed] = useState(false);
  const [isPhotoSimulating, setIsPhotoSimulating] = useState(false);
  const [showDonorDetails, setShowDonorDetails] = useState(false);

  if (!matchedDonation) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col items-center justify-center text-center gap-3">
        <AlertTriangle className="text-amber-500" size={24} />
        <p className="text-xs font-bold text-slate-700">No active rescue found.</p>
        <button 
          className="px-4 py-2 bg-[#16A34A] text-white text-xs font-bold rounded-lg cursor-pointer"
          onClick={() => setActiveRescueId(null)}
        >
          Back to List
        </button>
      </div>
    );
  }

  // Simulate capturing a photo with camera
  const triggerMockPhotoCapture = (type: 'pickup' | 'delivery') => {
    setIsPhotoSimulating(true);
    setTimeout(() => {
      setIsPhotoSimulating(false);
      const url = type === 'pickup'
        ? 'https://images.unsplash.com/photo-1543083115-638c32cd3d58?w=320&auto=format&fit=crop&q=60' // Sealed boxes
        : 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=320&auto=format&fit=crop&q=60'; // NGO happy handovers
      
      if (type === 'pickup') {
        setPickupPhoto(url);
      } else {
        setDeliveryPhoto(url);
        setRecipientConfirmed(true);
      }
    }, 900);
  };

  // Helper to sync rescue status directly with the shared backend
  const syncRescueProgress = (donationStatus: string, stepName: string) => {
    if (!activeRescueId) return;

    // Update donation status on backend
    try {
      fetch(`http://localhost:5000/api/donations/${activeRescueId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: donationStatus,
          volunteerName: 'Ameer Syed (Volunteer)',
          volunteerId: 'u-5'
        })
      }).catch(err => console.log('Donation sync error:', err));
    } catch (e) {}

    // Update live tracking on backend
    try {
      fetch('http://localhost:5000/api/tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          volunteerId: 'u-5',
          volunteerName: 'Ameer Syed (Volunteer)',
          phone: '+91 94443 12260',
          lat: matchedDonation?.latitude || 11.3985,
          lng: matchedDonation?.longitude || 79.6965,
          status: stepName,
          donationId: activeRescueId,
          destination: stepName === 'delivered' ? 'Helping Hands NGO, Chidambaram (Delivered)' : (matchedDonation?.location || 'Chidambaram'),
          donorName: matchedDonation?.donorName || 'Food Donor',
          donorLat: matchedDonation?.latitude || 11.3985,
          donorLng: matchedDonation?.longitude || 79.6965,
          foodName: matchedDonation?.name || 'Food Donation'
        })
      }).catch(() => {});
    } catch (e) {}
  };

  // State transitions with real-time donor status synchronization
  const handleOnMyWay = () => {
    // Sync to donor that courier is on their way
    setDonations(prev => prev.map(d => {
      if (d.id === activeRescueId) {
        return {
          ...d,
          status: 'en_route_to_pickup' as const,
          currentStep: 3
        };
      }
      return d;
    }));

    // Notification to donor
    setNotifications(prev => [
      {
        id: `enroute-notif-${Date.now()}`,
        title: '🚗 Volunteer En Route',
        time: 'Just now',
        body: `Ameer Syed is on the way to collect your food donation!`,
        read: false,
        type: 'pickup_started',
        badge: 'En Route'
      },
      ...prev
    ]);

    setRescueStep('on_the_way');
    syncRescueProgress('Accepted', 'on_the_way');
  };

  const handleArrived = () => {
    setDonations(prev => prev.map(d => {
      if (d.id === activeRescueId) {
        return {
          ...d,
          status: 'courier_on_way' as const,
          currentStep: 4
        };
      }
      return d;
    }));

    // Notification to donor
    setNotifications(prev => [
      {
        id: `arrived-notif-${Date.now()}`,
        title: '📍 Volunteer Arrived!',
        time: 'Just now',
        body: `Ameer Syed has arrived at your location. Please prepare for food handover.`,
        read: false,
        type: 'pickup_started',
        badge: 'Arrived'
      },
      ...prev
    ]);

    setRescueStep('arrived');
    syncRescueProgress('Accepted', 'arrived');
  };

  const handleFoodCollected = () => {
    setDonations(prev => prev.map(d => {
      if (d.id === activeRescueId) {
        return {
          ...d,
          status: 'food_collected' as const,
          currentStep: 4
        };
      }
      return d;
    }));

    // Notification to donor
    setNotifications(prev => [
      {
        id: `collected-notif-${Date.now()}`,
        title: '✅ Food Collected!',
        time: 'Just now',
        body: `Ameer Syed has successfully collected your food donation. Delivering to shelter now!`,
        read: false,
        type: 'pickup_started',
        badge: 'Collected'
      },
      ...prev
    ]);

    setRescueStep('collected');
    syncRescueProgress('Picked Up', 'food_collected');
  };

  const handleStartDelivery = () => {
    setDonations(prev => prev.map(d => {
      if (d.id === activeRescueId) {
        return {
          ...d,
          currentStep: 4
        };
      }
      return d;
    }));
    setRescueStep('delivering');
    syncRescueProgress('Picked Up', 'delivering');
  };

  const handleReachedDestination = () => {
    setDonations(prev => prev.map(d => {
      if (d.id === activeRescueId) {
        return {
          ...d,
          currentStep: 4
        };
      }
      return d;
    }));
    setRescueStep('confirmed');
    syncRescueProgress('Picked Up', 'confirmed');
  };

  const handleCompleteRescue = () => {
    // 1. Update the actual donation's status in global state
    setDonations(prev => prev.map(d => {
      if (d.id === activeRescueId) {
        return {
          ...d,
          status: 'delivered' as const,
          currentStep: 5
        };
      }
      return d;
    }));

    // 2. Add system notification
    setNotifications(prev => [
      {
        id: `rescue-complete-${Date.now()}`,
        title: 'Rescue Completed!',
        time: 'Just now',
        body: `You successfully delivered ${matchedDonation.portions} meals from ${matchedDonation.location} to Helping Hands NGO!`,
        read: false,
        type: 'completed',
        badge: 'Delivered'
      },
      ...prev
    ]);

    // 3. Go to delivered success step
    setRescueStep('delivered');
    syncRescueProgress('Delivered', 'delivered');
  };

  const handleFinishAndReset = () => {
    // Clear rescue tracking state and reset view
    setActiveRescueId(null);
    setRescueStep(null);
  };

  // Helpers for timeline visualization
  const getTimelineStep = () => {
    switch (rescueStep) {
      case 'accepted': return 1;
      case 'on_the_way': return 2;
      case 'arrived': return 3;
      case 'collected': return 4;
      case 'delivering': return 5;
      case 'confirmed': return 6;
      case 'delivered': return 7;
      default: return 1;
    }
  };

  const currentStepNum = getTimelineStep();

  return (
    <div className="flex flex-col gap-4 py-1 animate-fade-in pb-12">
      {/* Top Header Back Button */}
      {rescueStep !== 'delivered' && (
        <div className="flex items-center justify-between">
          <button 
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 w-fit cursor-pointer"
            onClick={() => {
              if (window.confirm("Cancel active tracking? Your current transport progress remains safe.")) {
                setActiveRescueId(null);
                setRescueStep(null);
              }
            }}
          >
            <ArrowLeft size={14} />
            <span>Cancel & Back to Map</span>
          </button>

          {/* VIEW DONOR DETAILS BUTTON — Always visible during rescue */}
          <button
            className="flex items-center gap-1.5 text-xs font-extrabold text-[#16A34A] bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-100 cursor-pointer transition-all active:scale-95"
            onClick={() => setShowDonorDetails(true)}
          >
            <Phone size={12} />
            <span>Donor Details</span>
          </button>
        </div>
      )}

      {/* QUICK RESCUE PROGRESS CONTROLLER — Direct 1-tap buttons for En Route, Arrived, and Collect */}
      {rescueStep !== 'delivered' && (
        <div className="bg-slate-900 text-white rounded-2xl p-3 border border-slate-700/60 shadow-md flex flex-col gap-2">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
            <span className="uppercase tracking-wider">Rescue Progress Steps</span>
            <span className="text-emerald-400 font-extrabold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              Updates donor page live
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={handleOnMyWay}
              className={`h-9 rounded-xl text-[11px] font-black flex items-center justify-center gap-1 transition-all cursor-pointer ${
                rescueStep === 'on_the_way'
                  ? 'bg-violet-600 text-white shadow-sm ring-2 ring-violet-300'
                  : 'bg-white/10 hover:bg-white/20 text-slate-200'
              }`}
            >
              <span>🚗 En Route</span>
            </button>

            <button
              type="button"
              onClick={handleArrived}
              className={`h-9 rounded-xl text-[11px] font-black flex items-center justify-center gap-1 transition-all cursor-pointer ${
                rescueStep === 'arrived'
                  ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-300'
                  : 'bg-white/10 hover:bg-white/20 text-slate-200'
              }`}
            >
              <span>📍 Arrived</span>
            </button>

            <button
              type="button"
              onClick={handleFoodCollected}
              className={`h-9 rounded-xl text-[11px] font-black flex items-center justify-center gap-1 transition-all cursor-pointer ${
                rescueStep === 'collected'
                  ? 'bg-teal-600 text-white shadow-sm ring-2 ring-teal-300'
                  : 'bg-white/10 hover:bg-white/20 text-slate-200'
              }`}
            >
              <span>📦 Collect Food</span>
            </button>
          </div>
        </div>
      )}

      {/* RENDER DYNAMIC STEPS WIZARD */}

      {/* STEP 4 & 5: Pickup Accepted & On The Way */}
      {(rescueStep === 'accepted' || rescueStep === 'on_the_way') && (
        <div className="flex flex-col gap-4">
          {/* Main Status Header */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center justify-between shadow-3xs">
            <div className="flex flex-col">
              <span className="text-[10px] font-extrabold text-[#16A34A] uppercase tracking-wider">
                Rescue Mission Active
              </span>
              <h2 className="text-sm font-black text-slate-800 mt-0.5">
                {rescueStep === 'accepted' ? '🟢 Pickup Accepted' : '🚗 En-route to Donor'}
              </h2>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#16A34A] text-white flex items-center justify-center animate-pulse">
              <Navigation size={16} className="fill-white" />
            </div>
          </div>

          {/* Donor Quick Info Card */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-3xs flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-black text-slate-800 leading-tight">
                  {matchedDonation.name}
                </h3>
                <p className="text-xs text-[#16A34A] font-bold mt-1">
                  {matchedDonation.portions} Portion Meals
                </p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${
                matchedDonation.classification === 'veg'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
                  : 'bg-rose-50 text-rose-800 border-rose-100'
              }`}>
                {matchedDonation.classification === 'veg' ? 'VEG' : 'NON-VEG'}
              </span>
            </div>

            <div className="border-t border-slate-50 pt-3 flex flex-col gap-2">
              <div className="flex gap-2.5">
                <div className="w-5 h-5 rounded bg-slate-50 flex items-center justify-center shrink-0">
                  <Building size={12} className="text-slate-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-slate-400 uppercase leading-none">Donor</span>
                  <span className="text-xs font-bold text-slate-700 mt-0.5">{matchedDonation.location}</span>
                </div>
              </div>

              <div className="flex gap-2.5">
                <div className="w-5 h-5 rounded bg-slate-50 flex items-center justify-center shrink-0">
                  <MapPin size={12} className="text-rose-500" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-slate-400 uppercase leading-none">Pickup Location</span>
                  <span className="text-xs font-semibold text-slate-500 mt-0.5">East Car Street, Chidambaram</span>
                </div>
              </div>

              {/* Donor phone quick-access */}
              <div className="flex gap-2.5">
                <div className="w-5 h-5 rounded bg-emerald-50 flex items-center justify-center shrink-0">
                  <Phone size={12} className="text-[#16A34A]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-slate-400 uppercase leading-none">Donor Phone</span>
                  <a href={`tel:${matchedDonation.donorPhone || '+91 94443 55678'}`} className="text-xs font-bold text-[#16A34A] mt-0.5 underline">
                    {matchedDonation.donorPhone || '+91 94443 55678'}
                  </a>
                </div>
              </div>
            </div>

            {/* View Full Donor Details Button */}
            <button 
              className="w-full h-9 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-slate-700 cursor-pointer transition-all"
              onClick={() => setShowDonorDetails(true)}
            >
              <Eye size={13} />
              <span>View Full Donor Details & Map</span>
            </button>
          </div>

          {/* Map & Path Simulation with Google Maps */}
          <div className="h-48 rounded-2xl overflow-hidden border border-slate-100 shadow-3xs relative flex items-end justify-between">
            <GoogleMap 
              mode="volunteer_route"
              activeRoute={{
                startLat: 11.3962,
                startLng: 79.6936,
                endLat: matchedDonation.latitude || 11.3985,
                endLng: matchedDonation.longitude || 79.6965
              }}
            />
            <div className="absolute bottom-2 left-2 z-10 bg-slate-900/90 text-white p-2 rounded-xl border border-slate-700/50 flex flex-col gap-0.5 text-[9px] font-bold shadow-md">
              <span>Distance: 0.8 km</span>
              <span>ETA: 5 minutes</span>
            </div>
            <a 
              href={`https://www.google.com/maps/dir/?api=1&origin=11.3962,79.6936&destination=${matchedDonation.latitude || 11.3985},${matchedDonation.longitude || 79.6965}`}
              target="_blank" 
              referrerPolicy="no-referrer"
              className="absolute bottom-2 right-2 z-10 h-8 bg-blue-600 hover:bg-blue-700 text-white px-3 rounded-lg flex items-center justify-center gap-1 font-bold text-[9px] shadow-md cursor-pointer"
            >
              <Navigation size={9} className="fill-white" />
              <span>NAVIGATE IN MAPS</span>
            </a>
          </div>

          {/* Timeline Status */}
          <div className="flex items-center gap-3 bg-white border border-slate-100 rounded-2xl p-4 shadow-3xs">
            <div className="flex flex-col gap-3 shrink-0">
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-[#16A34A]">
                <Check size={11} className="stroke-[3px]" />
              </div>
              <div className="w-0.5 h-6 bg-slate-200 mx-auto"></div>
              <div className={`flex items-center justify-center w-5 h-5 rounded-full border-2 ${
                rescueStep === 'on_the_way' ? 'bg-[#16A34A] border-[#16A34A] text-white' : 'border-slate-300'
              }`}>
                {rescueStep === 'on_the_way' ? <Check size={10} className="stroke-[3px]" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>}
              </div>
            </div>

            <div className="flex flex-col gap-5 text-xs">
              <div className="flex flex-col">
                <span className="font-extrabold text-slate-800">1. Pickup Accepted</span>
                <span className="text-[10px] text-slate-400 font-semibold mt-0.5">Assigned to rescue mission</span>
              </div>
              <div className="flex flex-col">
                <span className={`font-extrabold ${rescueStep === 'on_the_way' ? 'text-slate-800' : 'text-slate-400'}`}>
                  2. En-route to Donor
                </span>
                <span className="text-[10px] text-slate-400 font-semibold mt-0.5">Heading to collect surplus trays</span>
              </div>
            </div>
          </div>

          {/* Action CTA */}
          {rescueStep === 'accepted' ? (
            <button
              type="button"
              className="w-full h-12 bg-[#16A34A] hover:bg-[#166534] text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 transition-all cursor-pointer active:scale-95"
              onClick={handleOnMyWay}
            >
              <Navigation size={14} className="fill-white" />
              <span>🚗 Start En Route to Pickup (On My Way)</span>
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <button
                type="button"
                className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
                onClick={handleArrived}
              >
                <MapPin size={14} />
                <span>📍 I've Arrived at Donor Location</span>
              </button>
              
              <button
                type="button"
                className="w-full h-11 bg-teal-600 hover:bg-teal-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
                onClick={handleFoodCollected}
              >
                <Package size={14} />
                <span>📦 Food Collected (Direct Handover)</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* STEP 6: Arrived at Pickup */}
      {rescueStep === 'arrived' && (
        <div className="flex flex-col gap-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center flex flex-col items-center gap-2 shadow-3xs">
            <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <CheckCircle2 size={20} />
            </div>
            <h2 className="text-sm font-black text-slate-800 mt-1">You've Arrived at {matchedDonation.location}</h2>
            <p className="text-[11px] text-slate-500 leading-relaxed max-w-[240px]">
              Politely ask the donor staff to hand over the packed food tray for order reference **#{matchedDonation.id}**.
            </p>
          </div>

          {/* Donor Contact Quick Card */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-3xs flex flex-col gap-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact Donor Now</h3>
            <div className="flex items-center gap-2">
              <a
                href={`tel:${matchedDonation.donorPhone || '+91 94443 55678'}`}
                className="flex-1 h-10 bg-[#16A34A] hover:bg-[#166534] text-white rounded-xl flex items-center justify-center gap-2 font-bold text-xs shadow-xs transition-all active:scale-95"
              >
                <Phone size={14} className="stroke-[2.5px]" />
                <span>Call: {matchedDonation.donorPhone || '+91 94443 55678'}</span>
              </a>
              <button 
                className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 cursor-pointer"
                onClick={() => setShowDonorDetails(true)}
              >
                <Eye size={16} />
              </button>
            </div>
          </div>

          {/* Package Details */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-3xs flex flex-col gap-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verification Checklist</h3>
            <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3 border border-slate-100">
              <div className="w-8 h-8 rounded bg-emerald-50 text-[#16A34A] flex items-center justify-center shrink-0">
                <Package size={16} />
              </div>
              <div className="flex flex-col text-xs">
                <span className="font-extrabold text-slate-800">{matchedDonation.name}</span>
                <span className="text-[10px] text-slate-500 mt-0.5">{matchedDonation.portions} Meals • Sealed Containers</span>
              </div>
            </div>
          </div>

          {/* Interactive Mock Photo Capture */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-3xs flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Take Handover Photo (Optional)</span>
              <span className="text-[10px] text-slate-400 font-semibold">Provides audit safety</span>
            </div>

            {pickupPhoto ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 h-32">
                <img 
                  src={pickupPhoto} 
                  alt="Food Package handover proof" 
                  className="w-full h-full object-cover"
                />
                <button 
                  className="absolute right-2 top-2 bg-slate-800/80 backdrop-blur text-white text-[10px] px-2 py-1 rounded font-bold"
                  onClick={() => setPickupPhoto(null)}
                >
                  Retake
                </button>
              </div>
            ) : (
              <button
                className="h-24 rounded-xl border border-dashed border-slate-200 hover:border-[#16A34A] flex flex-col items-center justify-center gap-1.5 transition-all text-slate-400 hover:text-[#16A34A] bg-slate-50/50 cursor-pointer"
                onClick={() => triggerMockPhotoCapture('pickup')}
                disabled={isPhotoSimulating}
              >
                <Camera size={20} className={isPhotoSimulating ? 'animate-bounce' : ''} />
                <span className="text-[11px] font-bold">
                  {isPhotoSimulating ? 'Capturing Proof...' : 'Take Pickup Photo'}
                </span>
              </button>
            )}
          </div>

          {/* CTA Food Collected */}
          <button
            type="button"
            className="w-full h-12 bg-[#16A34A] hover:bg-[#166534] text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 transition-all cursor-pointer active:scale-95"
            onClick={handleFoodCollected}
          >
            <Package size={16} />
            <span>📦 Food Successfully Collected (Confirm &amp; Collect)</span>
          </button>
        </div>
      )}

      {/* STEP 7: Food Collected, Deliver To */}
      {rescueStep === 'collected' && (
        <div className="flex flex-col gap-4 animate-fade-in">
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3 shadow-3xs">
            <div className="w-8 h-8 rounded-full bg-[#16A34A] text-white flex items-center justify-center shrink-0 font-bold text-sm">
              ✓
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[#16A34A] uppercase">Collection verified</span>
              <span className="text-xs font-black text-slate-800">Food is safely secured on-board</span>
            </div>
          </div>

          {/* Destination Details card */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-3xs flex flex-col gap-3.5">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
              Deliver To Recipient
            </span>
            
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                <Building size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-extrabold text-slate-800">Helping Hands NGO</span>
                <span className="text-xs text-slate-500 mt-1">Chidambaram Shelter Hub</span>
                <span className="text-[11px] font-bold text-slate-400 mt-0.5 flex items-center gap-1">
                  <MapPin size={10} className="text-rose-500" />
                  <span>1.4 km from your current location</span>
                </span>
              </div>
            </div>
          </div>

          {/* Start Route CTA */}
          <button
            type="button"
            className="w-full h-12 bg-[#16A34A] hover:bg-[#166534] text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
            onClick={handleStartDelivery}
          >
            <span>Start Delivery Route →</span>
          </button>
        </div>
      )}

      {/* STEP 8: Delivery Tracking */}
      {rescueStep === 'delivering' && (
        <div className="flex flex-col gap-4 animate-fade-in">
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center justify-between shadow-3xs">
            <div className="flex flex-col">
              <span className="text-[10px] font-extrabold text-blue-700 uppercase tracking-wider">
                Distribution En-Route
              </span>
              <h2 className="text-sm font-black text-slate-800 mt-0.5">
                Delivery in Progress
              </h2>
            </div>
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center animate-bounce">
              <Navigation size={16} className="fill-white" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-3xs flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Destination:</span>
              <span className="text-xs font-bold text-slate-800">Helping Hands NGO</span>
            </div>
            <div className="text-xs font-semibold text-slate-400">
              Transporting **{matchedDonation.portions}** fresh meals safely. Ensure boxes are kept upright.
            </div>
          </div>

          {/* Map & Path Simulation with Google Maps */}
          <div className="h-48 rounded-2xl overflow-hidden border border-slate-100 shadow-3xs relative flex items-end justify-between">
            <GoogleMap 
              mode="volunteer_route"
              activeRoute={{
                startLat: matchedDonation.latitude || 11.3985,
                startLng: matchedDonation.longitude || 79.6965,
                endLat: 11.3951, // Shelter hub coordinates in Chidambaram
                endLng: 79.6942
              }}
            />
            <div className="absolute bottom-2 left-2 z-10 bg-slate-900/90 text-white p-2 rounded-xl border border-slate-700/50 flex flex-col gap-0.5 text-[9px] font-bold shadow-md">
              <span>Distance: 1.4 km</span>
              <span>ETA: 7 minutes</span>
            </div>
            <a 
              href={`https://www.google.com/maps/dir/?api=1&origin=${matchedDonation.latitude || 11.3985},${matchedDonation.longitude || 79.6965}&destination=11.3951,79.6942`}
              target="_blank" 
              referrerPolicy="no-referrer"
              className="absolute bottom-2 right-2 z-10 h-8 bg-blue-600 hover:bg-blue-700 text-white px-3 rounded-lg flex items-center justify-center gap-1 font-bold text-[9px] shadow-md cursor-pointer"
            >
              <Navigation size={9} className="fill-white" />
              <span>START NAVIGATION</span>
            </a>
          </div>

          {/* CTA */}
          <button
            type="button"
            className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
            onClick={handleReachedDestination}
          >
            <span>I've Reached Destination</span>
          </button>
        </div>
      )}

      {/* STEP 9: Confirm Delivery */}
      {rescueStep === 'confirmed' && (
        <div className="flex flex-col gap-4 animate-fade-in">
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 text-center flex flex-col items-center gap-2 shadow-3xs">
            <span className="text-3xl">🎉</span>
            <h2 className="text-sm font-black text-slate-800 mt-1">Food Safely Delivered!</h2>
            <p className="text-[11px] text-slate-500 leading-relaxed max-w-[240px]">
              Confirm delivery details with the NGO coordinators to close this food waste rescue loop.
            </p>
          </div>

          {/* Recipient Confirmation Details card */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-3xs flex flex-col gap-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recipient Details</h3>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Building size={16} />
              </div>
              <div className="flex flex-col text-xs">
                <span className="font-extrabold text-slate-800">Helping Hands NGO</span>
                <span className="text-[10px] text-slate-400">Chidambaram Center</span>
              </div>
            </div>
          </div>

          {/* Photo upload proof */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-3xs flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Upload Delivery Photo</span>
              <span className="text-[10px] text-slate-400 font-semibold">Mandatory audit check</span>
            </div>

            {deliveryPhoto ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 h-32">
                <img 
                  src={deliveryPhoto} 
                  alt="Delivery Proof" 
                  className="w-full h-full object-cover"
                />
                <button 
                  className="absolute right-2 top-2 bg-slate-800/80 backdrop-blur text-white text-[10px] px-2 py-1 rounded font-bold"
                  onClick={() => {
                    setDeliveryPhoto(null);
                    setRecipientConfirmed(false);
                  }}
                >
                  Retake
                </button>
              </div>
            ) : (
              <button
                className="h-24 rounded-xl border border-dashed border-slate-200 hover:border-[#16A34A] flex flex-col items-center justify-center gap-1.5 transition-all text-slate-400 hover:text-[#16A34A] bg-slate-50/50 cursor-pointer"
                onClick={() => triggerMockPhotoCapture('delivery')}
                disabled={isPhotoSimulating}
              >
                <Camera size={20} className={isPhotoSimulating ? 'animate-bounce' : ''} />
                <span className="text-[11px] font-bold">
                  {isPhotoSimulating ? 'Uploading Handover Picture...' : '📷 Click to upload photo proof'}
                </span>
              </button>
            )}
          </div>

          {/* Interactive Checkbox */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-3xs flex flex-col gap-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input 
                type="checkbox"
                className="mt-0.5 rounded border-slate-300 text-[#16A34A] focus:ring-[#16A34A] h-4 w-4"
                checked={recipientConfirmed}
                onChange={(e) => setRecipientConfirmed(e.target.checked)}
              />
              <div className="flex flex-col text-xs leading-tight">
                <span className="font-extrabold text-slate-700">Coordinators Confirmed Handover</span>
                <span className="text-[10px] text-slate-400 mt-1">I confirm that all trays have been handed over under fresh transport conditions.</span>
              </div>
            </label>
          </div>

          {/* CTA Confirm Delivery */}
          <button
            type="button"
            className="w-full h-12 bg-[#16A34A] hover:bg-[#166534] disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
            disabled={!recipientConfirmed || isPhotoSimulating}
            onClick={handleCompleteRescue}
          >
            <span>Confirm Delivery & Close Route</span>
          </button>
        </div>
      )}

      {/* STEP 10: Donation Completed celebration! */}
      {rescueStep === 'delivered' && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col items-center text-center gap-5 shadow-sm animate-bounce-short">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#16A34A] to-emerald-400 text-white flex items-center justify-center shadow-md shrink-0">
            <Sparkles size={30} className="text-white" />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-extrabold text-[#16A34A] uppercase tracking-wider">
              Success Celebration
            </span>
            <h2 className="text-lg font-black text-slate-800">Donation Rescued & Completed!</h2>
            <p className="text-xs text-slate-500 max-w-[250px] leading-relaxed mx-auto">
              **{matchedDonation.portions} Meals** were saved and successfully delivered to Helping Hands NGO shelter network.
            </p>
          </div>

          {/* Key Impact Stats Indicators */}
          <div className="grid grid-cols-2 gap-3 w-full bg-slate-50/50 rounded-2xl border border-slate-100 p-4">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Rescued</span>
              <span className="text-lg font-black text-[#16A34A] mt-1">
                {matchedDonation.portions} Meals
              </span>
            </div>
            <div className="flex flex-col border-l border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Missions</span>
              <span className="text-lg font-black text-slate-800 mt-1">
                1 Donation
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-500 text-[11px] font-bold">
            <Award size={14} className="text-[#16A34A]" />
            <span>Thank you for helping reduce food waste!</span>
          </div>

          <button
            type="button"
            className="w-full h-11 bg-[#16A34A] hover:bg-[#166534] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-all active:scale-95"
            onClick={handleFinishAndReset}
          >
            <span>Back to Main Menu</span>
          </button>
        </div>
      )}

      {/* DONOR DETAILS MODAL */}
      {showDonorDetails && matchedDonation && (
        <VolunteerDonorDetailsModal 
          donation={matchedDonation} 
          onClose={() => setShowDonorDetails(false)} 
        />
      )}
    </div>
  );
};
