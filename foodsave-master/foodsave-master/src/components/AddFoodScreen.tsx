import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { FOOD_PRESETS, FoodPreset } from '../data';
import { Sparkles, Utensils, Info, Check, Plus, Minus, MapPin, ChevronDown, ChevronUp, AlertTriangle, ShieldCheck, Camera } from 'lucide-react';
import { GoogleMap } from './GoogleMap';

export const AddFoodScreen: React.FC = () => {
  const { addDonation, setActiveTab, setSelectedDonationId, restaurantName } = useApp();

  // Preset shortcut selection state (starts as null to avoid pre-filling)
  const [selectedPreset, setSelectedPreset] = useState<FoodPreset | null>(null);
  
  // Form fields starting completely empty as requested by the user
  const [foodName, setFoodName] = useState('');
  const [classification, setClassification] = useState<'veg' | 'nonveg' | ''>('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [unit, setUnit] = useState('Portions');
  
  // Custom times starting empty
  const [preparedTime, setPreparedTime] = useState('');
  const [bestBefore, setBestBefore] = useState('');

  // Editable location starting empty
  const [pickupLocation, setPickupLocation] = useState('');
  const [latitude, setLatitude] = useState<number>(11.3962);
  const [longitude, setLongitude] = useState<number>(79.6936);
  
  // collapsible notes
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [activeTags, setActiveTags] = useState<string[]>([]);
  
  // Action status loading
  const [isPublishing, setIsPublishing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [gpsSynced, setGpsSynced] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Auto-fill from preset shortcuts (optional trigger for user helper)
  const handleSelectPreset = (preset: FoodPreset) => {
    setSelectedPreset(preset);
    setFoodName(preset.name);
    setClassification(preset.classification);
    setQuantity(preset.portions);
    setGpsSynced(true);
    
    // Auto-prefill mock times based on present moment for speed if they use shortcuts
    setPreparedTime('10:30 AM');
    setBestBefore('04:30 PM');
    setPickupLocation(`${restaurantName} Main Kitchen • Anna Nagar West, Sector 4, Bay 3`);
    setLatitude(11.3962);
    setLongitude(79.6936);
  };

  const handleAdjustQuantity = (amount: number) => {
    setQuantity(prev => {
      const current = prev === '' ? 0 : prev;
      return Math.max(0, current + amount);
    });
  };

  const handleToggleTag = (tag: string) => {
    setActiveTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handlePublish = () => {
    setFormError(null);

    // Manual validations for all required user-filled fields
    if (!foodName.trim()) {
      setFormError('Please enter the Food Name.');
      return;
    }
    if (!classification) {
      setFormError('Please select a Dietary Classification (Vegetarian or Non-Veg).');
      return;
    }
    if (quantity === '' || quantity <= 0) {
      setFormError('Please enter a valid Estimated Quantity greater than 0.');
      return;
    }
    if (!preparedTime.trim()) {
      setFormError('Please enter the Preparation Time (Prepared At).');
      return;
    }
    if (!bestBefore.trim()) {
      setFormError('Please enter the Expiration Time (Best Before).');
      return;
    }
    if (!pickupLocation.trim()) {
      setFormError('Please enter the Pickup Location address.');
      return;
    }

    setIsPublishing(true);

    // Simulate network latency / courier broadcasting
    setTimeout(() => {
      // Build notes string from tags & custom input
      const combinedNotes = [
        ...activeTags,
        notes.trim()
      ].filter(Boolean).join('. ');

      // Use chosen preset image or fallback to generic catering photo
      const imageFallback = selectedPreset 
        ? selectedPreset.image 
        : 'https://lh3.googleusercontent.com/aida-public/AB6AXuAF62O1w0hYfXG1G_v6uM7P9Z6u_J8s6N7L6YvH9uI0O8m8w8x7e6_R3c4_O8A=s360';

      // Add to context list with location coordinates and donor contact info
      addDonation({
        name: foodName,
        portions: Number(quantity),
        unit,
        classification,
        preparedTime,
        bestBefore,
        image: imageFallback,
        location: pickupLocation,
        notes: combinedNotes,
        latitude,
        longitude,
        donorName: restaurantName || 'ABC Grand Kitchen',
        donorPhone: '+91 94443 12260'
      });

      setIsPublishing(false);
      setShowToast(true);

      // Dismiss toast and route after short delay
      setTimeout(() => {
        setShowToast(false);
        // Find newly added item id to go straight to details!
        const savedDonations = JSON.parse(localStorage.getItem('foodsave_donations') || '[]');
        if (savedDonations.length > 0) {
          setSelectedDonationId(savedDonations[0].id); // The context prepends new donations
        }
        setActiveTab('my-donations');
      }, 2500);
    }, 1500);
  };

  const handleGpsSync = () => {
    setGpsSynced(false);
    setTimeout(() => {
      setGpsSynced(true);
      setPickupLocation('ABC Bistro Kitchen • Anna Nagar West, Sector 4, Bay 3');
      setLatitude(11.3962);
      setLongitude(79.6936);
    }, 1200);
  };

  const handleMapLocationSelect = (lat: number, lng: number, address: string) => {
    setLatitude(lat);
    setLongitude(lng);
    setPickupLocation(address);
    setGpsSynced(true);
  };

  return (
    <div className="flex flex-col w-full pb-28 relative">
      {/* Top Banner */}
      <div className="flex items-center justify-between py-1 mb-3">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Fast Dispatch • 1-Min Post
          </span>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-[#006b2c] text-[10px] font-bold flex items-center gap-1">
          <Sparkles size={11} className="fill-[#006b2c]" /> Instant Match
        </span>
      </div>

      {/* Form Validation Errors Box */}
      {formError && (
        <div className="mb-4 bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-start gap-2.5 text-rose-800 text-xs">
          <AlertTriangle size={16} className="text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">Incomplete Fields Detected</p>
            <p className="text-[11px] text-rose-700/90 mt-0.5">{formError}</p>
          </div>
        </div>
      )}

      {/* Main input form */}
      <form className="flex flex-col gap-4" onSubmit={e => e.preventDefault()}>
        
        {/* 1. Food Name Field */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-sans" htmlFor="food-name">
              Food Name
            </label>
            <span className="text-[10px] text-slate-400">User must type manually</span>
          </div>
          <div className="w-full bg-white rounded-xl px-4 py-3 shadow-xs border border-slate-100 flex items-center gap-3 focus-within:ring-2 focus-within:ring-[#006b2c]/10 focus-within:border-[#006b2c]/30">
            <Utensils size={18} className="text-[#006b2c]" />
            <input
              id="food-name"
              name="food-name"
              type="text"
              className="bg-transparent w-full text-slate-800 text-sm focus:outline-none placeholder-slate-300 font-medium"
              placeholder="E.g., Vegetable Biryani, Paneer Butter Masala..."
              value={foodName}
              onChange={e => setFoodName(e.target.value)}
            />
          </div>
        </div>

        {/* 2. Dietary Classification Toggle (Starts unselected) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Dietary Classification
          </label>
          <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Dietary classification">
            <button
              aria-checked={classification === 'veg'}
              role="radio"
              type="button"
              className={`h-11 rounded-xl px-4 flex items-center justify-center gap-2 text-xs font-bold transition-all border cursor-pointer ${
                classification === 'veg'
                  ? 'bg-emerald-50 border-emerald-100 text-[#006b2c] shadow-xs'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
              onClick={() => setClassification('veg')}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${classification === 'veg' ? 'bg-[#006b2c]' : 'bg-slate-300'}`}></span>
              <span>🥗 Vegetarian</span>
            </button>
            <button
              aria-checked={classification === 'nonveg'}
              role="radio"
              type="button"
              className={`h-11 rounded-xl px-4 flex items-center justify-center gap-2 text-xs font-bold transition-all border cursor-pointer ${
                classification === 'nonveg'
                  ? 'bg-rose-50 border-rose-100 text-rose-800 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
              onClick={() => setClassification('nonveg')}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${classification === 'nonveg' ? 'bg-rose-600' : 'bg-slate-300'}`}></span>
              <span>🍗 Non-Veg</span>
            </button>
          </div>
        </div>

        {/* 3. Estimated Quantity section */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Estimated Quantity
          </label>
          <div className="grid grid-cols-12 gap-2 items-center">
            {/* Stepper & Text Input Wrapper */}
            <div className="col-span-7 bg-white rounded-xl p-1 border border-slate-100 shadow-xs flex items-center justify-between focus-within:ring-2 focus-within:ring-[#006b2c]/10">
              <button
                type="button"
                aria-label="Decrease portions"
                className="w-9 h-9 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center justify-center active:scale-95 transition-all cursor-pointer"
                onClick={() => handleAdjustQuantity(-5)}
              >
                <Minus size={16} />
              </button>
              
              <div className="flex flex-col items-center flex-1">
                <input
                  type="number"
                  className="bg-transparent w-16 text-center text-sm font-extrabold text-slate-800 focus:outline-none placeholder-slate-300"
                  placeholder="0"
                  value={quantity}
                  onChange={e => {
                    const val = e.target.value;
                    setQuantity(val === '' ? '' : Math.max(0, Number(val)));
                  }}
                />
                <span className="text-[8px] text-slate-400 font-bold uppercase">portions</span>
              </div>

              <button
                type="button"
                aria-label="Increase portions"
                className="w-9 h-9 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center justify-center active:scale-95 transition-all cursor-pointer"
                onClick={() => handleAdjustQuantity(5)}
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Units Selector */}
            <div className="col-span-5 relative">
              <select
                aria-label="Unit of measure"
                className="w-full h-11 appearance-none bg-white border border-slate-100 text-slate-700 text-xs font-bold rounded-xl pl-3 pr-8 shadow-xs focus:outline-none focus:ring-2 focus:ring-[#006b2c]/10 cursor-pointer"
                value={unit}
                onChange={e => setUnit(e.target.value)}
              >
                <option value="Portions">Portions</option>
                <option value="Meals (Trays)">Meals (Trays)</option>
                <option value="kg">Kilograms (kg)</option>
                <option value="To-Go Boxes">To-Go Boxes</option>
              </select>
              <ChevronDown size={14} className="text-slate-400 pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>

        {/* 4. Timers Grid (Prepared At & Best Before) */}
        <div className="grid grid-cols-2 gap-2">
          {/* Prepared Time (Manual entry) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="prepared-time">
              Prepared At
            </label>
            <div className="bg-white border border-slate-100 rounded-xl px-3 py-2.5 shadow-xs flex items-center gap-1.5 focus-within:ring-2 focus-within:ring-[#006b2c]/10">
              <span className="text-slate-400 shrink-0 text-xs">🕒</span>
              <input
                id="prepared-time"
                type="text"
                className="bg-transparent w-full text-slate-800 text-xs font-bold focus:outline-none placeholder-slate-300"
                placeholder="E.g., 08:30 AM"
                value={preparedTime}
                onChange={e => setPreparedTime(e.target.value)}
              />
            </div>
          </div>

          {/* Consume Best Before Time (Manual entry) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="consume-time">
                Best Before
              </label>
              <span className="text-[9px] font-bold text-amber-800 bg-amber-100/60 px-1 rounded uppercase tracking-wider">
                Urgent
              </span>
            </div>
            <div className="bg-white border border-amber-100 rounded-xl px-3 py-2.5 shadow-xs flex items-center gap-1.5 focus-within:ring-2 focus-within:ring-amber-200">
              <span className="text-amber-500 shrink-0 text-xs">⏳</span>
              <input
                id="consume-time"
                type="text"
                className="bg-transparent w-full text-amber-800 text-xs font-bold focus:outline-none placeholder-slate-300"
                placeholder="E.g., 12:30 PM"
                value={bestBefore}
                onChange={e => setBestBefore(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* 5. Pickup Location (Fully editable text area starting empty) */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pickup Location
            </label>
            <button
              className={`text-[10px] font-bold flex items-center gap-0.5 cursor-pointer ${
                gpsSynced ? 'text-[#006b2c]' : 'text-slate-400'
              }`}
              onClick={handleGpsSync}
              type="button"
            >
              <Check size={11} className={gpsSynced ? 'text-emerald-600' : 'text-slate-400'} />
              <span>{gpsSynced ? 'GPS Location Synced' : 'Sync GPS Location'}</span>
            </button>
          </div>
          
          <div className="w-full text-left bg-white border border-slate-100 rounded-2xl p-3 shadow-xs flex items-center gap-3 transition-transform focus-within:ring-2 focus-within:ring-[#006b2c]/10 focus-within:border-[#006b2c]/30">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#006b2c] flex items-center justify-center shrink-0">
              <MapPin size={18} />
            </div>
            <input
              type="text"
              className="bg-transparent w-full text-slate-800 text-xs font-bold focus:outline-none placeholder-slate-300"
              placeholder="E.g., ABC Bistro Kitchen, Anna Nagar West, Chennai"
              value={pickupLocation}
              onChange={e => setPickupLocation(e.target.value)}
            />
          </div>

          {/* Interactive Google Map with Draggable Handover Pin */}
          <div className="flex flex-col gap-1.5 mt-2">
            <span className="text-[10px] font-extrabold text-[#006b2c] uppercase tracking-wider flex items-center gap-1">
              <span>📍 Drag Pin or Click Map to Pinpoint Handover Location</span>
            </span>
            <div className="w-full h-48 rounded-2xl overflow-hidden border border-slate-100 relative shadow-3xs">
              <GoogleMap 
                mode="donor_select"
                activeRoute={{
                  startLat: latitude,
                  startLng: longitude,
                  endLat: latitude,
                  endLng: longitude
                }}
                onLocationSelect={handleMapLocationSelect}
              />
            </div>
            <p className="text-[9px] text-slate-400 font-bold">
              Selected: Lat: {latitude.toFixed(5)}, Lng: {longitude.toFixed(5)}
            </p>
          </div>
        </div>

        {/* Collapsible Allergen / Packaging Notes */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden transition-all">
          <button
            type="button"
            className="w-full px-4 py-3 flex items-center justify-between text-left cursor-pointer"
            onClick={() => setShowNotes(!showNotes)}
          >
            <div className="flex items-center gap-2 text-slate-700">
              <Info size={16} className="text-slate-400" />
              <span className="text-xs font-bold">Extra Packaging &amp; Allergen Notes</span>
            </div>
            {showNotes ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
          </button>
          
          {showNotes && (
            <div className="px-4 pb-4 flex flex-col gap-3 border-t border-slate-50 pt-3">
              {/* Preset Tag Chips */}
              <div className="flex flex-wrap gap-1.5">
                {['Nut-Free', 'Hot Packs Needed', 'Sealed Foil', 'Vegetarian Kitchen', 'No Dairy'].map((tag, tIdx) => {
                  const isChecked = activeTags.includes(tag);
                  return (
                    <button
                      key={tIdx}
                      type="button"
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                        isChecked
                          ? 'bg-emerald-50 text-[#006b2c]'
                          : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                      }`}
                      onClick={() => handleToggleTag(tag)}
                    >
                      {isChecked && '✓ '} {tag}
                    </button>
                  );
                })}
              </div>
              <textarea
                className="w-full bg-slate-50/50 rounded-xl border border-slate-100 p-2.5 text-slate-700 text-xs focus:outline-none placeholder-slate-300 min-h-[60px]"
                placeholder="E.g., Stainless steel insulated container. Please bring clean empty replacement pans on arrival."
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Security Safety Banner */}
        <div className="p-4 rounded-xl bg-slate-100/50 border border-slate-200/50 flex items-start gap-2.5">
          <ShieldCheck size={18} className="text-[#006b2c] shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-slate-800">
              Zero-Waste Safety Guarantee
            </p>
            <p className="text-[10px] text-slate-500 leading-relaxed mt-0.5">
              Dispatched instantly to verified local shelters within 4.2 km. Real-time temperature verification upon courier arrival.
            </p>
          </div>
        </div>

        {/* Publish Button directly in natural scrolling flow */}
        <div className="mt-2">
          <button
            type="button"
            className="w-full h-[52px] bg-[#006b2c] hover:bg-emerald-800 text-white rounded-xl font-bold text-sm shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:bg-emerald-700 cursor-pointer"
            onClick={handlePublish}
            disabled={isPublishing}
          >
            {isPublishing ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Broadcasting to Couriers...</span>
              </>
            ) : (
              <>
                <span>Publish Donation</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Dynamic Success Toast */}
      {showToast && (
        <div className="fixed top-20 inset-x-4 z-50 transition-all duration-300 transform translate-y-0 opacity-100 pointer-events-none">
          <div className="bg-slate-800 text-white p-4 rounded-2xl shadow-xl flex items-center gap-3 max-w-sm mx-auto">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <Check size={16} className="stroke-[3px]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white">Donation Live &amp; Broadcasting!</p>
              <p className="text-[10px] text-slate-300 truncate">
                Dispatched successfully to nearby couriers!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
