import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { DonorRegistration, VolunteerRegistration } from '../types';
import { RegistrationScreen } from './RegistrationScreen';
import { Mail, Lock, ShieldCheck, CheckCircle2, AlertTriangle, Eye, EyeOff, Building2, User, ArrowRight, Sparkles, Phone, Shield, UserPlus, ExternalLink } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { setIsLoggedIn, setRestaurantName, setUserEmail, setUserRole } = useApp();
  
  // Screen mode: 'login' | 'register'
  const [screenMode, setScreenMode] = useState<'login' | 'register'>('login');

  // Choose role: 'owner' (Food Donor) or 'volunteer' (Rescue Volunteer Courier)
  const [role, setRole] = useState<'owner' | 'volunteer'>('owner');

  // Form States
  const [donorFacilityName, setDonorFacilityName] = useState('ABC Grand Kitchen');
  const [donorEmail, setDonorEmail] = useState('donor@foodrescue.org');
  
  const [volunteerName, setVolunteerName] = useState('Ameer Syed');
  const [volunteerPhone, setVolunteerPhone] = useState('+91 94443 12260');
  const [volunteerEmail, setVolunteerEmail] = useState('ameersyed1226@gmail.com');

  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectRole = (selectedRole: 'owner' | 'volunteer') => {
    setRole(selectedRole);
    setError(null);
    setPassword('password123');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (role === 'owner') {
      if (!donorFacilityName.trim()) {
        setError('Please enter your Restaurant or Food Facility name.');
        return;
      }
      if (!donorEmail.trim() || !password) {
        setError('Please enter valid donor login credentials.');
        return;
      }
    } else {
      if (!volunteerName.trim()) {
        setError('Please enter your Volunteer Courier name.');
        return;
      }
      if (!volunteerEmail.trim() || !password) {
        setError('Please enter valid volunteer login credentials.');
        return;
      }
    }

    setIsSubmitting(true);

    // Check user verification status from backend API
    const emailToCheck = role === 'owner' ? donorEmail.trim() : volunteerEmail.trim();
    try {
      const res = await fetch('http://localhost:5000/api/users');
      if (res.ok) {
        const users = await res.json();
        const matchedUser = users.find((u: any) => u.email === emailToCheck);
        if (matchedUser && matchedUser.status === 'Pending') {
          setIsSubmitting(false);
          setError('⏳ Your account is pending admin approval. Please wait for the admin to verify your registration before logging in.');
          return;
        }
        if (matchedUser && matchedUser.status === 'Blocked') {
          setIsSubmitting(false);
          setError('🚫 Your account has been blocked by the admin. Please contact support.');
          return;
        }
        if (matchedUser && matchedUser.status === 'Suspended') {
          setIsSubmitting(false);
          setError('⚠️ Your account has been suspended. Please contact admin for reinstatement.');
          return;
        }
      }
    } catch (err) {
      // Backend not available, allow login with local-only mode
    }

    setTimeout(() => {
      if (role === 'owner') {
        setRestaurantName(donorFacilityName.trim());
        setUserEmail(donorEmail.trim());
        setUserRole('owner');
      } else {
        setRestaurantName(volunteerName.trim());
        setUserEmail(volunteerEmail.trim());
        setUserRole('volunteer');
      }
      setIsSubmitting(false);
      setIsLoggedIn(true);
    }, 600);
  };

  const handleQuickLogin = async (selectedRole: 'owner' | 'volunteer', name: string, email: string) => {
    setRole(selectedRole);
    if (selectedRole === 'owner') {
      setDonorFacilityName(name);
      setDonorEmail(email);
    } else {
      setVolunteerName(name);
      setVolunteerEmail(email);
    }
    setPassword('password123');
    setError(null);
    setIsSubmitting(true);

    // Check user verification status from backend API
    try {
      const res = await fetch('http://localhost:5000/api/users');
      if (res.ok) {
        const users = await res.json();
        const matchedUser = users.find((u: any) => u.email === email);
        if (matchedUser && matchedUser.status === 'Pending') {
          setIsSubmitting(false);
          setError('⏳ Your account is pending admin approval. Please wait for the admin to verify your registration.');
          return;
        }
        if (matchedUser && (matchedUser.status === 'Blocked' || matchedUser.status === 'Suspended')) {
          setIsSubmitting(false);
          setError('🚫 Your account access has been restricted by admin. Please contact support.');
          return;
        }
      }
    } catch (err) {
      // Backend not available, allow login
    }

    setTimeout(() => {
      setRestaurantName(name);
      setUserEmail(email);
      setUserRole(selectedRole);
      setIsSubmitting(false);
      setIsLoggedIn(true);
    }, 400);
  };

  const handleRegistrationComplete = (regRole: 'owner' | 'volunteer', data: DonorRegistration | VolunteerRegistration) => {
    setRestaurantName(data.name);
    setUserEmail(data.email);
    setUserRole(regRole);
    setIsLoggedIn(true);
  };

  // Show registration screen
  if (screenMode === 'register') {
    return (
      <RegistrationScreen
        onRegistrationComplete={handleRegistrationComplete}
        onBackToLogin={() => setScreenMode('login')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f2fcf2] flex flex-col justify-center items-center px-4 py-8 text-slate-800">
      <div className="w-full max-w-[420px] flex flex-col gap-5">
        
        {/* LOGO & HEADING */}
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#006b2c] flex items-center justify-center text-white shadow-lg shadow-emerald-900/20 mb-3 ring-4 ring-emerald-500/20">
            <span className="text-2xl">🌱</span>
          </div>
          <span className="text-[10px] font-black tracking-widest text-[#006b2c] uppercase bg-emerald-100/70 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Food Sharing Alliance
          </span>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-2">
            FoodSave Community
          </h1>
          <p className="text-xs text-slate-500 max-w-[300px] mt-1 font-medium">
            Bridging surplus food from commercial kitchens to verified community volunteers.
          </p>
        </div>

        {/* PORTAL SELECTOR: FOOD DONOR & VOLUNTEER ONLY */}
        <div className="grid grid-cols-2 gap-2.5 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => handleSelectRole('owner')}
            className={`p-3 rounded-2xl border-2 flex flex-col items-center text-center gap-1 transition-all cursor-pointer ${
              role === 'owner'
                ? 'bg-white border-[#006b2c] shadow-md ring-2 ring-emerald-600/10'
                : 'bg-white/70 border-slate-200 text-slate-500 hover:border-slate-300'
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base ${
              role === 'owner' ? 'bg-emerald-100 text-[#006b2c]' : 'bg-slate-100 text-slate-400'
            }`}>
              🏢
            </div>
            <span className={`text-[11px] font-black ${role === 'owner' ? 'text-slate-800' : 'text-slate-600'}`}>
              Food Donor
            </span>
            <span className="text-[9px] text-slate-400 font-semibold leading-tight">
              Commercial / Restaurant
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectRole('volunteer')}
            className={`p-3 rounded-2xl border-2 flex flex-col items-center text-center gap-1 transition-all cursor-pointer ${
              role === 'volunteer'
                ? 'bg-white border-[#006b2c] shadow-md ring-2 ring-emerald-600/10'
                : 'bg-white/70 border-slate-200 text-slate-500 hover:border-slate-300'
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base ${
              role === 'volunteer' ? 'bg-emerald-100 text-[#006b2c]' : 'bg-slate-100 text-slate-400'
            }`}>
              🚴
            </div>
            <span className={`text-[11px] font-black ${role === 'volunteer' ? 'text-slate-800' : 'text-slate-600'}`}>
              Volunteer Courier
            </span>
            <span className="text-[9px] text-slate-400 font-semibold leading-tight">
              Rescue & Distribute
            </span>
          </button>
        </div>

        {/* LOGIN FORM CARD */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-base">
                {role === 'owner' ? '🏢' : '🚴'}
              </span>
              <div className="flex flex-col">
                <span className="text-xs font-black text-slate-800">
                  {role === 'owner' ? 'Food Donor Sign In' : 'Rescue Volunteer Sign In'}
                </span>
                <span className="text-[10px] text-slate-400">
                  {role === 'owner' ? 'Post and track meal donations' : 'Accept pickups and rescue food'}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full border text-[#006b2c] bg-emerald-50 border-emerald-100">
              {role === 'owner' ? 'Donor Portal' : 'Volunteer Portal'}
            </span>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-800 p-3 rounded-xl text-xs flex items-center gap-2">
              <AlertTriangle size={14} className="shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {role === 'owner' ? (
              <>
                {/* Facility Name */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                    <Building2 size={12} className="text-[#006b2c]" />
                    <span>Restaurant / Food Facility Name</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={donorFacilityName}
                    onChange={(e) => setDonorFacilityName(e.target.value)}
                    placeholder="e.g. ABC Grand Kitchen"
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-[#006b2c] focus:outline-none transition-all placeholder:text-slate-400"
                  />
                </div>

                {/* Donor Email */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                    <Mail size={12} className="text-[#006b2c]" />
                    <span>Registered Business Email</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={donorEmail}
                    onChange={(e) => setDonorEmail(e.target.value)}
                    placeholder="donor@foodrescue.org"
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-[#006b2c] focus:outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
              </>
            ) : (
              <>
                {/* Volunteer Name */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                    <User size={12} className="text-[#006b2c]" />
                    <span>Volunteer Full Name</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={volunteerName}
                    onChange={(e) => setVolunteerName(e.target.value)}
                    placeholder="e.g. Ameer Syed"
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-[#006b2c] focus:outline-none transition-all placeholder:text-slate-400"
                  />
                </div>

                {/* Volunteer Phone */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                    <Phone size={12} className="text-[#006b2c]" />
                    <span>Mobile Number</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={volunteerPhone}
                    onChange={(e) => setVolunteerPhone(e.target.value)}
                    placeholder="+91 94443 12260"
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-[#006b2c] focus:outline-none transition-all placeholder:text-slate-400"
                  />
                </div>

                {/* Volunteer Email */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                    <Mail size={12} className="text-[#006b2c]" />
                    <span>Volunteer Email</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={volunteerEmail}
                    onChange={(e) => setVolunteerEmail(e.target.value)}
                    placeholder="ameersyed1226@gmail.com"
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-[#006b2c] focus:outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
              </>
            )}

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-600 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Lock size={12} className="text-[#006b2c]" />
                  <span>Security Password</span>
                </span>
                <span className="text-[10px] text-slate-400 hover:text-[#006b2c] cursor-pointer">
                  Forgot?
                </span>
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-11 pl-3.5 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-[#006b2c] focus:outline-none transition-all placeholder:text-slate-400"
                />
                <button
                  type="button"
                  className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 px-1">
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="rounded border-slate-300 text-[#006b2c] focus:ring-emerald-500/20 w-4 h-4"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember this portal session</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full h-11 bg-[#006b2c] hover:bg-emerald-800 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-[0.98] transition-all disabled:opacity-70 mt-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <span>
                    {role === 'owner' ? 'Log In as Food Donor' : 'Log In as Rescue Volunteer'}
                  </span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-center">
            <button
              type="button"
              onClick={() => setScreenMode('register')}
              className="flex items-center gap-1.5 text-[11px] font-bold text-[#006b2c] hover:text-emerald-700 cursor-pointer transition-colors"
            >
              <UserPlus size={13} />
              <span>New User? Register Donor or Volunteer</span>
            </button>
          </div>

          {/* Quick Sandbox 1-Click Fast Login */}
          <div className="pt-3 border-t border-slate-100 flex flex-col items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              1-Click Fast Access
            </span>
            <div className="w-full grid grid-cols-2 gap-2">
              <button
                type="button"
                className="h-9 px-2 text-[10px] font-black border border-emerald-200 rounded-xl text-[#006b2c] bg-emerald-50 hover:bg-emerald-100/70 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                onClick={() => handleQuickLogin('owner', 'ABC Grand Kitchen', 'donor@foodrescue.org')}
              >
                <span>🏢 Donor (ABC Kitchen)</span>
              </button>

              <button
                type="button"
                className="h-9 px-2 text-[10px] font-black border border-slate-200 rounded-xl text-slate-700 bg-slate-50 hover:bg-slate-100 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                onClick={() => handleQuickLogin('volunteer', 'Ameer Syed', 'ameersyed1226@gmail.com')}
              >
                <span>🚴 Volunteer (Ameer)</span>
              </button>
            </div>
          </div>
        </div>

        {/* ADMIN PORTAL SEPARATION LINK */}
        <div className="bg-slate-900 text-white rounded-2xl p-3.5 flex items-center justify-between border border-slate-800 shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Shield size={16} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-100">Looking for Admin Panel?</span>
              <span className="text-[10px] text-slate-400">Independent admin dashboard in ab/admin-panel</span>
            </div>
          </div>
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl transition-all shadow-sm active:scale-95"
          >
            <span>Open Admin</span>
            <ExternalLink size={12} />
          </a>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-center gap-1.5 text-center text-slate-400 text-[10px]">
          <ShieldCheck size={13} className="text-[#006b2c] shrink-0" />
          <span>FSSAI Certified Zero-Waste Food Recovery Portal</span>
        </div>
      </div>
    </div>
  );
};
