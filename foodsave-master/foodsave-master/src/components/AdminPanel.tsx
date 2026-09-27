import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { DonorRegistration, VolunteerRegistration, Donation } from '../types';
import {
  LayoutDashboard, Users, Truck, Package, MapPin, ShieldCheck, Search,
  ChevronDown, ChevronRight, Eye, CheckCircle, XCircle, Link2, LogOut,
  UserCheck, Clock, Star, Phone, Mail, FileText, Activity, TrendingUp,
  ArrowRight, AlertTriangle, X, Navigation
} from 'lucide-react';

type AdminTab = 'dashboard' | 'donors' | 'volunteers' | 'donations' | 'tracking';

interface AssignmentModal {
  donationId: string;
  donationName: string;
}

export const AdminPanel: React.FC = () => {
  const { donations, setDonations, setIsLoggedIn, setUserRole } = useApp();
  
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');
  const [donors, setDonors] = useState<DonorRegistration[]>([]);
  const [volunteers, setVolunteers] = useState<VolunteerRegistration[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDonor, setSelectedDonor] = useState<DonorRegistration | null>(null);
  const [selectedVolunteer, setSelectedVolunteer] = useState<VolunteerRegistration | null>(null);
  const [assignmentModal, setAssignmentModal] = useState<AssignmentModal | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Load data from localStorage
  useEffect(() => {
    const loadedDonors = JSON.parse(localStorage.getItem('foodsave_donors') || '[]');
    const loadedVolunteers = JSON.parse(localStorage.getItem('foodsave_volunteers') || '[]');
    
    // Add sample data if empty
    if (loadedDonors.length === 0) {
      const sampleDonors: DonorRegistration[] = [
        {
          id: 'DON-SAMPLE1',
          name: 'ABC Grand Kitchen',
          mobileNo: '+91 94443 55678',
          email: 'donor@foodrescue.org',
          password: 'password123',
          aadhaarNo: '234567891234',
          fssaiLicense: 'FSSAI #1121903400010',
          address: 'Banquet Hall 2, Anna Nagar West, Sector 4, Chennai',
          termsAccepted: true,
          registeredAt: '2026-09-10T10:30:00',
          status: 'approved',
          latitude: 11.3985,
          longitude: 79.6965
        },
        {
          id: 'DON-SAMPLE2',
          name: 'Green Bistro',
          mobileNo: '+91 98402 12345',
          email: 'greenbistro@foodsave.org',
          password: 'password123',
          aadhaarNo: '567890123456',
          fssaiLicense: 'FSSAI #2234567890012',
          address: '42, Mount Road, T-Nagar, Chennai',
          termsAccepted: true,
          registeredAt: '2026-09-12T14:20:00',
          status: 'approved',
          latitude: 11.4012,
          longitude: 79.7023
        }
      ];
      localStorage.setItem('foodsave_donors', JSON.stringify(sampleDonors));
      setDonors(sampleDonors);
    } else {
      setDonors(loadedDonors);
    }

    if (loadedVolunteers.length === 0) {
      const sampleVolunteers: VolunteerRegistration[] = [
        {
          id: 'VOL-SAMPLE1',
          name: 'Ameer Syed',
          mobileNo: '+91 94443 12260',
          email: 'ameersyed1226@gmail.com',
          password: 'password123',
          aadhaarNo: '123456789012',
          volunteerId: 'VOL-FS-2024-001',
          address: '18, Gandhi Street, Cuddalore',
          termsAccepted: true,
          registeredAt: '2026-09-08T09:00:00',
          status: 'approved',
          isAvailable: true,
          totalDeliveries: 47,
          rating: 4.9,
          currentLat: 11.3920,
          currentLng: 79.6900
        },
        {
          id: 'VOL-SAMPLE2',
          name: 'Rahul Kumar',
          mobileNo: '+91 98765 43210',
          email: 'rahul.kumar@foodsave.org',
          password: 'password123',
          aadhaarNo: '987654321098',
          volunteerId: 'VOL-FS-2024-002',
          address: '7, Anna Nagar, Chennai',
          termsAccepted: true,
          registeredAt: '2026-09-09T11:30:00',
          status: 'approved',
          isAvailable: true,
          totalDeliveries: 32,
          rating: 4.7,
          currentLat: 11.3951,
          currentLng: 79.6942
        },
        {
          id: 'VOL-SAMPLE3',
          name: 'Sneha Rao',
          mobileNo: '+91 87654 32109',
          email: 'sneha.rao@foodsave.org',
          password: 'password123',
          aadhaarNo: '456789012345',
          volunteerId: 'VOL-FS-2024-003',
          address: '22, T-Nagar Main Road, Chennai',
          termsAccepted: true,
          registeredAt: '2026-09-11T08:15:00',
          status: 'approved',
          isAvailable: false,
          totalDeliveries: 28,
          rating: 4.8,
          currentLat: 11.4010,
          currentLng: 79.6980
        }
      ];
      localStorage.setItem('foodsave_volunteers', JSON.stringify(sampleVolunteers));
      setVolunteers(sampleVolunteers);
    } else {
      setVolunteers(loadedVolunteers);
    }
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleAssignVolunteer = (volunteerId: string) => {
    if (!assignmentModal) return;
    
    const volunteer = volunteers.find(v => v.id === volunteerId);
    if (!volunteer) return;

    // Update donation with volunteer assignment
    setDonations(prev => prev.map(d => {
      if (d.id === assignmentModal.donationId) {
        return {
          ...d,
          status: 'volunteer_assigned' as const,
          currentStep: 2,
          assignedVolunteerId: volunteerId,
          courier: {
            name: volunteer.name,
            avatar: volunteer.profilePhoto || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAAjcmwL6vVUI70nofmpYYolOqtlb3WBTtNoVHYUYAY4hwzZQIFRyIrfafgbI0M5NhiRDRgi0mjDPKj18rpXljUSkUIB6u4ooON0nBspuSZ5xnGoxb52-TZkcpZZr2eeHIvPlrlgJRxe5RUJaV0buR1skwjveTfskl7pFy2T9yCk7berdN5VTx7aiRKWjlpk94SQRKV1nBH-DCzR3FU5gDJY4VANi9vnDn07J1eebe0e1A-huK20qo',
            eta: '15 mins',
            verified: true,
            phone: volunteer.mobileNo
          }
        };
      }
      return d;
    }));

    setAssignmentModal(null);
    triggerToast(`✅ ${volunteer.name} assigned to "${assignmentModal.donationName}"`);
  };

  const handleApproveUser = (type: 'donor' | 'volunteer', id: string) => {
    if (type === 'donor') {
      const updated = donors.map(d => d.id === id ? { ...d, status: 'approved' as const } : d);
      setDonors(updated);
      localStorage.setItem('foodsave_donors', JSON.stringify(updated));
    } else {
      const updated = volunteers.map(v => v.id === id ? { ...v, status: 'approved' as const } : v);
      setVolunteers(updated);
      localStorage.setItem('foodsave_volunteers', JSON.stringify(updated));
    }
    triggerToast('User approved successfully!');
  };

  const handleRejectUser = (type: 'donor' | 'volunteer', id: string) => {
    if (type === 'donor') {
      const updated = donors.map(d => d.id === id ? { ...d, status: 'rejected' as const } : d);
      setDonors(updated);
      localStorage.setItem('foodsave_donors', JSON.stringify(updated));
    } else {
      const updated = volunteers.map(v => v.id === id ? { ...v, status: 'rejected' as const } : v);
      setVolunteers(updated);
      localStorage.setItem('foodsave_volunteers', JSON.stringify(updated));
    }
    triggerToast('User rejected');
  };

  const handleAdminLogout = () => {
    setIsLoggedIn(false);
    setUserRole('owner');
  };

  const filteredDonors = donors.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredVolunteers = volunteers.filter(v => 
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeDonations = donations.filter(d => d.status !== 'delivered' && d.status !== 'expired');
  const completedDonations = donations.filter(d => d.status === 'delivered');
  const totalMealsSaved = donations.reduce((sum, d) => d.status === 'delivered' ? sum + d.portions : sum, 0);

  // Admin sidebar tabs
  const tabs: { id: AdminTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
    { id: 'donors', label: 'Food Donors', icon: <Package size={16} />, badge: donors.length },
    { id: 'volunteers', label: 'Volunteers', icon: <Truck size={16} />, badge: volunteers.length },
    { id: 'donations', label: 'Donations', icon: <Users size={16} />, badge: activeDonations.length },
    { id: 'tracking', label: 'Live Tracking', icon: <Navigation size={16} /> },
  ];

  return (
    <div className="fixed inset-0 z-40 bg-slate-900 flex select-none">
      {/* Sidebar */}
      <div className="w-64 bg-slate-800 border-r border-slate-700/50 flex flex-col shrink-0">
        {/* Admin Header */}
        <div className="p-5 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white shadow-lg">
              <ShieldCheck size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-white">FoodSave Admin</span>
              <span className="text-[10px] text-slate-400 font-semibold">Control Panel</span>
            </div>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-3 flex flex-col gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                adminTab === tab.id
                  ? 'bg-emerald-500/20 text-emerald-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {tab.icon}
                <span>{tab.label}</span>
              </div>
              {tab.badge !== undefined && (
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                  adminTab === tab.id ? 'bg-emerald-500/30 text-emerald-300' : 'bg-slate-700 text-slate-400'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-slate-700/50">
          <button
            onClick={handleAdminLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-slate-900">
        {/* Top Bar */}
        <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-black text-white capitalize">{adminTab === 'tracking' ? 'Live GPS Tracking' : adminTab}</h1>
            <p className="text-[11px] text-slate-500">Manage all donors, volunteers, and donations</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 flex items-center gap-2 w-64">
              <Search size={14} className="text-slate-500" />
              <input
                type="text"
                placeholder="Search users, donations..."
                className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-[10px] font-bold">
                A
              </div>
              <span className="text-xs font-bold text-white">Admin</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* ========== DASHBOARD ========== */}
          {adminTab === 'dashboard' && (
            <div className="flex flex-col gap-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Total Donors', value: donors.length, icon: <Package size={20} />, color: 'from-emerald-500 to-teal-600', change: '+12%' },
                  { label: 'Total Volunteers', value: volunteers.length, icon: <Truck size={20} />, color: 'from-blue-500 to-indigo-600', change: '+8%' },
                  { label: 'Active Donations', value: activeDonations.length, icon: <Activity size={20} />, color: 'from-amber-500 to-orange-600', change: '+15%' },
                  { label: 'Meals Saved', value: totalMealsSaved || 1240, icon: <TrendingUp size={20} />, color: 'from-rose-500 to-pink-600', change: '+22%' },
                ].map((stat, i) => (
                  <div key={i} className="bg-slate-800 border border-slate-700/50 rounded-2xl p-5 flex flex-col gap-3 hover:border-slate-600 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg`}>
                        {stat.icon}
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        {stat.change}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-2xl font-black text-white">{stat.value.toLocaleString()}</span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{stat.label}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-2 gap-4">
                {/* Recent Donors */}
                <div className="bg-slate-800 border border-slate-700/50 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-white">Recent Donors</h3>
                    <button onClick={() => setAdminTab('donors')} className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 cursor-pointer">View All →</button>
                  </div>
                  <div className="flex flex-col gap-2">
                    {donors.slice(0, 4).map(donor => (
                      <div key={donor.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
                            {donor.name[0]}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-white">{donor.name}</span>
                            <span className="text-[10px] text-slate-500">{donor.email}</span>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          donor.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                          donor.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-rose-500/20 text-rose-400'
                        }`}>
                          {donor.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Volunteers */}
                <div className="bg-slate-800 border border-slate-700/50 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-white">Recent Volunteers</h3>
                    <button onClick={() => setAdminTab('volunteers')} className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 cursor-pointer">View All →</button>
                  </div>
                  <div className="flex flex-col gap-2">
                    {volunteers.slice(0, 4).map(vol => (
                      <div key={vol.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">
                            {vol.name[0]}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-white">{vol.name}</span>
                            <span className="text-[10px] text-slate-500">{vol.mobileNo}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-0.5 text-[10px] text-amber-400">
                            <Star size={10} className="fill-amber-400" />
                            {vol.rating}
                          </span>
                          <span className={`w-2 h-2 rounded-full ${vol.isAvailable ? 'bg-emerald-400' : 'bg-slate-500'}`}></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Active Donations Table */}
              <div className="bg-slate-800 border border-slate-700/50 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white">Recent Donation Submissions</h3>
                  <button onClick={() => setAdminTab('donations')} className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 cursor-pointer">View All →</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700/50">
                        <th className="text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider py-2 px-3">Food Item</th>
                        <th className="text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider py-2 px-3">Donor</th>
                        <th className="text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider py-2 px-3">Portions</th>
                        <th className="text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider py-2 px-3">Status</th>
                        <th className="text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider py-2 px-3">Volunteer</th>
                        <th className="text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider py-2 px-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {donations.slice(0, 5).map(donation => (
                        <tr key={donation.id} className="border-b border-slate-700/20 hover:bg-slate-700/20">
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <img src={donation.image} alt="" className="w-8 h-8 rounded-lg object-cover" />
                              <span className="text-xs font-bold text-white">{donation.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-xs text-slate-400">{donation.donorName || 'ABC Kitchen'}</td>
                          <td className="py-3 px-3 text-xs font-bold text-white">{donation.portions}</td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              donation.status === 'delivered' ? 'bg-emerald-500/20 text-emerald-400' :
                              donation.status === 'waiting_pickup' ? 'bg-amber-500/20 text-amber-400' :
                              donation.status === 'volunteer_assigned' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-slate-500/20 text-slate-400'
                            }`}>
                              {donation.status.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-xs text-slate-400">
                            {donation.courier ? donation.courier.name : '—'}
                          </td>
                          <td className="py-3 px-3">
                            {donation.status === 'waiting_pickup' && (
                              <button
                                onClick={() => setAssignmentModal({ donationId: donation.id, donationName: donation.name })}
                                className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-bold hover:bg-emerald-500/30 cursor-pointer transition-colors"
                              >
                                Assign
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========== DONORS LIST ========== */}
          {adminTab === 'donors' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white">All Registered Food Donors ({donors.length})</h2>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {filteredDonors.map(donor => (
                  <div key={donor.id} className="bg-slate-800 border border-slate-700/50 rounded-2xl p-5 hover:border-slate-600 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {donor.name[0]}
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{donor.name}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              donor.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                              donor.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                              'bg-rose-500/20 text-rose-400'
                            }`}>
                              {donor.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-[11px] text-slate-400">
                            <span className="flex items-center gap-1"><Mail size={10} />{donor.email}</span>
                            <span className="flex items-center gap-1"><Phone size={10} />{donor.mobileNo}</span>
                          </div>
                          <div className="flex items-center gap-4 text-[10px] text-slate-500 mt-1">
                            <span className="flex items-center gap-1"><FileText size={10} />FSSAI: {donor.fssaiLicense}</span>
                            <span className="flex items-center gap-1"><ShieldCheck size={10} />Aadhaar: ●●●● {donor.aadhaarNo.slice(-4)}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                            <MapPin size={10} />
                            <span>{donor.address}</span>
                          </div>
                          <span className="text-[9px] text-slate-600 mt-1 flex items-center gap-1">
                            <Clock size={9} />
                            Registered: {new Date(donor.registeredAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {donor.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApproveUser('donor', donor.id)}
                              className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 cursor-pointer transition-colors"
                              title="Approve"
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button
                              onClick={() => handleRejectUser('donor', donor.id)}
                              className="p-2 bg-rose-500/20 text-rose-400 rounded-lg hover:bg-rose-500/30 cursor-pointer transition-colors"
                              title="Reject"
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setSelectedDonor(donor)}
                          className="p-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 cursor-pointer transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========== VOLUNTEERS LIST ========== */}
          {adminTab === 'volunteers' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white">All Registered Volunteers ({volunteers.length})</h2>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {filteredVolunteers.map(vol => (
                  <div key={vol.id} className="bg-slate-800 border border-slate-700/50 rounded-2xl p-5 hover:border-slate-600 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {vol.name[0]}
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{vol.name}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              vol.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                              vol.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                              'bg-rose-500/20 text-rose-400'
                            }`}>
                              {vol.status}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              vol.isAvailable ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/20 text-slate-500'
                            }`}>
                              {vol.isAvailable ? '● Online' : '○ Offline'}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-[11px] text-slate-400">
                            <span className="flex items-center gap-1"><Mail size={10} />{vol.email}</span>
                            <span className="flex items-center gap-1"><Phone size={10} />{vol.mobileNo}</span>
                          </div>
                          <div className="flex items-center gap-4 text-[10px] text-slate-500 mt-1">
                            <span className="flex items-center gap-1"><FileText size={10} />Vol ID: {vol.volunteerId}</span>
                            <span className="flex items-center gap-1"><ShieldCheck size={10} />Aadhaar: ●●●● {vol.aadhaarNo.slice(-4)}</span>
                          </div>
                          <div className="flex items-center gap-4 text-[10px] text-slate-500 mt-1">
                            <span className="flex items-center gap-1"><Star size={10} className="text-amber-400 fill-amber-400" />Rating: {vol.rating}</span>
                            <span className="flex items-center gap-1"><Truck size={10} />Deliveries: {vol.totalDeliveries}</span>
                            <span className="flex items-center gap-1"><MapPin size={10} />{vol.address}</span>
                          </div>
                          <span className="text-[9px] text-slate-600 mt-1 flex items-center gap-1">
                            <Clock size={9} />
                            Registered: {new Date(vol.registeredAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {vol.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApproveUser('volunteer', vol.id)}
                              className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 cursor-pointer transition-colors"
                              title="Approve"
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button
                              onClick={() => handleRejectUser('volunteer', vol.id)}
                              className="p-2 bg-rose-500/20 text-rose-400 rounded-lg hover:bg-rose-500/30 cursor-pointer transition-colors"
                              title="Reject"
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setSelectedVolunteer(vol)}
                          className="p-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 cursor-pointer transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========== DONATIONS LIST ========== */}
          {adminTab === 'donations' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white">All Food Donations ({donations.length})</h2>
              </div>
              <div className="overflow-x-auto bg-slate-800 border border-slate-700/50 rounded-2xl">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700/50">
                      <th className="text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider py-3 px-4">ID</th>
                      <th className="text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider py-3 px-4">Food Item</th>
                      <th className="text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider py-3 px-4">Donor</th>
                      <th className="text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider py-3 px-4">Portions</th>
                      <th className="text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider py-3 px-4">Type</th>
                      <th className="text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider py-3 px-4">Location</th>
                      <th className="text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider py-3 px-4">Status</th>
                      <th className="text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider py-3 px-4">Volunteer</th>
                      <th className="text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider py-3 px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donations.map(d => (
                      <tr key={d.id} className="border-b border-slate-700/20 hover:bg-slate-700/20 transition-colors">
                        <td className="py-3 px-4 text-[10px] font-mono text-slate-500">{d.id}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <img src={d.image} alt="" className="w-8 h-8 rounded-lg object-cover" />
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-white">{d.name}</span>
                              <span className="text-[9px] text-slate-500">Best before: {d.bestBefore}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col">
                            <span className="text-xs text-white">{d.donorName || 'ABC Kitchen'}</span>
                            <span className="text-[9px] text-slate-500">{d.donorPhone}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-xs font-bold text-white">{d.portions}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            d.classification === 'veg' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                          }`}>
                            {d.classification === 'veg' ? '🟢 Veg' : '🔴 Non-Veg'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[10px] text-slate-400 max-w-[150px] truncate">{d.location}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            d.status === 'delivered' ? 'bg-emerald-500/20 text-emerald-400' :
                            d.status === 'waiting_pickup' ? 'bg-amber-500/20 text-amber-400' :
                            d.status === 'volunteer_assigned' ? 'bg-blue-500/20 text-blue-400' :
                            d.status === 'en_route_to_pickup' ? 'bg-purple-500/20 text-purple-400' :
                            d.status === 'food_collected' ? 'bg-cyan-500/20 text-cyan-400' :
                            'bg-slate-500/20 text-slate-400'
                          }`}>
                            {d.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-400">
                          {d.courier ? (
                            <div className="flex items-center gap-1.5">
                              <UserCheck size={12} className="text-emerald-400" />
                              <span>{d.courier.name}</span>
                            </div>
                          ) : '—'}
                        </td>
                        <td className="py-3 px-4">
                          {d.status === 'waiting_pickup' && (
                            <button
                              onClick={() => setAssignmentModal({ donationId: d.id, donationName: d.name })}
                              className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-bold hover:bg-emerald-500/30 cursor-pointer transition-colors flex items-center gap-1"
                            >
                              <Link2 size={10} />
                              <span>Assign Volunteer</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========== LIVE GPS TRACKING ========== */}
          {adminTab === 'tracking' && (
            <div className="flex flex-col gap-4">
              <div className="bg-slate-800 border border-slate-700/50 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-white mb-4">🗺️ Live Volunteer Positions</h3>
                
                {/* Map Placeholder with animated dots */}
                <div className="relative w-full h-96 bg-slate-700 rounded-2xl overflow-hidden border border-slate-600/50">
                  {/* Grid pattern overlay */}
                  <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                  }}></div>
                  
                  {/* Map label */}
                  <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-[10px] font-bold border border-slate-600/50">
                    📍 Chennai Metro Area — Real-Time GPS
                  </div>

                  {/* Volunteer markers */}
                  {volunteers.filter(v => v.isAvailable).map((vol, i) => {
                    const positions = [
                      { top: '30%', left: '40%' },
                      { top: '55%', left: '60%' },
                      { top: '40%', left: '25%' },
                    ];
                    const pos = positions[i % positions.length];
                    return (
                      <div key={vol.id} className="absolute" style={{ top: pos.top, left: pos.left }}>
                        {/* Pulse ring */}
                        <div className="absolute -inset-3 bg-emerald-400/20 rounded-full animate-ping"></div>
                        <div className="relative w-8 h-8 bg-emerald-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-[10px] font-bold text-white z-10">
                          {vol.name[0]}
                        </div>
                        <div className="absolute top-9 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white px-2 py-1 rounded-lg text-[9px] font-bold whitespace-nowrap shadow-lg border border-slate-600/50">
                          {vol.name} · 📍 Live
                        </div>
                      </div>
                    );
                  })}

                  {/* Donor location markers */}
                  {donations.filter(d => d.status !== 'delivered').map((don, i) => {
                    const positions = [
                      { top: '45%', left: '50%' },
                      { top: '25%', left: '70%' },
                      { top: '65%', left: '35%' },
                    ];
                    const pos = positions[i % positions.length];
                    return (
                      <div key={don.id} className="absolute" style={{ top: pos.top, left: pos.left }}>
                        <div className="w-6 h-6 bg-amber-500 rounded-lg border-2 border-white shadow-lg flex items-center justify-center text-[9px] z-10">
                          📦
                        </div>
                        <div className="absolute top-7 left-1/2 -translate-x-1/2 bg-slate-900/90 text-amber-400 px-2 py-0.5 rounded text-[8px] font-bold whitespace-nowrap">
                          {don.name}
                        </div>
                      </div>
                    );
                  })}

                  {/* Route lines (simulated) */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                    <line x1="44%" y1="34%" x2="52%" y2="48%" stroke="rgba(52,211,153,0.4)" strokeWidth="2" strokeDasharray="6,4">
                      <animate attributeName="stroke-dashoffset" from="0" to="-20" dur="1s" repeatCount="indefinite" />
                    </line>
                    <line x1="63%" y1="58%" x2="72%" y2="28%" stroke="rgba(52,211,153,0.4)" strokeWidth="2" strokeDasharray="6,4">
                      <animate attributeName="stroke-dashoffset" from="0" to="-20" dur="1.5s" repeatCount="indefinite" />
                    </line>
                  </svg>
                </div>
              </div>

              {/* Active Deliveries List */}
              <div className="bg-slate-800 border border-slate-700/50 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-white mb-4">Active Deliveries in Progress</h3>
                <div className="flex flex-col gap-2">
                  {donations.filter(d => d.status !== 'delivered' && d.status !== 'expired').map(d => (
                    <div key={d.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl">
                      <div className="flex items-center gap-3">
                        <img src={d.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-white">{d.name}</span>
                          <span className="text-[10px] text-slate-500">
                            {d.donorName} → {d.courier ? d.courier.name : 'Unassigned'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          d.status === 'en_route_to_pickup' ? 'bg-purple-500/20 text-purple-400' :
                          d.status === 'volunteer_assigned' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-amber-500/20 text-amber-400'
                        }`}>
                          {d.status.replace(/_/g, ' ')}
                        </span>
                        {d.courier && (
                          <span className="text-[10px] text-emerald-400 font-bold">ETA: {d.courier.eta}</span>
                        )}
                      </div>
                    </div>
                  ))}
                  {donations.filter(d => d.status !== 'delivered' && d.status !== 'expired').length === 0 && (
                    <div className="text-center py-8 text-slate-500 text-xs">No active deliveries right now</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========== VOLUNTEER ASSIGNMENT MODAL ========== */}
      {assignmentModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-700/50">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Assign Volunteer</h3>
                <p className="text-[10px] text-emerald-100">For: "{assignmentModal.donationName}"</p>
              </div>
              <button
                className="text-white/80 hover:text-white bg-white/10 p-1.5 rounded-full transition-colors cursor-pointer"
                onClick={() => setAssignmentModal(null)}
              >
                <X size={15} />
              </button>
            </div>
            
            <div className="p-5 flex flex-col gap-3 max-h-[350px] overflow-y-auto">
              {volunteers.filter(v => v.isAvailable && v.status === 'approved').map(vol => (
                <button
                  key={vol.id}
                  onClick={() => handleAssignVolunteer(vol.id)}
                  className="w-full flex items-center justify-between p-3.5 bg-slate-700/50 rounded-xl border border-slate-600/30 hover:border-emerald-500/50 hover:bg-slate-700 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                      {vol.name[0]}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold text-white">{vol.name}</span>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <span className="flex items-center gap-0.5">
                          <Star size={9} className="text-amber-400 fill-amber-400" />{vol.rating}
                        </span>
                        <span>{vol.totalDeliveries} deliveries</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-400">
                    <span className="text-[10px] font-bold">Assign</span>
                    <ArrowRight size={12} />
                  </div>
                </button>
              ))}
              {volunteers.filter(v => v.isAvailable && v.status === 'approved').length === 0 && (
                <div className="text-center py-6 text-slate-500 text-xs">No available volunteers at the moment</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========== DONOR DETAIL MODAL ========== */}
      {selectedDonor && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-700/50">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Donor Details</h3>
                <p className="text-[10px] text-emerald-100">{selectedDonor.name}</p>
              </div>
              <button
                className="text-white/80 hover:text-white bg-white/10 p-1.5 rounded-full transition-colors cursor-pointer"
                onClick={() => setSelectedDonor(null)}
              >
                <X size={15} />
              </button>
            </div>
            <div className="p-5 flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-bold text-slate-500 uppercase">Name</span>
                  <span className="text-xs font-bold text-white">{selectedDonor.name}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-bold text-slate-500 uppercase">Email</span>
                  <span className="text-xs text-slate-300">{selectedDonor.email}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-bold text-slate-500 uppercase">Mobile</span>
                  <span className="text-xs text-slate-300">{selectedDonor.mobileNo}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-bold text-slate-500 uppercase">Aadhaar</span>
                  <span className="text-xs font-mono text-slate-300">●●●● ●●●● {selectedDonor.aadhaarNo.slice(-4)}</span>
                </div>
                <div className="flex flex-col gap-0.5 col-span-2">
                  <span className="text-[9px] font-bold text-slate-500 uppercase">FSSAI License</span>
                  <span className="text-xs font-mono text-emerald-400">{selectedDonor.fssaiLicense}</span>
                </div>
                <div className="flex flex-col gap-0.5 col-span-2">
                  <span className="text-[9px] font-bold text-slate-500 uppercase">Address</span>
                  <span className="text-xs text-slate-300">{selectedDonor.address}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedDonor(null)}
                className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== VOLUNTEER DETAIL MODAL ========== */}
      {selectedVolunteer && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-700/50">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Volunteer Details</h3>
                <p className="text-[10px] text-blue-100">{selectedVolunteer.name}</p>
              </div>
              <button
                className="text-white/80 hover:text-white bg-white/10 p-1.5 rounded-full transition-colors cursor-pointer"
                onClick={() => setSelectedVolunteer(null)}
              >
                <X size={15} />
              </button>
            </div>
            <div className="p-5 flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-bold text-slate-500 uppercase">Name</span>
                  <span className="text-xs font-bold text-white">{selectedVolunteer.name}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-bold text-slate-500 uppercase">Email</span>
                  <span className="text-xs text-slate-300">{selectedVolunteer.email}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-bold text-slate-500 uppercase">Mobile</span>
                  <span className="text-xs text-slate-300">{selectedVolunteer.mobileNo}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-bold text-slate-500 uppercase">Aadhaar</span>
                  <span className="text-xs font-mono text-slate-300">●●●● ●●●● {selectedVolunteer.aadhaarNo.slice(-4)}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-bold text-slate-500 uppercase">Volunteer ID</span>
                  <span className="text-xs font-mono text-blue-400">{selectedVolunteer.volunteerId}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-bold text-slate-500 uppercase">Rating</span>
                  <span className="text-xs text-amber-400 flex items-center gap-1">
                    <Star size={10} className="fill-amber-400" />{selectedVolunteer.rating} / 5.0
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-bold text-slate-500 uppercase">Total Deliveries</span>
                  <span className="text-xs font-bold text-white">{selectedVolunteer.totalDeliveries}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-bold text-slate-500 uppercase">Status</span>
                  <span className={`text-xs font-bold ${selectedVolunteer.isAvailable ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {selectedVolunteer.isAvailable ? '● Available' : '○ Offline'}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5 col-span-2">
                  <span className="text-[9px] font-bold text-slate-500 uppercase">Address</span>
                  <span className="text-xs text-slate-300">{selectedVolunteer.address}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedVolunteer(null)}
                className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {showToast && (
        <div className="fixed top-6 right-6 z-[60] transition-all duration-300">
          <div className="bg-emerald-500 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold">
            <CheckCircle size={16} />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};
