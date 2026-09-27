import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Verified, HeartHandshake, Utensils, ChevronRight, User, Store, MapPin, Bell, Languages, Shield, HelpCircle, LogOut, CheckCircle, X, Check, Save } from 'lucide-react';

type ProfileModalType = 'edit-profile' | 'business-details' | 'pickup-locations' | 'notifications' | 'help-support' | 'privacy-policy' | null;

export const ProfileScreen: React.FC = () => {
  const { stats, language, setLanguage, setIsLoggedIn, restaurantName, setRestaurantName, userEmail, setUserEmail, userRole } = useApp();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutCompleted, setShowLogoutCompleted] = useState(false);
  
  // High fidelity states for the interactive modals
  const [activeModal, setActiveModal] = useState<ProfileModalType>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Edit Profile Form States (bound to user credentials)
  const [profileName, setProfileName] = useState(restaurantName);
  const [profilePhone, setProfilePhone] = useState('+91 98402 12345');
  const [profileEmail, setProfileEmail] = useState(userEmail);
  const [profileAddress, setProfileAddress] = useState('12, Main Street Hub, Sector 4, Chennai');

  // Keep form states in sync if they toggle
  React.useEffect(() => {
    setProfileName(restaurantName);
    setProfileEmail(userEmail);
  }, [restaurantName, userEmail]);

  // Notification Preference toggles
  const [notifPush, setNotifPush] = useState(true);
  const [notifSms, setNotifSms] = useState(true);
  const [notifEmail, setNotifEmail] = useState(false);

  // Translation Dictionary
  const t = {
    en: {
      profileTitle: 'ABC Restaurant',
      foodDonor: 'Food Donor',
      verified: 'Verified',
      partnerSince: 'Partnered since Oct 2023 · Downtown Kitchen & Deli',
      donations: 'Donations',
      mealsSaved: 'Meals Saved',
      account: 'Account',
      editProfile: 'Edit Profile',
      businessDetails: 'Business Details',
      pickupLocations: 'Pickup Locations',
      preferences: 'Preferences',
      notifications: 'Notifications',
      language: 'Language',
      support: 'Support',
      helpSupport: 'Help & Support',
      privacyPolicy: 'Privacy Policy',
      logout: 'Logout',
      loggingOut: 'Logging out...',
      seeYouSoon: 'See you soon! 👋',
      tagline: 'Building zero-waste food communities',
      hubsCount: '2 registered hubs',
      activeStatus: 'Active',
      saveChanges: 'Save Changes',
      saving: 'Saving...',
      successSaved: 'Changes saved successfully!',
      notifPrefs: 'Notification Preferences',
      editDesc: 'Update your restaurant dispatch team contact details.',
      bizDesc: 'Registered zero-waste commercial food establishment credentials.',
      hubDesc: 'Authorized courier dispatch locations for surplus loading.',
      faqTitle: 'Frequently Asked Questions',
      privacyDesc: 'FoodSave zero-waste liability protection compliance.',
    },
    ta: {
      profileTitle: 'ஏபிசி உணவகம்',
      foodDonor: 'உணவு நன்கொடையாளர்',
      verified: 'சரிபார்க்கப்பட்டது',
      partnerSince: 'அக்டோபர் 2023 முதல் கூட்டாளர் · டவுன்டவுன் சமையலறை',
      donations: 'நன்கொடைகள்',
      mealsSaved: 'சேமிக்கப்பட்ட உணவுகள்',
      account: 'கணக்கு',
      editProfile: 'சுயவிவரத்தைத் திருத்து',
      businessDetails: 'வணிக விவரங்கள்',
      pickupLocations: 'உணவு சேகரிக்கும் இடங்கள்',
      preferences: 'விருப்பத்தேர்வுகள்',
      notifications: 'அறிவிப்புகள்',
      language: 'மொழி',
      support: 'ஆதரவு',
      helpSupport: 'உதவி மற்றும் ஆதரவு',
      privacyPolicy: 'தனியுரிமைக் கொள்கை',
      logout: 'வெளியேறு',
      loggingOut: 'வெளியேறுகிறது...',
      seeYouSoon: 'விரைவில் சந்திப்போம்! 👋',
      tagline: 'பூஜ்ஜிய கழிவு உணவு சமூகம்',
      hubsCount: '2 பதிவு செய்யப்பட்ட மையங்கள்',
      activeStatus: 'செயலில்',
      saveChanges: 'மாற்றங்களைச் சேமி',
      saving: 'சேமிக்கிறது...',
      successSaved: 'மாற்றங்கள் வெற்றிகரமாக சேமிக்கப்பட்டன!',
      notifPrefs: 'அறிவிப்பு விருப்பங்கள்',
      editDesc: 'உணவக தொடர்பு மற்றும் பொறுப்பாளர் விவரங்களை மாற்றவும்.',
      bizDesc: 'பதிவு செய்யப்பட்ட வணிக உணவு நிறுவனத்தின் சான்றுகள்.',
      hubDesc: 'உணவு சேகரிப்பாளர்கள் வரும் அங்கீகரிக்கப்பட்ட இடங்கள்.',
      faqTitle: 'அடிக்கடி கேட்கப்படும் கேள்விகள்',
      privacyDesc: 'பூஜ்ஜிய கழிவு பொறுப்பு பாதுகாப்பு இணக்கம்.',
    }
  };

  const curr = language === 'ta' ? t.ta : t.en;

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      setIsLoggingOut(false);
      setShowLogoutCompleted(true);
      setTimeout(() => {
        setShowLogoutCompleted(false);
        setIsLoggedIn(false);
      }, 1200);
    }, 1200);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setRestaurantName(profileName);
    setUserEmail(profileEmail);
    setActiveModal(null);
    triggerToast(curr.successSaved);
  };

  return (
    <div className="flex flex-col w-full pb-6 relative">
      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 mb-4 mt-2 flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-16 bg-emerald-50/50"></div>
        
        {/* Avatar with Verified Badge */}
        <div className="relative mb-3 mt-3">
          <div className="w-20 h-20 rounded-full bg-slate-100 overflow-hidden shadow-sm border border-emerald-100">
            <img
              className="w-full h-full object-cover"
              alt="ABC Bistro Chef"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBfcCcSKgnqV0g--fg-wS4XTKtCaL3xOhkyakjumOkRaWlnNHJBxuEODK2_WseAzmvh8Tf8BsUvVOiqTIG0gpMjlz-8DalGdyGbPHxXT7z8qD1zXL3LammngD45Bwu3TRCQvcfkpCiPrUewr_R2aBRRoKXrUJwU2Yr8ohut1hGhuZfZdznGdvcmeDNP5Z1iU66QFCHbAGomsieKThqC6oNMppP4079oudmHMeZadJubJLVXLU8sEQ4"
            />
          </div>
          <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#006b2c] text-white flex items-center justify-center shadow-md border-2 border-white">
            <CheckCircle size={12} className="stroke-[3px] text-white" />
          </span>
        </div>

        {/* Title & Badges */}
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <span className="text-base font-extrabold text-slate-800">{restaurantName}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>

        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-[11px] font-semibold text-slate-400">
            {userRole === 'volunteer' 
              ? (language === 'ta' ? 'மீட்பு தன்னார்வலர்' : 'Rescue Volunteer') 
              : curr.foodDonor}
          </span>
          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-[#006b2c] text-[10px] font-bold">
            <Verified size={10} className="fill-[#006b2c] stroke-white" />
            <span>{curr.verified}</span>
          </span>
        </div>

        <p className="text-xs text-slate-500 max-w-[280px]">
          {userRole === 'volunteer' 
            ? (language === 'ta' ? 'அக்டோபர் 2023 முதல் மீட்பு கூட்டாளர்' : 'Rescue courier partner since Oct 2023') 
            : curr.partnerSince}
        </p>
      </div>

      {/* Impact Summary Strip */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#006b2c] flex items-center justify-center shrink-0">
            <HeartHandshake size={18} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-base font-bold text-slate-800 tracking-tight">
              {stats.donationsCount}
            </span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">
              {curr.donations}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#006b2c] flex items-center justify-center shrink-0">
            <Utensils size={18} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-base font-bold text-slate-800 tracking-tight">
              {stats.mealsSaved.toLocaleString()}
            </span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">
              {curr.mealsSaved}
            </span>
          </div>
        </div>
      </div>

      {/* Menu Groups */}
      <div className="flex flex-col gap-5">
        {/* Group 1: Account */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
            {curr.account}
          </span>
          <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden flex flex-col">
            <button
              onClick={() => setActiveModal('edit-profile')}
              className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                  <User size={16} />
                </span>
                <span className="text-xs font-bold text-slate-700">{curr.editProfile}</span>
              </div>
              <ChevronRight size={16} className="text-slate-300" />
            </button>
            <div className="h-[1px] bg-slate-50 mx-4"></div>
            <button
              onClick={() => setActiveModal('business-details')}
              className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                  <Store size={16} />
                </span>
                <span className="text-xs font-bold text-slate-700">{curr.businessDetails}</span>
              </div>
              <ChevronRight size={16} className="text-slate-300" />
            </button>
            <div className="h-[1px] bg-slate-50 mx-4"></div>
            <button
              onClick={() => setActiveModal('pickup-locations')}
              className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                  <MapPin size={16} />
                </span>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-700">{curr.pickupLocations}</span>
                  <span className="text-[10px] text-slate-400">{curr.hubsCount}</span>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-300" />
            </button>
          </div>
        </div>

        {/* Group 2: Preferences */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
            {curr.preferences}
          </span>
          <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden flex flex-col">
            <button
              onClick={() => setActiveModal('notifications')}
              className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                  <Bell size={16} />
                </span>
                <span className="text-xs font-bold text-slate-700">{curr.notifications}</span>
              </div>
              <div className="flex items-center gap-1 text-slate-500">
                <span className="text-xs font-semibold text-[#006b2c]">{curr.activeStatus}</span>
                <ChevronRight size={16} className="text-slate-300" />
              </div>
            </button>
            <div className="h-[1px] bg-slate-50 mx-4"></div>
            <div className="flex items-center justify-between p-4" id="language-row">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                  <Languages size={16} />
                </span>
                <span className="text-xs font-bold text-slate-700">{curr.language}</span>
              </div>
              <div
                className="flex items-center bg-slate-100 p-0.5 rounded-full"
                role="group"
                aria-label="Language Selection"
              >
                <button
                  type="button"
                  className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                    language === 'en'
                      ? 'bg-white text-[#006b2c] shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  onClick={() => setLanguage('en')}
                >
                  English
                </button>
                <button
                  type="button"
                  className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                    language === 'ta'
                      ? 'bg-white text-[#006b2c] shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  onClick={() => setLanguage('ta')}
                >
                  தமிழ்
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Group 3: Support */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
            {curr.support}
          </span>
          <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden flex flex-col">
            <button
              onClick={() => setActiveModal('help-support')}
              className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                  <HelpCircle size={16} />
                </span>
                <span className="text-xs font-bold text-slate-700">{curr.helpSupport}</span>
              </div>
              <ChevronRight size={16} className="text-slate-300" />
            </button>
            <div className="h-[1px] bg-slate-50 mx-4"></div>
            <button
              onClick={() => setActiveModal('privacy-policy')}
              className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                  <Shield size={16} />
                </span>
                <span className="text-xs font-bold text-slate-700">{curr.privacyPolicy}</span>
              </div>
              <ChevronRight size={16} className="text-slate-300" />
            </button>
          </div>
        </div>

        {/* Logout Action Card */}
        <div className="pt-2">
          <button
            type="button"
            className="w-full h-[52px] rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-100 active:scale-[0.99] text-rose-700 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            onClick={handleLogout}
            disabled={isLoggingOut || showLogoutCompleted}
          >
            {isLoggingOut ? (
              <>
                <svg className="animate-spin h-4 w-4 text-rose-700" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{curr.loggingOut}</span>
              </>
            ) : showLogoutCompleted ? (
              <>
                <span className="text-emerald-700">{curr.seeYouSoon}</span>
              </>
            ) : (
              <>
                <LogOut size={16} />
                <span>{curr.logout}</span>
              </>
            )}
          </button>
        </div>

        {/* App Version Footer */}
        <div className="flex flex-col items-center justify-center pt-2 pb-4 text-center">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            <span className="text-[10px] font-bold text-slate-500">
              FoodSave v1.0.4
            </span>
          </div>
          <span className="text-[9px] font-medium text-slate-400">
            {curr.tagline}
          </span>
        </div>
      </div>

      {/* ========================================================
          HIGH FIDELITY MODALS IMPLEMENTATION FOR PROFILE PORTIONS
         ======================================================== */}

      {/* 1. EDIT PROFILE MODAL */}
      {activeModal === 'edit-profile' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative border border-slate-100">
            <div className="bg-emerald-800 p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">{curr.editProfile}</h3>
                <p className="text-[9px] text-emerald-100">{curr.editDesc}</p>
              </div>
              <button
                className="text-white/80 hover:text-white bg-white/10 p-1.5 rounded-full transition-colors cursor-pointer"
                onClick={() => setActiveModal(null)}
              >
                <X size={15} />
              </button>
            </div>
            
            <form onSubmit={handleSaveProfile} className="p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Establishment Name</label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-emerald-600"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Contact Hotline</label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-emerald-600"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address</label>
                <input
                  type="email"
                  required
                  className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-emerald-600"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Dispatch Location</label>
                <textarea
                  required
                  className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-emerald-600 min-h-[50px] leading-relaxed"
                  value={profileAddress}
                  onChange={(e) => setProfileAddress(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#006b2c] hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Save size={13} />
                <span>{curr.saveChanges}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. BUSINESS DETAILS MODAL */}
      {activeModal === 'business-details' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative border border-slate-100">
            <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">{curr.businessDetails}</h3>
                <p className="text-[9px] text-slate-400">{curr.bizDesc}</p>
              </div>
              <button
                className="text-white/80 hover:text-white bg-white/10 p-1.5 rounded-full transition-colors cursor-pointer"
                onClick={() => setActiveModal(null)}
              >
                <X size={15} />
              </button>
            </div>
            
            <div className="p-5 flex flex-col gap-3.5">
              <div className="grid grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Legal Title</span>
                  <span className="text-xs font-bold text-slate-800">{restaurantName} Ltd.</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Registration ID</span>
                  <span className="text-xs font-mono font-bold text-slate-800">REG-9912831-C</span>
                </div>
              </div>

              <div className="h-[1px] bg-slate-100"></div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Establishment Type</span>
                  <span className="text-xs font-bold text-slate-800">Restaurant &amp; Bistro</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Tax Identification</span>
                  <span className="text-xs font-mono font-bold text-slate-800">GSTIN-88912A34</span>
                </div>
              </div>

              <div className="h-[1px] bg-slate-100"></div>

              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Food Safety Licence</span>
                <div className="flex items-center gap-1.5 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100/30">
                  <Verified size={14} className="text-[#006b2c] fill-emerald-100" />
                  <span className="text-xs font-mono font-bold text-slate-800">FSSAI #1121903400010</span>
                </div>
              </div>

              <button
                type="button"
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer"
                onClick={() => setActiveModal(null)}
              >
                Close Business Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. PICKUP LOCATIONS MODAL */}
      {activeModal === 'pickup-locations' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative border border-slate-100">
            <div className="bg-emerald-800 p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">{curr.pickupLocations}</h3>
                <p className="text-[9px] text-emerald-100">{curr.hubDesc}</p>
              </div>
              <button
                className="text-white/80 hover:text-white bg-white/10 p-1.5 rounded-full transition-colors cursor-pointer"
                onClick={() => setActiveModal(null)}
              >
                <X size={15} />
              </button>
            </div>
            
            <div className="p-5 flex flex-col gap-3">
              {/* Hub 1 */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">1. {restaurantName} Main Kitchen (Primary)</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-[#006b2c] text-[9px] font-bold">Active dispatch</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Banquet Hall 2 Back Alley, Sector 4, Bay 3 Loading Desk, Anna Nagar West, Chennai
                </p>
              </div>

              {/* Hub 2 */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">2. {restaurantName} Express Deli Hub</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[9px] font-bold">Auxiliary</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Commercial Gate 1 Loading Dock, Back Street Kitchen, T-Nagar, Chennai
                </p>
              </div>

              <button
                type="button"
                className="w-full py-2.5 bg-[#006b2c] hover:bg-emerald-800 text-white font-bold text-xs rounded-xl cursor-pointer mt-1"
                onClick={() => {
                  setActiveModal(null);
                  triggerToast('Locations synchronised with courier GPS maps!');
                }}
              >
                Sync GPS Pins
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. NOTIFICATIONS PREFERENCES MODAL */}
      {activeModal === 'notifications' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative border border-slate-100">
            <div className="bg-emerald-800 p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">{curr.notifPrefs}</h3>
                <p className="text-[9px] text-emerald-100">Toggle surplus tracking channels</p>
              </div>
              <button
                className="text-white/80 hover:text-white bg-white/10 p-1.5 rounded-full transition-colors cursor-pointer"
                onClick={() => setActiveModal(null)}
              >
                <X size={15} />
              </button>
            </div>
            
            <div className="p-5 flex flex-col gap-4">
              {/* Push Notifs */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-800">In-App Live Alerts</span>
                  <span className="text-[10px] text-slate-500">Instant sound when courier claims job</span>
                </div>
                <button
                  type="button"
                  className={`w-10 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${notifPush ? 'bg-[#006b2c]' : 'bg-slate-200'}`}
                  onClick={() => setNotifPush(!notifPush)}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${notifPush ? 'translate-x-4' : 'translate-x-0'}`}></div>
                </button>
              </div>

              <div className="h-[1px] bg-slate-100"></div>

              {/* SMS Alerts */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-800">SMS Verification Codes</span>
                  <span className="text-[10px] text-slate-500">Sends handoff PIN verification to dispatch chef</span>
                </div>
                <button
                  type="button"
                  className={`w-10 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${notifSms ? 'bg-[#006b2c]' : 'bg-slate-200'}`}
                  onClick={() => setNotifSms(!notifSms)}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${notifSms ? 'translate-x-4' : 'translate-x-0'}`}></div>
                </button>
              </div>

              <div className="h-[1px] bg-slate-100"></div>

              {/* Email Reports */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-800">Monthly Tax Invoices</span>
                  <span className="text-[10px] text-slate-500">Receives verified tax deduction certificates</span>
                </div>
                <button
                  type="button"
                  className={`w-10 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${notifEmail ? 'bg-[#006b2c]' : 'bg-slate-200'}`}
                  onClick={() => setNotifEmail(!notifEmail)}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${notifEmail ? 'translate-x-4' : 'translate-x-0'}`}></div>
                </button>
              </div>

              <button
                type="button"
                className="w-full py-2.5 bg-[#006b2c] hover:bg-emerald-800 text-white font-bold text-xs rounded-xl cursor-pointer mt-1"
                onClick={() => {
                  setActiveModal(null);
                  triggerToast('Alert thresholds updated!');
                }}
              >
                Apply Preferences
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. HELP & SUPPORT MODAL */}
      {activeModal === 'help-support' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative border border-slate-100">
            <div className="bg-emerald-800 p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">{curr.helpSupport}</h3>
                <p className="text-[9px] text-emerald-100">{curr.faqTitle}</p>
              </div>
              <button
                className="text-white/80 hover:text-white bg-white/10 p-1.5 rounded-full transition-colors cursor-pointer"
                onClick={() => setActiveModal(null)}
              >
                <X size={15} />
              </button>
            </div>
            
            <div className="p-5 flex flex-col gap-3 max-h-[350px] overflow-y-auto">
              {/* FAQ 1 */}
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-slate-800">Q: What foods are accepted for donation?</span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  We accept prepared trays, fresh catering leftovers, pastries, and pantry goods. All cooked meals must be registered within 2 hours of kitchen preparation.
                </p>
              </div>

              <div className="h-[1px] bg-slate-100"></div>

              {/* FAQ 2 */}
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-slate-800">Q: Who are the volunteer couriers?</span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  They are vetted local civic volunteers carrying insulated bags. They are tracked via real-time GPS coordinates and carry verified FoodSave identity cards.
                </p>
              </div>

              <div className="h-[1px] bg-slate-100"></div>

              {/* FAQ 3 */}
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-slate-800">Q: Emergency Support Line?</span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Call our 24/7 rescue support room at <span className="text-[#006b2c] font-bold">+91 44 2626 1200</span> for instant courier rerouting assistance.
                </p>
              </div>

              <button
                type="button"
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer mt-2"
                onClick={() => setActiveModal(null)}
              >
                Dismiss Help Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. PRIVACY POLICY MODAL */}
      {activeModal === 'privacy-policy' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative border border-slate-100">
            <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">{curr.privacyPolicy}</h3>
                <p className="text-[9px] text-slate-400">{curr.privacyDesc}</p>
              </div>
              <button
                className="text-white/80 hover:text-white bg-white/10 p-1.5 rounded-full transition-colors cursor-pointer"
                onClick={() => setActiveModal(null)}
              >
                <X size={15} />
              </button>
            </div>
            
            <div className="p-5 flex flex-col gap-3.5">
              <p className="text-xs text-slate-600 leading-relaxed">
                By donating food via the FoodSave platform, you are fully protected by state Good Samaritan Food Donation Liability exclusions.
              </p>
              
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-[11px] text-slate-500 leading-relaxed flex flex-col gap-1.5">
                <span className="font-bold text-slate-700">Protected Legal Clauses:</span>
                <span>• Excludes liability for accidental safety damages.</span>
                <span>• Covers all verified non-profit community kitchen distribution.</span>
                <span>• Full transport audit log tracking custody handovers.</span>
              </div>

              <button
                type="button"
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer"
                onClick={() => setActiveModal(null)}
              >
                Agree &amp; Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS TOAST MESSAGE */}
      {showToast && (
        <div className="fixed top-20 inset-x-4 z-50 transition-all duration-300 transform translate-y-0 opacity-100 pointer-events-none">
          <div className="bg-slate-800 text-white p-4 rounded-2xl shadow-xl flex items-center gap-3 max-w-sm mx-auto">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <Check size={16} className="stroke-[3px]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white">{toastMessage}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
