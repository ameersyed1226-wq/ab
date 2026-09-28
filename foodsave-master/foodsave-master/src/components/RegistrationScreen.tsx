import React, { useState } from 'react';
import { DonorRegistration, VolunteerRegistration } from '../types';
import { 
  User, Mail, Phone, Lock, Eye, EyeOff, MapPin, FileText, ShieldCheck, 
  ArrowRight, ArrowLeft, CheckCircle2, AlertTriangle, Camera, Building2, Clock 
} from 'lucide-react';

interface RegistrationScreenProps {
  onRegistrationComplete: (role: 'owner' | 'volunteer', data: DonorRegistration | VolunteerRegistration) => void;
  onBackToLogin: () => void;
}

export const RegistrationScreen: React.FC<RegistrationScreenProps> = ({ onRegistrationComplete, onBackToLogin }) => {
  const [role, setRole] = useState<'owner' | 'volunteer'>('owner');
  const [step, setStep] = useState(1); // 1: basic info, 2: documents, 3: terms
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);

  // Common fields
  const [name, setName] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [aadhaarNo, setAadhaarNo] = useState('');
  const [address, setAddress] = useState('');

  // Donor-specific
  const [fssaiLicense, setFssaiLicense] = useState('');

  // Volunteer-specific
  const [volunteerId, setVolunteerId] = useState('');

  // Terms
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  // Photo
  const [profilePhoto, setProfilePhoto] = useState('');

  const totalSteps = 3;

  // Show registration success screen (pending admin approval)
  if (registrationComplete) {
    return (
      <div className="fixed inset-0 z-40 bg-[#f2fcf2] flex flex-col select-none overflow-y-auto">
        <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-amber-100/60 via-amber-50/30 to-transparent pointer-events-none"></div>
        <div className="w-full max-w-sm mx-auto my-auto relative z-10 py-6 px-5 flex flex-col gap-5 items-center text-center">

          {/* Pending Approval Icon */}
          <div className="w-20 h-20 rounded-full bg-amber-100 border-2 border-amber-300 flex items-center justify-center shadow-lg" style={{animation: 'pulse 2s ease-in-out infinite'}}>
            <Clock size={36} className="text-amber-600" />
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-xl font-black text-slate-800 tracking-tight">
              Registration Submitted! 🎉
            </h1>
            <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-[280px]">
              Your account has been created and is now <strong className="text-amber-600">pending admin verification</strong>.
            </p>
          </div>

          {/* What happens next */}
          <div className="w-full bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-amber-600 shrink-0" />
              <span className="text-xs font-bold text-amber-800">What happens next?</span>
            </div>
            <div className="flex flex-col gap-1.5 text-[11px] text-amber-700 leading-relaxed pl-6">
              <p>1. Admin will review your submitted documents</p>
              <p>2. Once verified, you will receive full access</p>
              <p>3. Login with your email & password after approval</p>
            </div>
          </div>

          {/* Summary Card */}
          <div className="w-full bg-white border border-slate-100 rounded-2xl p-4 flex flex-col gap-2 shadow-sm">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Submitted Details</span>
            <div className="flex justify-between text-xs py-1 border-b border-slate-50">
              <span className="text-slate-500">Name</span>
              <span className="font-bold text-slate-800">{name}</span>
            </div>
            <div className="flex justify-between text-xs py-1 border-b border-slate-50">
              <span className="text-slate-500">Email</span>
              <span className="font-bold text-slate-800">{email}</span>
            </div>
            <div className="flex justify-between text-xs py-1 border-b border-slate-50">
              <span className="text-slate-500">Role</span>
              <span className="font-bold text-[#006b2c]">{role === 'owner' ? 'Food Donor' : 'Volunteer Courier'}</span>
            </div>
            <div className="flex justify-between text-xs py-1">
              <span className="text-slate-500">Status</span>
              <span className="font-bold text-amber-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                Pending Approval
              </span>
            </div>
          </div>

          {/* Back to Login Button */}
          <button
            type="button"
            onClick={onBackToLogin}
            className="w-full h-11 bg-[#006b2c] hover:bg-emerald-800 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-[0.98] transition-all"
          >
            <ArrowLeft size={14} />
            <span>Go to Login</span>
          </button>

          <p className="text-[10px] text-slate-400 font-medium">
            Admin Panel: <strong className="text-slate-500">localhost:3000</strong>
          </p>
        </div>
      </div>
    );
  }

  const validateStep1 = (): boolean => {
    if (!name.trim()) { setError('Please enter your full name'); return false; }
    if (!mobileNo.trim() || mobileNo.length < 10) { setError('Please enter a valid mobile number'); return false; }
    if (!email.trim() || !email.includes('@')) { setError('Please enter a valid email address'); return false; }
    if (!password || password.length < 6) { setError('Password must be at least 6 characters'); return false; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return false; }
    return true;
  };

  const validateStep2 = (): boolean => {
    if (!aadhaarNo.trim() || aadhaarNo.length < 12) { setError('Please enter a valid 12-digit Aadhaar number'); return false; }
    if (role === 'owner' && !fssaiLicense.trim()) { setError('Please enter your FSSAI License number'); return false; }
    if (role === 'volunteer' && !volunteerId.trim()) { setError('Please enter your NGO ID'); return false; }
    if (!address.trim()) { setError('Please enter your address'); return false; }
    return true;
  };

  const handleNext = () => {
    setError(null);
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleBack = () => {
    setError(null);
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    setError(null);
    if (!termsAccepted) {
      setError('Please accept the Terms and Conditions to proceed');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const id = `${role === 'owner' ? 'DON' : 'VOL'}-${Date.now().toString(36).toUpperCase()}`;
      
      if (role === 'owner') {
        const donorData: DonorRegistration = {
          id,
          name: name.trim(),
          mobileNo: mobileNo.trim(),
          email: email.trim(),
          password,
          aadhaarNo: aadhaarNo.trim(),
          fssaiLicense: fssaiLicense.trim(),
          address: address.trim(),
          termsAccepted: true,
          registeredAt: new Date().toISOString(),
          status: 'pending',
          profilePhoto
        };

        // Save to localStorage
        const existing = JSON.parse(localStorage.getItem('foodsave_donors') || '[]');
        existing.push(donorData);
        localStorage.setItem('foodsave_donors', JSON.stringify(existing));

        // Connect to Shared Admin Panel Backend API!
        try {
          fetch('http://localhost:5000/api/users/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: donorData.id,
              name: donorData.name,
              email: donorData.email,
              phone: donorData.mobileNo,
              address: donorData.address,
              role: 'Donor',
              status: 'Pending',
              fssaiLicense: donorData.fssaiLicense,
              aadhaarNo: donorData.aadhaarNo
            })
          }).catch(err => console.log('Admin backend sync notice:', err));
        } catch (e) {
          console.log('Sync err:', e);
        }

        setRegistrationComplete(true);
      } else {
        const volunteerData: VolunteerRegistration = {
          id,
          name: name.trim(),
          mobileNo: mobileNo.trim(),
          email: email.trim(),
          password,
          aadhaarNo: aadhaarNo.trim(),
          volunteerId: volunteerId.trim(),
          address: address.trim(),
          termsAccepted: true,
          registeredAt: new Date().toISOString(),
          status: 'pending',
          profilePhoto,
          isAvailable: true,
          totalDeliveries: 0,
          rating: 5.0
        };

        // Save to localStorage
        const existing = JSON.parse(localStorage.getItem('foodsave_volunteers') || '[]');
        existing.push(volunteerData);
        localStorage.setItem('foodsave_volunteers', JSON.stringify(existing));

        // Connect to Shared Admin Panel Backend API!
        try {
          fetch('http://localhost:5000/api/users/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: volunteerData.id,
              name: volunteerData.name,
              email: volunteerData.email,
              phone: volunteerData.mobileNo,
              address: volunteerData.address,
              role: 'Volunteer',
              status: 'Pending',
              volunteerId: volunteerData.volunteerId,
              aadhaarNo: volunteerData.aadhaarNo
            })
          }).catch(err => console.log('Admin backend sync notice:', err));
        } catch (e) {
          console.log('Sync err:', e);
        }

        setRegistrationComplete(true);
      }

      setIsSubmitting(false);
    }, 1200);
  };

  const handlePhotoCapture = () => {
    // Simulate a photo capture - in real app, use camera/file API
    const avatars = [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBfcCcSKgnqV0g--fg-wS4XTKtCaL3xOhkyakjumOkRaWlnNHJBxuEODK2_WseAzmvh8Tf8BsUvVOiqTIG0gpMjlz-8DalGdyGbPHxXT7z8qD1zXL3LammngD45Bwu3TRCQvcfkpCiPrUewr_R2aBRRoKXrUJwU2Yr8ohut1hGhuZfZdznGdvcmeDNP5Z1iU66QFCHbAGomsieKThqC6oNMppP4079oudmHMeZadJubJLVXLU8sEQ4',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAAjcmwL6vVUI70nofmpYYolOqtlb3WBTtNoVHYUYAY4hwzZQIFRyIrfafgbI0M5NhiRDRgi0mjDPKj18rpXljUSkUIB6u4ooON0nBspuSZ5xnGoxb52-TZkcpZZr2eeHIvPlrlgJRxe5RUJaV0buR1skwjveTfskl7pFy2T9yCk7berdN5VTx7aiRKWjlpk94SQRKV1nBH-DCzR3FU5gDJY4VANi9vnDn07J1eebe0e1A-huK20qo'
    ];
    setProfilePhoto(avatars[Math.floor(Math.random() * avatars.length)]);
  };

  return (
    <div className="fixed inset-0 z-40 bg-[#f2fcf2] flex flex-col select-none overflow-y-auto">
      {/* Decorative gradient header */}
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-emerald-200/60 via-emerald-100/30 to-transparent pointer-events-none"></div>
      
      {/* Animated floating circles */}
      <div className="absolute top-10 left-6 w-20 h-20 bg-emerald-300/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute top-32 right-8 w-16 h-16 bg-teal-200/30 rounded-full blur-lg" style={{animation: 'pulse 3s ease-in-out infinite 1s'}}></div>

      <div className="w-full max-w-sm mx-auto my-auto relative z-10 py-6 px-5 flex flex-col gap-4">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <div className="p-2 bg-white rounded-2xl border border-emerald-100 shadow-xs mb-2.5">
            <img
              alt="FoodSave Logo"
              className="w-12 h-12 object-contain"
              src="https://ik.imagekit.io/72dmudtmj/WhatsApp%20Image%202026-09-19%20at%2010.23.50%20PM.jpeg"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="text-[10px] font-black text-[#006b2c] tracking-widest uppercase leading-none">
            FoodSave Registration
          </span>
          <h1 className="text-xl font-black text-slate-800 tracking-tight mt-1">
            Create New Account
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Register as Food Donor or Volunteer Courier
          </p>
        </div>

        {/* Role Selection */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => { setRole('owner'); setError(null); }}
            className={`p-3.5 rounded-2xl border-2 flex flex-col items-center text-center gap-1.5 transition-all cursor-pointer ${
              role === 'owner'
                ? 'bg-white border-[#006b2c] shadow-md ring-2 ring-emerald-600/10'
                : 'bg-white/70 border-slate-200 text-slate-500 hover:border-slate-300'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
              role === 'owner' ? 'bg-emerald-100 text-[#006b2c]' : 'bg-slate-100 text-slate-400'
            }`}>
              🏢
            </div>
            <span className={`text-xs font-black ${role === 'owner' ? 'text-slate-800' : 'text-slate-600'}`}>
              Food Donor
            </span>
            <span className="text-[9px] text-slate-400 font-semibold leading-tight">
              Restaurant / Catering
            </span>
          </button>

          <button
            type="button"
            onClick={() => { setRole('volunteer'); setError(null); }}
            className={`p-3.5 rounded-2xl border-2 flex flex-col items-center text-center gap-1.5 transition-all cursor-pointer ${
              role === 'volunteer'
                ? 'bg-white border-[#006b2c] shadow-md ring-2 ring-emerald-600/10'
                : 'bg-white/70 border-slate-200 text-slate-500 hover:border-slate-300'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
              role === 'volunteer' ? 'bg-emerald-100 text-[#006b2c]' : 'bg-slate-100 text-slate-400'
            }`}>
              🚴
            </div>
            <span className={`text-xs font-black ${role === 'volunteer' ? 'text-slate-800' : 'text-slate-600'}`}>
              Volunteer
            </span>
            <span className="text-[9px] text-slate-400 font-semibold leading-tight">
              Food Rescue Courier
            </span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-2 px-1">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1 flex flex-col items-center gap-1">
              <div className={`h-1.5 w-full rounded-full transition-all duration-500 ${
                s <= step ? 'bg-[#006b2c]' : 'bg-slate-200'
              }`}></div>
              <span className={`text-[8px] font-bold uppercase tracking-wider ${
                s <= step ? 'text-[#006b2c]' : 'text-slate-400'
              }`}>
                {s === 1 ? 'Basic Info' : s === 2 ? 'Documents' : 'Terms'}
              </span>
            </div>
          ))}
        </div>

        {/* Registration Form Card */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-5 flex flex-col gap-4">
          
          {/* Step Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-base">{step === 1 ? '📝' : step === 2 ? '📄' : '✅'}</span>
              <div className="flex flex-col">
                <span className="text-xs font-black text-slate-800">
                  {step === 1 ? 'Personal Details' : step === 2 ? 'Required Documents' : 'Terms & Conditions'}
                </span>
                <span className="text-[10px] text-slate-400">
                  Step {step} of {totalSteps}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-black text-[#006b2c] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              {role === 'owner' ? 'Donor' : 'Volunteer'}
            </span>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-800 p-3 rounded-xl text-xs flex items-center gap-2">
              <AlertTriangle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* =========== STEP 1: BASIC INFO =========== */}
          {step === 1 && (
            <div className="flex flex-col gap-3.5">
              {/* Profile Photo */}
              <div className="flex flex-col items-center gap-2">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-slate-100 overflow-hidden border-2 border-dashed border-slate-300 flex items-center justify-center">
                    {profilePhoto ? (
                      <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <Camera size={24} className="text-slate-400" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handlePhotoCapture}
                    className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#006b2c] rounded-full flex items-center justify-center text-white shadow-md cursor-pointer hover:bg-emerald-700 transition-colors"
                  >
                    <Camera size={12} />
                  </button>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold">Upload Profile Photo</span>
              </div>

              {/* Name */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
                  Full Name *
                </label>
                <div className="bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-2.5 flex items-center gap-2 focus-within:ring-2 focus-within:ring-emerald-600/20">
                  <User size={14} className="text-[#006b2c] shrink-0" />
                  <input
                    type="text"
                    required
                    className="bg-transparent w-full text-xs text-slate-800 focus:outline-none placeholder-slate-300 font-bold"
                    placeholder={role === 'owner' ? 'Restaurant / Facility Name' : 'Your Full Name'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              {/* Mobile */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
                  Mobile Number *
                </label>
                <div className="bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-2.5 flex items-center gap-2 focus-within:ring-2 focus-within:ring-emerald-600/20">
                  <Phone size={14} className="text-slate-400 shrink-0" />
                  <input
                    type="tel"
                    required
                    className="bg-transparent w-full text-xs text-slate-800 focus:outline-none placeholder-slate-300 font-medium"
                    placeholder="+91 94443 XXXXX"
                    value={mobileNo}
                    onChange={(e) => setMobileNo(e.target.value)}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
                  Email Address *
                </label>
                <div className="bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-2.5 flex items-center gap-2 focus-within:ring-2 focus-within:ring-emerald-600/20">
                  <Mail size={14} className="text-slate-400 shrink-0" />
                  <input
                    type="email"
                    required
                    className="bg-transparent w-full text-xs text-slate-800 focus:outline-none placeholder-slate-300 font-medium"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
                  Password *
                </label>
                <div className="bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-2.5 flex items-center gap-2 focus-within:ring-2 focus-within:ring-emerald-600/20">
                  <Lock size={14} className="text-slate-400 shrink-0" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="bg-transparent w-full text-xs text-slate-800 focus:outline-none placeholder-slate-300 font-mono font-medium"
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="text-slate-400 hover:text-slate-600 cursor-pointer shrink-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
                  Confirm Password *
                </label>
                <div className="bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-2.5 flex items-center gap-2 focus-within:ring-2 focus-within:ring-emerald-600/20">
                  <Lock size={14} className="text-slate-400 shrink-0" />
                  <input
                    type="password"
                    required
                    className="bg-transparent w-full text-xs text-slate-800 focus:outline-none placeholder-slate-300 font-mono font-medium"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* =========== STEP 2: DOCUMENTS =========== */}
          {step === 2 && (
            <div className="flex flex-col gap-3.5">
              {/* Aadhaar Number */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
                  Aadhaar Number *
                </label>
                <div className="bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-2.5 flex items-center gap-2 focus-within:ring-2 focus-within:ring-emerald-600/20">
                  <ShieldCheck size={14} className="text-[#006b2c] shrink-0" />
                  <input
                    type="text"
                    required
                    maxLength={12}
                    className="bg-transparent w-full text-xs text-slate-800 focus:outline-none placeholder-slate-300 font-mono font-bold"
                    placeholder="XXXX XXXX XXXX"
                    value={aadhaarNo}
                    onChange={(e) => setAadhaarNo(e.target.value.replace(/\D/g, '').slice(0, 12))}
                  />
                </div>
                <span className="text-[9px] text-slate-400 px-1">12-digit Unique Identity Number</span>
              </div>

              {/* Role-specific document */}
              {role === 'owner' ? (
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
                    FSSAI License Number *
                  </label>
                  <div className="bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-2.5 flex items-center gap-2 focus-within:ring-2 focus-within:ring-emerald-600/20">
                    <FileText size={14} className="text-amber-600 shrink-0" />
                    <input
                      type="text"
                      required
                      className="bg-transparent w-full text-xs text-slate-800 focus:outline-none placeholder-slate-300 font-mono font-bold"
                      placeholder="FSSAI #XXXXXXXXXXXXXX"
                      value={fssaiLicense}
                      onChange={(e) => setFssaiLicense(e.target.value)}
                    />
                  </div>
                  <span className="text-[9px] text-slate-400 px-1">Food Safety & Standards Authority License</span>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
                    NGO ID *
                  </label>
                  <div className="bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-2.5 flex items-center gap-2 focus-within:ring-2 focus-within:ring-emerald-600/20">
                    <FileText size={14} className="text-blue-600 shrink-0" />
                    <input
                      type="text"
                      required
                      className="bg-transparent w-full text-xs text-slate-800 focus:outline-none placeholder-slate-300 font-mono font-bold"
                      placeholder="NGO-XXXXXXX"
                      value={volunteerId}
                      onChange={(e) => setVolunteerId(e.target.value)}
                    />
                  </div>
                  <span className="text-[9px] text-slate-400 px-1">FoodSave NGO Identity Card Number</span>
                </div>
              )}

              {/* Address */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
                  {role === 'owner' ? 'Restaurant / Facility Address *' : 'Home Address *'}
                </label>
                <div className="bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-2.5 flex items-start gap-2 focus-within:ring-2 focus-within:ring-emerald-600/20">
                  <MapPin size={14} className="text-rose-500 shrink-0 mt-0.5" />
                  <textarea
                    required
                    className="bg-transparent w-full text-xs text-slate-800 focus:outline-none placeholder-slate-300 font-medium min-h-[60px] resize-none leading-relaxed"
                    placeholder="Full address with landmark..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              </div>

              {/* Document info */}
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-start gap-2">
                <FileText size={14} className="text-amber-600 shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-amber-800">Required Documents</span>
                  <span className="text-[10px] text-amber-700 leading-relaxed">
                    {role === 'owner' 
                      ? 'FSSAI License certificate, Business registration, GSTIN (optional)'
                      : 'Valid NGO ID card, Government photo ID proof'
                    }
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* =========== STEP 3: TERMS =========== */}
          {step === 3 && (
            <div className="flex flex-col gap-3.5">
              {/* Registration Summary */}
              <div className="bg-emerald-50/50 border border-emerald-100/50 rounded-2xl p-4 flex flex-col gap-3">
                <span className="text-[10px] font-black text-[#006b2c] uppercase tracking-wider">Registration Summary</span>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] text-slate-400 font-bold uppercase">Name</span>
                    <span className="text-xs font-bold text-slate-800">{name}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] text-slate-400 font-bold uppercase">Mobile</span>
                    <span className="text-xs font-bold text-slate-800">{mobileNo}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] text-slate-400 font-bold uppercase">Email</span>
                    <span className="text-xs font-bold text-slate-800 truncate">{email}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] text-slate-400 font-bold uppercase">Aadhaar</span>
                    <span className="text-xs font-mono font-bold text-slate-800">
                      {'●●●● ●●●● ' + aadhaarNo.slice(-4)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5 col-span-2">
                    <span className="text-[9px] text-slate-400 font-bold uppercase">
                      {role === 'owner' ? 'FSSAI License' : 'NGO ID'}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-800">
                      {role === 'owner' ? fssaiLicense : volunteerId}
                    </span>
                  </div>
                </div>
              </div>

              {/* Terms & Conditions Box */}
              <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 max-h-[140px] overflow-y-auto">
                <h4 className="text-xs font-bold text-slate-800 mb-2">Terms & Conditions</h4>
                <div className="text-[10px] text-slate-500 leading-relaxed flex flex-col gap-1.5">
                  <p>1. I confirm that all information provided is accurate and verifiable.</p>
                  <p>2. I agree to comply with FSSAI food safety guidelines for donation.</p>
                  <p>3. I understand that donated food must be within safe consumption timelines.</p>
                  <p>4. I consent to GPS location tracking during active deliveries.</p>
                  <p>5. I acknowledge that FoodSave acts as a connecting platform and is protected under Good Samaritan food donation laws.</p>
                  <p>6. I agree to share my contact details with assigned {role === 'owner' ? 'volunteers' : 'donors'} for coordination.</p>
                  <p>7. I understand my account may be suspended for misuse or providing false information.</p>
                  <p>8. Privacy Policy: Your data is encrypted and never shared with third parties.</p>
                </div>
              </div>

              {/* Accept Checkbox */}
              <label className="flex items-start gap-2.5 cursor-pointer select-none p-2 bg-white border border-slate-200/60 rounded-xl hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  className="rounded border-slate-300 text-[#006b2c] focus:ring-emerald-500/20 w-5 h-5 mt-0.5 shrink-0"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                />
                <span className="text-[11px] font-bold text-slate-700 leading-relaxed">
                  I have read and agree to the Terms & Conditions, Privacy Policy, and FSSAI compliance guidelines
                </span>
              </label>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center gap-2.5 pt-2">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="h-11 px-4 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>
            )}

            {step < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 h-11 bg-[#006b2c] hover:bg-emerald-800 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-[0.98] transition-all"
              >
                <span>Continue</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 h-11 bg-[#006b2c] hover:bg-emerald-800 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-[0.98] transition-all disabled:bg-emerald-700"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={14} />
                    <span>Complete Registration</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Back to Login */}
        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={onBackToLogin}
            className="text-xs font-bold text-[#006b2c] hover:text-emerald-700 cursor-pointer flex items-center gap-1"
          >
            <ArrowLeft size={12} />
            <span>Already have an account? Sign In</span>
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-1.5 text-center text-slate-400 text-[10px]">
          <ShieldCheck size={13} className="text-[#006b2c] shrink-0" />
          <span>FSSAI Certified Zero-Waste Food Recovery Portal</span>
        </div>
      </div>
    </div>
  );
};
