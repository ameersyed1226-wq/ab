import { useState, useEffect } from 'react';
import { 
  initialUsers, 
  initialDonations, 
  initialReports, 
  initialNotifications, 
  initialStats 
} from './data';
import { 
  User, 
  Donation, 
  ComplaintReport, 
  NotificationItem, 
  UserStatus, 
  DonationStatus, 
  ReportStatus 
} from './types';
import { UserViews } from './components/UserViews';
import { DonationViews } from './components/DonationViews';
import { ReportViews } from './components/ReportViews';
import { DonationActivityChart, FoodTypeDistributionChart } from './components/AnalyticsCharts';
import { 
  Home, 
  Users, 
  Package, 
  BarChart3, 
  UserCircle2, 
  Bell, 
  LogOut, 
  Lock, 
  Mail, 
  Phone, 
  Shield, 
  HelpCircle, 
  ChevronRight, 
  Languages, 
  EyeOff, 
  Sparkles, 
  CheckCircle, 
  AlertCircle,
  Clock,
  ExternalLink,
  Menu,
  X
} from 'lucide-react';
import { ConfirmationModal } from './components/ModalSheets';
import { AdminLiveMap } from './components/AdminLiveMap';

const REPLATE_LOGO_URL = 'https://ik.imagekit.io/72dmudtmj/WhatsApp%20Image%202026-09-19%20at%2010.23.50%20PM.jpeg?updatedAt=1789878844929';

export default function App() {
  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('admin@foodsave.org');
  const [password, setPassword] = useState('admin123');
  const [loginError, setLoginError] = useState('');

  // Primary Platform Data States (interactive overrides)
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [donations, setDonations] = useState<Donation[]>(initialDonations);
  const [reports, setReports] = useState<ComplaintReport[]>(initialReports);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [stats, setStats] = useState(initialStats);
  const [liveTracking, setLiveTracking] = useState<Record<string, any>>({});
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(true);

  // Sync with shared API backend at http://localhost:5000
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, donationsRes, statsRes, notifsRes, trackingRes] = await Promise.all([
          fetch('http://localhost:5000/api/users').then(r => r.ok ? r.json() : null),
          fetch('http://localhost:5000/api/donations').then(r => r.ok ? r.json() : null),
          fetch('http://localhost:5000/api/stats').then(r => r.ok ? r.json() : null),
          fetch('http://localhost:5000/api/notifications').then(r => r.ok ? r.json() : null),
          fetch('http://localhost:5000/api/tracking').then(r => r.ok ? r.json() : null)
        ]);

        if (usersRes && Array.isArray(usersRes)) {
          setUsers(usersRes);
          setIsBackendConnected(true);
        }
        if (donationsRes && Array.isArray(donationsRes)) {
          setDonations(donationsRes);
        }
        if (statsRes && statsRes.totalUsers !== undefined) {
          setStats(statsRes);
        }
        if (notifsRes && Array.isArray(notifsRes) && notifsRes.length > 0) {
          setNotifications(notifsRes);
        }
        if (trackingRes) {
          setLiveTracking(trackingRes);
        }
      } catch (err) {
        // Fallback to local states
        setIsBackendConnected(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  // Navigation: 'dashboard' | 'users' | 'donations' | 'reports' | 'profile'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'donations' | 'reports' | 'profile'>('dashboard');
  const [showNotificationsPage, setShowNotificationsPage] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Toast State for actions feedback
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'danger' } | null>(null);

  // Profile-specific settings state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<'English' | 'Spanish' | 'Tamil'>('English');

  // Interactive profile edits modal
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Trigger transient toasts
  const triggerToast = (message: string, type: 'success' | 'info' | 'danger' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // 1. Manage User Status (Block/Suspend)
  const handleUpdateUserStatus = (userId: string, newStatus: UserStatus) => {
    // Sync with backend API
    fetch(`http://localhost:5000/api/users/${userId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    }).catch(err => console.log('API sync error:', err));

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          triggerToast(`${u.name} status updated to ${newStatus}`, newStatus === 'Blocked' ? 'danger' : 'info');
          
          // Log automated system notification
          const newNotif: NotificationItem = {
            id: `sys-notif-${Date.now()}`,
            type: newStatus === 'Blocked' ? 'danger' : 'warning',
            title: `User ${newStatus}`,
            description: `Admin flagged and updated ${u.name} status to ${newStatus}.`,
            time: 'Just now',
            isRead: false,
            section: 'Today',
          };
          setNotifications((notifs) => [newNotif, ...notifs]);

          return { ...u, status: newStatus };
        }
        return u;
      })
    );
  };

  // 2. Approve/Verify pending users (NGOs & Volunteers)
  const handleVerifyUser = (userId: string) => {
    // Sync with backend API
    fetch(`http://localhost:5000/api/users/${userId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Verified' })
    }).catch(err => console.log('API sync error:', err));

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          triggerToast(`${u.name} successfully verified!`, 'success');
          
          // Log verification notification
          const newNotif: NotificationItem = {
            id: `sys-notif-${Date.now()}`,
            type: 'success',
            title: 'Partner Verified',
            description: `${u.name} is now a registered RePlate Verified partner.`,
            time: 'Just now',
            isRead: false,
            section: 'Today',
          };
          setNotifications((notifs) => [newNotif, ...notifs]);

          // Update general user stats
          setStats((curr) => ({
            ...curr,
            totalUsers: curr.totalUsers + 1,
            foodDonors: u.role === 'Donor' ? curr.foodDonors + 1 : curr.foodDonors,
            volunteers: u.role === 'Volunteer' ? curr.volunteers + 1 : curr.volunteers,
          }));

          return { ...u, status: 'Verified' };
        }
        return u;
      })
    );
  };

  // 3. Monitor and update food donation status
  const handleUpdateDonationStatus = (donationId: string, newStatus: DonationStatus) => {
    // Sync with backend API
    fetch(`http://localhost:5000/api/donations/${donationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    }).catch(err => console.log('API sync error:', err));

    setDonations((prev) =>
      prev.map((d) => {
        if (d.id === donationId) {
          triggerToast(`Donation set as ${newStatus}`, newStatus === 'Expired' ? 'danger' : 'info');

          // Log transaction timeline
          const updatedTimeline = { ...d.timeline };
          if (newStatus === 'Expired') updatedTimeline.expired = 'Just now';
          if (newStatus === 'Cancelled') updatedTimeline.cancelled = 'Just now';
          if (newStatus === 'Delivered') updatedTimeline.delivered = 'Just now';

          // Update platform overall rescue counter if appropriate
          if (newStatus === 'Expired') {
            setStats((curr) => ({
              ...curr,
              expiredDonations: curr.expiredDonations + 1,
              activeDonations: Math.max(0, curr.activeDonations - 1),
            }));
          } else if (newStatus === 'Cancelled') {
            setStats((curr) => ({
              ...curr,
              activeDonations: Math.max(0, curr.activeDonations - 1),
            }));
          }

          return {
            ...d,
            status: newStatus,
            timeline: updatedTimeline,
          };
        }
        return d;
      })
    );
  };

  // 4. Update complaint report tickets
  const handleUpdateReportStatus = (reportId: string, newStatus: ReportStatus) => {
    setReports((prev) =>
      prev.map((r) => {
        if (r.id === reportId) {
          triggerToast(`Report status: ${newStatus}`, 'success');
          return { ...r, status: newStatus };
        }
        return r;
      })
    );
  };

  // 5. Handle report exports
  const handleExportComplete = (format: string) => {
    triggerToast(`Consolidated report downloaded successfully as ${format}!`, 'success');
  };

  // 6. Handle Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'admin@foodsave.org' && password === 'admin123') {
      setIsLoggedIn(true);
      setLoginError('');
      triggerToast('Welcome Back, Admin!', 'success');
    } else if (!email || !password) {
      setLoginError('Email and password cannot be empty.');
    } else {
      setLoginError('Invalid credentials. Use the automated credentials below.');
    }
  };

  // Total unread notifications count
  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length;

  // Toggle single notification status
  const toggleNotifRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n))
    );
  };

  // Mark all as read helper
  const markAllNotifsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    triggerToast('All notifications marked as read', 'info');
  };

  return (
    <div className="min-h-screen w-full bg-[#F8FAF9] font-sans selection:bg-[#DCFCE7] selection:text-[#166534] text-[#17201A]">
      
      {/* Dynamic Toast Feedback Notification */}
      {toast && (
        <div className="fixed top-6 right-6 max-w-sm w-full px-4 z-50 animate-bounce">
          <div className={`p-3.5 rounded-2xl shadow-xl flex items-center space-x-2 border text-xs font-semibold ${
            toast.type === 'success' 
              ? 'bg-[#DCFCE7] text-[#166534] border-green-200' 
              : toast.type === 'danger'
              ? 'bg-red-50 text-red-600 border-red-200'
              : 'bg-blue-50 text-blue-600 border-blue-200'
          }`}>
            {toast.type === 'success' && <CheckCircle className="w-4 h-4 shrink-0" />}
            {(toast.type === 'danger' || toast.type === 'info') && <AlertCircle className="w-4 h-4 shrink-0" />}
            <span className="flex-1 leading-snug">{toast.message}</span>
          </div>
        </div>
      )}

      {/* LOGIN PAGE - Full Website Layout */}
      {!isLoggedIn ? (
        <div className="min-h-screen w-full bg-gradient-to-br from-[#0c2e17] via-[#14532d] to-[#17201a] flex items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 border border-emerald-900/20">
            {/* Left Column: Brand Hero */}
            <div className="md:col-span-5 bg-gradient-to-br from-[#166534] to-[#14532d] p-8 text-white flex flex-col justify-between relative overflow-hidden">
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg border-2 border-white/20 mb-6 bg-white shrink-0">
                  <img src={REPLATE_LOGO_URL} alt="RePlate Logo" className="w-full h-full object-cover" />
                </div>
                <h1 className="text-2xl font-black tracking-tight">RePlate</h1>
                <p className="text-emerald-200 text-xs font-semibold tracking-wider uppercase mt-1">“Save Food. Share Hope.”</p>
                <div className="h-0.5 w-12 bg-emerald-400/40 my-4" />
                <h2 className="text-base font-bold text-white">Central Admin Management Portal</h2>
                <p className="text-emerald-100/80 text-xs mt-2 leading-relaxed">
                  Real-time live monitoring of commercial food donors, GPS courier volunteers, and certified NGO distribution centers.
                </p>
              </div>

              {/* Stats highlights */}
              <div className="relative z-10 pt-6 mt-6 border-t border-white/10 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-emerald-200 font-medium">Meals Rescued</span>
                  <span className="font-extrabold text-white">58,420+</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-emerald-200 font-medium">Active Volunteers</span>
                  <span className="font-extrabold text-white">768 Couriers</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-emerald-200 font-medium">Live Delivery Rate</span>
                  <span className="font-extrabold text-[#4ade80]">94.4%</span>
                </div>
              </div>

              {/* Background watermark */}
              <div className="absolute -bottom-10 -right-10 opacity-10 pointer-events-none">
                <svg viewBox="0 0 100 100" className="w-64 h-64 text-white" fill="currentColor">
                  <circle cx="50" cy="50" r="42" />
                </svg>
              </div>
            </div>

            {/* Right Column: Form */}
            <div className="md:col-span-7 p-8 md:p-10 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-extrabold text-[#17201A]">Admin Login</h3>
                    <p className="text-xs text-[#6B7280] mt-0.5">Enter your super administrator credentials</p>
                  </div>
                  <span className="text-[10px] font-bold text-[#166534] bg-[#DCFCE7] px-2.5 py-1 rounded-full">
                    SSL 256-bit Secure
                  </span>
                </div>

                {loginError && (
                  <div className="p-3 bg-red-50 border border-red-100 text-xs font-semibold text-red-600 rounded-xl flex items-center space-x-2 mb-4">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[#17201A] uppercase tracking-wider block">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="login-email-input"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@foodsave.org"
                        className="w-full bg-[#F8FAF9] pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs text-[#17201A] focus:outline-hidden focus:ring-2 focus:ring-[#16A34A] focus:border-[#16A34A] focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-bold text-[#17201A] uppercase tracking-wider">Password</label>
                      <button
                        type="button"
                        onClick={() => triggerToast('Password recovery token dispatched to standard mail server.', 'info')}
                        className="text-[11px] font-bold text-[#16A34A] hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="login-password-input"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#F8FAF9] pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs text-[#17201A] focus:outline-hidden focus:ring-2 focus:ring-[#16A34A] focus:border-[#16A34A] focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <button
                    id="login-btn"
                    type="submit"
                    className="w-full py-3 bg-[#16A34A] hover:bg-[#166534] text-white text-xs font-bold rounded-xl shadow-md transition-all mt-3 active:scale-98 cursor-pointer flex items-center justify-center space-x-2"
                  >
                    <span>Sign In to Admin Console</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </form>

                {/* Developer Helper Box for 1-click evaluation */}
                <div className="bg-[#DCFCE7]/30 border border-[#DCFCE7] rounded-2xl p-4 text-xs mt-6 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-[#166534] block">💡 Demo Admin Credentials</span>
                    <span className="text-[#6B7280] text-[11px]">admin@foodsave.org / admin123</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('admin@foodsave.org');
                      setPassword('admin123');
                      triggerToast('Credentials auto-filled! Click Sign In to continue.', 'success');
                    }}
                    className="px-3 py-1.5 bg-[#16A34A] hover:bg-[#166534] text-white text-[11px] font-bold rounded-lg transition-all cursor-pointer shrink-0"
                  >
                    Auto-fill
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-gray-400 text-[11px] pt-6 border-t border-gray-100 mt-6">
                <span>RePlate Admin v2.4.0</span>
                <span>Protected by AES-256 encryption</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* AUTHENTICATED ADMIN PLATFORM - FULL WEBSITE DESKTOP WORKSPACE */
        <div className="flex min-h-screen w-full bg-[#F8FAF9]">
          
          {/* DESKTOP SIDEBAR NAVIGATION */}
          <aside className="w-64 bg-white border-r border-gray-100 flex flex-col justify-between sticky top-0 h-screen z-40 shrink-0 hidden md:flex">
            <div>
              {/* Brand Header */}
              <div className="p-5 border-b border-gray-100 flex items-center space-x-3">
                <div className="w-11 h-11 rounded-xl overflow-hidden shadow-xs border border-green-200 shrink-0 bg-white">
                  <img src={REPLATE_LOGO_URL} alt="RePlate Logo" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h1 className="text-sm font-black text-[#17201A] tracking-tight leading-tight">RePlate Admin</h1>
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live API (5000)
                  </span>
                </div>
              </div>

              {/* Navigation Menu */}
              <nav className="p-3 space-y-1">
                <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Platform Dashboard
                </div>

                {/* Tab 1: Dashboard */}
                <button
                  id="tab-dashboard"
                  onClick={() => {
                    setActiveTab('dashboard');
                    setShowNotificationsPage(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'dashboard' && !showNotificationsPage
                      ? 'bg-[#DCFCE7] text-[#166534] shadow-xs'
                      : 'text-[#6B7280] hover:bg-gray-50 hover:text-[#17201A]'
                  }`}
                >
                  <Home className={`w-4 h-4 shrink-0 ${activeTab === 'dashboard' && !showNotificationsPage ? 'text-[#166534]' : 'text-gray-400'}`} />
                  <span className="flex-1 text-left">Dashboard</span>
                </button>

                {/* Tab 2: User Accounts */}
                <button
                  id="tab-users"
                  onClick={() => {
                    setActiveTab('users');
                    setShowNotificationsPage(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'users' && !showNotificationsPage
                      ? 'bg-[#DCFCE7] text-[#166534] shadow-xs'
                      : 'text-[#6B7280] hover:bg-gray-50 hover:text-[#17201A]'
                  }`}
                >
                  <Users className={`w-4 h-4 shrink-0 ${activeTab === 'users' && !showNotificationsPage ? 'text-[#166534]' : 'text-gray-400'}`} />
                  <span className="flex-1 text-left">User Accounts</span>
                  {users.filter(u => u.status === 'Pending').length > 0 && (
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                      {users.filter(u => u.status === 'Pending').length}
                    </span>
                  )}
                </button>

                {/* Tab 3: Donations */}
                <button
                  id="tab-donations"
                  onClick={() => {
                    setActiveTab('donations');
                    setShowNotificationsPage(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'donations' && !showNotificationsPage
                      ? 'bg-[#DCFCE7] text-[#166534] shadow-xs'
                      : 'text-[#6B7280] hover:bg-gray-50 hover:text-[#17201A]'
                  }`}
                >
                  <Package className={`w-4 h-4 shrink-0 ${activeTab === 'donations' && !showNotificationsPage ? 'text-[#166534]' : 'text-gray-400'}`} />
                  <span className="flex-1 text-left">Donations</span>
                  <span className="text-[10px] text-gray-400 font-semibold">{donations.length}</span>
                </button>

                {/* Tab 4: Reports & Analytics */}
                <button
                  id="tab-reports"
                  onClick={() => {
                    setActiveTab('reports');
                    setShowNotificationsPage(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'reports' && !showNotificationsPage
                      ? 'bg-[#DCFCE7] text-[#166534] shadow-xs'
                      : 'text-[#6B7280] hover:bg-gray-50 hover:text-[#17201A]'
                  }`}
                >
                  <BarChart3 className={`w-4 h-4 shrink-0 ${activeTab === 'reports' && !showNotificationsPage ? 'text-[#166534]' : 'text-gray-400'}`} />
                  <span className="flex-1 text-left">Reports & Issues</span>
                  {reports.filter(r => r.status === 'Pending').length > 0 && (
                    <span className="bg-red-100 text-red-700 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full animate-pulse">
                      {reports.filter(r => r.status === 'Pending').length}
                    </span>
                  )}
                </button>

                {/* Tab 5: Profile & Settings */}
                <button
                  id="tab-profile"
                  onClick={() => {
                    setActiveTab('profile');
                    setShowNotificationsPage(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'profile' && !showNotificationsPage
                      ? 'bg-[#DCFCE7] text-[#166534] shadow-xs'
                      : 'text-[#6B7280] hover:bg-gray-50 hover:text-[#17201A]'
                  }`}
                >
                  <UserCircle2 className={`w-4 h-4 shrink-0 ${activeTab === 'profile' && !showNotificationsPage ? 'text-[#166534]' : 'text-gray-400'}`} />
                  <span className="flex-1 text-left">Admin Profile</span>
                </button>
              </nav>
            </div>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-gray-100 space-y-3">
              {/* Link to Donor/Volunteer App */}
              <a
                href="http://localhost:3001"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-[#166534] rounded-xl text-xs font-bold transition-all border border-emerald-200"
              >
                <span className="flex items-center space-x-2">
                  <span>📱 User App</span>
                  <span className="text-[10px] font-medium text-emerald-600">(3001)</span>
                </span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              {/* Admin Profile pill */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center space-x-2 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#DCFCE7] flex items-center justify-center text-sm font-bold shrink-0">
                    👑
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-[#17201A] block truncate">Super Admin</span>
                    <span className="text-[10px] text-gray-400 block truncate">admin@foodsave.org</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsLogoutModalOpen(true)}
                  className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-white transition-all cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </aside>

          {/* MOBILE SLIDE-OVER DRAWER */}
          {isMobileMenuOpen && (
            <div className="fixed inset-0 z-50 md:hidden flex">
              <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setIsMobileMenuOpen(false)} />
              <div className="relative w-64 bg-white h-full flex flex-col justify-between p-4 shadow-2xl z-10">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-green-200 bg-white">
                        <img src={REPLATE_LOGO_URL} alt="RePlate Logo" className="w-full h-full object-cover" />
                      </div>
                      <span className="font-extrabold text-sm text-[#17201A]">RePlate Admin</span>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 cursor-pointer">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <nav className="space-y-1">
                    {[
                      { id: 'dashboard', label: 'Dashboard', icon: Home },
                      { id: 'users', label: 'User Accounts', icon: Users },
                      { id: 'donations', label: 'Donations', icon: Package },
                      { id: 'reports', label: 'Reports & Issues', icon: BarChart3 },
                      { id: 'profile', label: 'Admin Profile', icon: UserCircle2 },
                    ].map(item => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveTab(item.id as any);
                            setShowNotificationsPage(false);
                            setIsMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            activeTab === item.id ? 'bg-[#DCFCE7] text-[#166534]' : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </nav>
                </div>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsLogoutModalOpen(true);
                  }}
                  className="w-full py-2.5 border border-red-200 text-red-600 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}

          {/* MAIN DESKTOP CONTENT AREA */}
          <div className="flex-1 flex flex-col min-w-0 min-h-screen">
            
            {/* TOP HEADER BAR */}
            <header className="bg-white px-6 py-3.5 border-b border-gray-100 flex justify-between items-center sticky top-0 z-30 shrink-0">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-600 md:hidden hover:bg-gray-50 cursor-pointer"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-[#6B7280]">RePlate Admin</span>
                    <span className="text-xs text-gray-300">/</span>
                    <span className="text-xs font-bold text-[#16A34A] capitalize">
                      {showNotificationsPage ? 'System Notifications' : activeTab === 'users' ? 'User Accounts' : activeTab}
                    </span>
                  </div>
                  <h2 className="text-sm font-black text-[#17201A] tracking-tight">
                    {showNotificationsPage ? 'Notifications Center' :
                     activeTab === 'dashboard' ? 'Platform Operations Dashboard' :
                     activeTab === 'users' ? 'User & Commercial Accounts' :
                     activeTab === 'donations' ? 'Live Donations & Distribution' :
                     activeTab === 'reports' ? 'Analytics & Compliance Reports' : 'Admin Account & System Parameters'}
                  </h2>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {/* Live backend connection indicator */}
                <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-emerald-50 text-[#166534] border border-emerald-200 rounded-xl text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Live Sync (Port 5000)</span>
                </div>

                {/* Direct link to user app */}
                <a
                  href="http://localhost:3001"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-white hover:bg-gray-50 text-[#17201A] border border-gray-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-2xs"
                >
                  <span>Open App (3001)</span>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                </a>

                {/* Notification Bell */}
                <button
                  id="header-notification-bell"
                  onClick={() => setShowNotificationsPage(!showNotificationsPage)}
                  className={`p-2 rounded-xl border transition-all relative cursor-pointer ${
                    showNotificationsPage ? 'bg-[#DCFCE7] border-[#DCFCE7] text-[#166534]' : 'bg-white border-gray-200 text-[#17201A] hover:bg-gray-50'
                  }`}
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadNotifsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                      {unreadNotifsCount}
                    </span>
                  )}
                </button>
              </div>
            </header>

            {/* MAIN SCROLLABLE CONTENT BODY */}
            <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
              {showNotificationsPage ? (
                /* NOTIFICATIONS VIEW */
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
                    <div>
                      <h3 className="text-base font-bold text-[#17201A]">System Notifications</h3>
                      <p className="text-xs text-[#6B7280]">Platform alerts, registration events, and volunteer dispatches.</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {unreadNotifsCount > 0 && (
                        <button
                          onClick={markAllNotifsRead}
                          className="px-3 py-1.5 bg-emerald-50 text-[#16A34A] text-xs font-bold rounded-xl hover:bg-emerald-100 transition-all cursor-pointer"
                        >
                          Mark all as read
                        </button>
                      )}
                      <button
                        onClick={() => setShowNotificationsPage(false)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                      >
                        Back to Dashboard
                      </button>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6 shadow-xs">
                    {/* Today */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Today</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {notifications.filter(n => n.section === 'Today').map((n) => (
                          <div
                            key={n.id}
                            onClick={() => toggleNotifRead(n.id)}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start space-x-3.5 ${
                              n.isRead ? 'bg-[#F8FAF9] border-gray-100 opacity-75' : 'bg-[#DCFCE7]/15 border-[#DCFCE7]'
                            }`}
                          >
                            <div className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1.5 ${
                              n.isRead ? 'bg-transparent border border-gray-300' : 'bg-[#16A34A]'
                            }`} />
                            <div className="min-w-0 flex-1 text-xs">
                              <h5 className="font-bold text-[#17201A]">{n.title}</h5>
                              <p className="text-[#6B7280] mt-1 leading-relaxed">{n.description}</p>
                              <span className="text-[10px] text-gray-400 mt-2 block font-medium">{n.time}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Earlier */}
                    <div className="space-y-3 pt-4 border-t border-gray-100">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Earlier</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {notifications.filter(n => n.section === 'Earlier').map((n) => (
                          <div
                            key={n.id}
                            onClick={() => toggleNotifRead(n.id)}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start space-x-3.5 ${
                              n.isRead ? 'bg-[#F8FAF9] border-gray-100 opacity-75' : 'bg-[#DCFCE7]/15 border-[#DCFCE7]'
                            }`}
                          >
                            <div className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1.5 ${
                              n.isRead ? 'bg-transparent border border-gray-300' : 'bg-[#16A34A]'
                            }`} />
                            <div className="min-w-0 flex-1 text-xs">
                              <h5 className="font-bold text-[#17201A]">{n.title}</h5>
                              <p className="text-[#6B7280] mt-1 leading-relaxed">{n.description}</p>
                              <span className="text-[10px] text-gray-400 mt-2 block font-medium">{n.time}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* TAB-BASED SCREENS */
                <>
                  {/* TAB 1: DASHBOARD OVERVIEW */}
                  {activeTab === 'dashboard' && (
                    <div className="space-y-6">
                      
                      {/* Welcome Banner */}
                      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h2 className="text-xl font-extrabold text-[#17201A]">Good Morning, Super Admin 👋</h2>
                            <span className="text-[11px] font-bold text-[#166534] bg-[#DCFCE7] px-2.5 py-0.5 rounded-full">
                              Node Online
                            </span>
                          </div>
                          <p className="text-xs text-[#6B7280] mt-1">Here is your live RePlate platform operations and dispatch overview for today.</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-[#166534] bg-[#DCFCE7] px-3 py-1.5 rounded-xl">
                            📅 {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </div>

                      {/* 6 KEY PLATFORM METRICS - DESKTOP 6-COLUMN GRID */}
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
                        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs cursor-pointer hover:border-green-300 transition-all hover:shadow-sm" onClick={() => setActiveTab('users')}>
                          <span className="text-[#6B7280] text-[10px] font-semibold block uppercase tracking-wider">Total Users</span>
                          <span className="text-2xl font-black text-[#17201A] block mt-1">{stats.totalUsers}</span>
                          <span className="text-[9px] text-[#6B7280] block mt-1.5">Donors, NGOs & Drivers</span>
                        </div>

                        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs cursor-pointer hover:border-green-300 transition-all hover:shadow-sm" onClick={() => setActiveTab('users')}>
                          <span className="text-[#6B7280] text-[10px] font-semibold block uppercase tracking-wider">Food Donors</span>
                          <span className="text-2xl font-black text-[#17201A] block mt-1">{stats.foodDonors}</span>
                          <span className="text-[9px] text-[#16A34A] font-bold block mt-1.5">🟢 12 online now</span>
                        </div>

                        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs cursor-pointer hover:border-green-300 transition-all hover:shadow-sm" onClick={() => setActiveTab('users')}>
                          <span className="text-[#6B7280] text-[10px] font-semibold block uppercase tracking-wider">Active Volunteers</span>
                          <span className="text-2xl font-black text-[#17201A] block mt-1">{stats.volunteers}</span>
                          <span className="text-[9px] text-blue-600 font-bold block mt-1.5">45 couriers on duty</span>
                        </div>

                        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs cursor-pointer hover:border-green-300 transition-all hover:shadow-sm" onClick={() => setActiveTab('donations')}>
                          <span className="text-[#6B7280] text-[10px] font-semibold block uppercase tracking-wider">Active Donations</span>
                          <span className="text-2xl font-black text-[#17201A] block mt-1">{stats.activeDonations}</span>
                          <span className="text-[9px] text-amber-600 font-bold block mt-1.5">14 in live transit</span>
                        </div>

                        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs cursor-pointer hover:border-green-300 transition-all hover:shadow-sm" onClick={() => setActiveTab('donations')}>
                          <span className="text-[#6B7280] text-[10px] font-semibold block uppercase tracking-wider">Completed Rescues</span>
                          <span className="text-2xl font-black text-[#17201A] block mt-1">{stats.completedDonations}</span>
                          <span className="text-[9px] text-emerald-600 font-bold block mt-1.5">98.5% delivery score</span>
                        </div>

                        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs cursor-pointer hover:border-green-300 transition-all hover:shadow-sm" onClick={() => setActiveTab('donations')}>
                          <span className="text-[#6B7280] text-[10px] font-semibold block uppercase tracking-wider">Expired / Waste</span>
                          <span className="text-2xl font-black text-red-500 block mt-1">{stats.expiredDonations}</span>
                          <span className="text-[9px] text-red-500 font-bold block mt-1.5">↓ 12% drop today</span>
                        </div>
                      </div>

                      {/* TOTAL MEALS RESCUED HERO BANNER */}
                      <div className="bg-gradient-to-r from-[#DCFCE7] via-[#EEFDF4] to-[#DCFCE7] rounded-3xl p-6 border border-green-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
                        <div className="flex items-center space-x-4">
                          <div className="w-14 h-14 bg-white rounded-2xl text-3xl flex items-center justify-center border border-green-200 shrink-0 shadow-xs">
                            🍱
                          </div>
                          <div>
                            <span className="text-[11px] font-black text-[#166534] uppercase tracking-wider block">Global Platform Milestone</span>
                            <span className="text-3xl font-black text-[#166534] block leading-none my-1">{stats.mealsRescued.toLocaleString()} Meals Rescued</span>
                            <p className="text-xs text-[#166534]/90 font-medium">Successfully saved from landfills and securely transported to local orphanages and shelters.</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setActiveTab('reports')}
                          className="px-4 py-2 bg-[#16A34A] hover:bg-[#166534] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
                        >
                          View Full Impact Analytics →
                        </button>
                      </div>

                      {/* LIVE OPERATIONS DUAL COLUMN (GPS GOOGLE MAP + VOLUNTEER RADAR) */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                        {/* Left: Live Google Map */}
                        <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden flex flex-col">
                          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-base">🗺️</span>
                              <div>
                                <h3 className="text-xs font-bold text-[#17201A]">Live GPS Map — Donors & Volunteers</h3>
                                <p className="text-[10px] text-[#6B7280]">Real-time coordinates of verified food donors & courier riders</p>
                              </div>
                            </div>
                            <span className="text-[9px] font-black bg-emerald-50 text-emerald-600 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                              Live Tracking
                            </span>
                          </div>
                          <div className="h-[380px] w-full">
                            <AdminLiveMap
                              trackingData={liveTracking}
                              donors={users.filter(u => u.role === 'Donor' && u.status === 'Verified').map(u => ({
                                id: u.id,
                                name: u.name,
                                location: u.location,
                                lat: u.location.includes('Main Road') ? 11.3985 : 11.3962,
                                lng: u.location.includes('Main Road') ? 79.6965 : 79.6936,
                              }))}
                            />
                          </div>
                        </div>

                        {/* Right: Courier Live GPS Radar */}
                        <div className="lg:col-span-5 bg-slate-900 text-white rounded-3xl p-5 shadow-md border border-slate-800 flex flex-col justify-between">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                              <div className="flex items-center gap-2">
                                <span className="text-base">📍</span>
                                <div>
                                  <h3 className="text-xs font-bold text-white">Live Courier GPS Radar</h3>
                                  <p className="text-[10px] text-slate-400">Telemetry feed from volunteer drivers</p>
                                </div>
                              </div>
                              <span className="text-[9px] font-black bg-emerald-950 text-emerald-400 border border-emerald-800/60 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                                Satellite Sync
                              </span>
                            </div>

                            <div className="space-y-2.5 max-h-[310px] overflow-y-auto pr-1">
                              {Object.values(liveTracking).length > 0 ? (
                                Object.values(liveTracking).map((item: any) => (
                                  <div key={item.volunteerId} className="bg-slate-800/80 rounded-2xl p-3 border border-slate-700 space-y-2">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <span className="text-lg">🚴</span>
                                        <div>
                                          <span className="text-xs font-bold text-white block">{item.volunteerName}</span>
                                          <span className="text-[10px] text-slate-400">{item.phone}</span>
                                        </div>
                                      </div>
                                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                        {item.status?.replace(/_/g, ' ')}
                                      </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-900/60 p-2 rounded-xl">
                                      <div>
                                        <span className="text-slate-400 block text-[9px]">Coordinates:</span>
                                        <span className="font-mono text-emerald-400 font-bold">
                                          {typeof item.lat === 'number' ? item.lat.toFixed(4) : item.lat}° N, {typeof item.lng === 'number' ? item.lng.toFixed(4) : item.lng}° E
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-slate-400 block text-[9px]">Last Ping:</span>
                                        <span className="text-slate-300 font-semibold">{item.lastUpdated || 'Just now'}</span>
                                      </div>
                                    </div>

                                    {item.donorName && (
                                      <div className="text-[10px] bg-green-950/40 border border-green-900/40 p-2 rounded-xl flex items-start gap-1.5">
                                        <span className="text-green-400 shrink-0">🏢</span>
                                        <div>
                                          <span className="text-green-300 font-bold block text-[9.5px]">Donor: {item.donorName}</span>
                                          <span className="text-slate-400 text-[9px]">Dest: {item.destination || 'Mother Teresa Anbu Illam'}</span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))
                              ) : (
                                <div className="text-center py-10 text-slate-400 text-xs">
                                  <span className="text-2xl block mb-2">📡</span>
                                  <span>Awaiting live volunteer dispatch signal...</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-400 flex justify-between items-center">
                            <span>Platform Dispatch Node 1</span>
                            <span className="text-emerald-400">99.98% uptime</span>
                          </div>
                        </div>
                      </div>

                      {/* DONATION PROGRESS TRACKER */}
                      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
                        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                          <div className="flex items-center gap-2">
                            <span className="text-base">📦</span>
                            <div>
                              <h3 className="text-sm font-bold text-[#17201A]">Active Donation Progress Lifecycle</h3>
                              <p className="text-xs text-[#6B7280]">Live multi-stage progression from pickup to drop-off</p>
                            </div>
                          </div>
                          <button onClick={() => setActiveTab('donations')} className="text-xs text-[#16A34A] font-bold hover:underline cursor-pointer">
                            View All Donations ({donations.length}) →
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {donations.filter(d => d.status !== 'Expired' && d.status !== 'Cancelled').slice(0, 4).map(d => {
                            const steps = [
                              { label: 'Posted', key: 'posted', done: true },
                              { label: 'Accepted', key: 'accepted', done: d.status === 'Accepted' || d.status === 'Picked Up' || d.status === 'Delivered' },
                              { label: 'Picked Up', key: 'pickedUp', done: d.status === 'Picked Up' || d.status === 'Delivered' },
                              { label: 'Delivered', key: 'delivered', done: d.status === 'Delivered' },
                            ];

                            return (
                              <div key={d.id} className="bg-[#F8FAF9] rounded-2xl p-4 border border-gray-100 space-y-3">
                                <div className="flex justify-between items-start">
                                  <div className="flex items-center gap-3">
                                    <span className="text-2xl bg-white p-2 rounded-xl border border-gray-100 shadow-2xs">{d.foodImage}</span>
                                    <div>
                                      <h4 className="text-xs font-bold text-[#17201A]">{d.foodName}</h4>
                                      <span className="text-[11px] text-[#6B7280]">{d.quantity} • {d.donorName}</span>
                                    </div>
                                  </div>
                                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                                    d.status === 'Active' ? 'bg-green-50 text-green-700 border border-green-100' :
                                    d.status === 'Accepted' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                                    d.status === 'Picked Up' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                    'bg-emerald-100 text-emerald-800'
                                  }`}>
                                    {d.status}
                                  </span>
                                </div>

                                {/* Steps */}
                                <div className="flex items-center gap-1 pt-1">
                                  {steps.map((step, i) => (
                                    <div key={step.key} className="flex-1 flex flex-col items-center gap-1">
                                      <div className="flex items-center w-full">
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${
                                          step.done ? 'bg-[#16A34A] text-white' : 'bg-gray-200 text-gray-400'
                                        }`}>
                                          {step.done ? '✓' : i + 1}
                                        </div>
                                        {i < steps.length - 1 && (
                                          <div className={`flex-1 h-1 mx-1 rounded-full ${
                                            steps[i + 1].done ? 'bg-[#16A34A]' : 'bg-gray-200'
                                          }`} />
                                        )}
                                      </div>
                                      <span className={`text-[9px] font-bold ${step.done ? 'text-[#16A34A]' : 'text-gray-400'}`}>
                                        {step.label}
                                      </span>
                                    </div>
                                  ))}
                                </div>

                                <div className="flex justify-between items-center text-[10px] text-[#6B7280] pt-2 border-t border-gray-100">
                                  <span>📍 {d.location}</span>
                                  {d.volunteerName && (
                                    <span className="text-blue-700 font-bold">🚴 {d.volunteerName}</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* ANALYTICS CHARTS DUAL GRID */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        <DonationActivityChart />
                        <FoodTypeDistributionChart />
                      </div>

                      {/* RECENT PLATFORM ACTIVITY FEED */}
                      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
                        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                          <div className="flex items-center gap-2">
                            <span className="text-base">⚡</span>
                            <h3 className="text-sm font-bold text-[#17201A]">Recent Platform Activity Feed</h3>
                          </div>
                          <span className="w-2.5 h-2.5 bg-[#16A34A] rounded-full animate-ping" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
                          <div className="bg-[#F8FAF9] p-3.5 rounded-2xl border border-gray-100 space-y-1">
                            <span className="text-xs font-bold text-[#17201A] flex items-center gap-1.5">
                              <CheckCircle className="w-4 h-4 text-emerald-600" /> New NGO Verified
                            </span>
                            <p className="text-[11px] text-[#6B7280]">"Helping Hands NGO" was validated & approved.</p>
                            <span className="text-[9px] text-gray-400 block pt-1">10 mins ago</span>
                          </div>

                          <div className="bg-[#F8FAF9] p-3.5 rounded-2xl border border-gray-100 space-y-1">
                            <span className="text-xs font-bold text-[#17201A] flex items-center gap-1.5">
                              <CheckCircle className="w-4 h-4 text-emerald-600" /> Donation Completed
                            </span>
                            <p className="text-[11px] text-[#6B7280]">"40 meals" delivered safely by courier Rahul.</p>
                            <span className="text-[9px] text-gray-400 block pt-1">2 hours ago</span>
                          </div>

                          <div className="bg-amber-50/50 p-3.5 rounded-2xl border border-amber-200/50 space-y-1">
                            <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                              <AlertCircle className="w-4 h-4 text-amber-600" /> Donation Flagged
                            </span>
                            <p className="text-[11px] text-amber-700">"Biryani batch" flagged as expired/stale.</p>
                            <span className="text-[9px] text-amber-500 block pt-1">4 hours ago</span>
                          </div>

                          <div className="bg-[#F8FAF9] p-3.5 rounded-2xl border border-gray-100 space-y-1">
                            <span className="text-xs font-bold text-[#17201A] flex items-center gap-1.5">
                              <UserCircle2 className="w-4 h-4 text-blue-600" /> Courier Onboarded
                            </span>
                            <p className="text-[11px] text-[#6B7280]">Rahul Kumar registered & passed vehicle check.</p>
                            <span className="text-[9px] text-gray-400 block pt-1">Yesterday</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* TAB 2: USER MANAGEMENT SCREEN */}
                  {activeTab === 'users' && (
                    <UserViews
                      users={users}
                      onUpdateUserStatus={handleUpdateUserStatus}
                      onVerifyUser={handleVerifyUser}
                    />
                  )}

                  {/* TAB 3: DONATION MONITORING SCREEN */}
                  {activeTab === 'donations' && (
                    <DonationViews
                      donations={donations}
                      onUpdateDonationStatus={handleUpdateDonationStatus}
                    />
                  )}

                  {/* TAB 4: REPORTS & COMPLAINTS SCREEN */}
                  {activeTab === 'reports' && (
                    <ReportViews
                      reports={reports}
                      onUpdateReportStatus={handleUpdateReportStatus}
                      onExportComplete={handleExportComplete}
                    />
                  )}

                  {/* TAB 5: ADMIN PROFILE & SECURITY SCREEN */}
                  {activeTab === 'profile' && (
                    <div className="space-y-6">
                      {/* Top Super Admin Banner */}
                      <div className="bg-gradient-to-r from-[#166534] to-[#16A34A] rounded-3xl p-6 text-white relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md">
                        <div className="flex items-center space-x-4 relative z-10">
                          <div className="w-16 h-16 bg-white rounded-2xl text-3xl flex items-center justify-center shadow-xs text-green-700 font-bold shrink-0">
                            👑
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="text-sm font-bold uppercase tracking-wider text-green-100">Super Administrator</h3>
                              <span className="bg-white/20 text-[9px] font-bold px-2 py-0.5 rounded-full">
                                ✓ Fully Authorized
                              </span>
                            </div>
                            <h4 className="text-xl font-black mt-1 leading-tight">RePlate Administrator</h4>
                            <p className="text-xs text-green-100 opacity-90">admin@foodsave.org</p>
                          </div>
                        </div>

                        <button
                          onClick={() => setIsLogoutModalOpen(true)}
                          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/20 cursor-pointer flex items-center space-x-2 relative z-10"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>

                        <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-10 pointer-events-none">
                          <svg viewBox="0 0 100 100" className="w-40 h-40" fill="currentColor">
                            <circle cx="50" cy="50" r="40" />
                          </svg>
                        </div>
                      </div>

                      {/* Profile Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {/* Account Info */}
                        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs space-y-4">
                          <h4 className="text-xs font-bold text-[#17201A] uppercase tracking-wider pb-2 border-b border-gray-100">Account Credentials</h4>
                          
                          <div className="flex justify-between items-center text-xs py-1">
                            <span className="text-[#6B7280]">Email Address:</span>
                            <span className="font-bold text-[#17201A]">admin@foodsave.org</span>
                          </div>

                          <div className="flex justify-between items-center text-xs py-1">
                            <span className="text-[#6B7280]">Assigned Phone:</span>
                            <span className="font-bold text-[#17201A]">+91 94444 00000</span>
                          </div>

                          <div className="flex justify-between items-center text-xs py-1">
                            <span className="text-[#6B7280]">Admin Role:</span>
                            <span className="font-bold text-[#16A34A] bg-[#DCFCE7] px-2 py-0.5 rounded-full">Root Operator</span>
                          </div>
                        </div>

                        {/* Security Controls */}
                        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs space-y-4">
                          <h4 className="text-xs font-bold text-[#17201A] uppercase tracking-wider pb-2 border-b border-gray-100">Security Infrastructure</h4>

                          <div className="flex justify-between items-center text-xs py-1">
                            <span className="text-[#6B7280]">Two-Factor Auth:</span>
                            <button
                              onClick={() => {
                                setTwoFactorEnabled(!twoFactorEnabled);
                                triggerToast(twoFactorEnabled ? '2FA disabled' : '2FA enabled on admin device!', 'info');
                              }}
                              className={`w-10 h-5 rounded-full transition-all relative cursor-pointer ${
                                twoFactorEnabled ? 'bg-[#16A34A]' : 'bg-gray-200'
                              }`}
                            >
                              <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${
                                twoFactorEnabled ? 'right-0.5' : 'left-0.5'
                              }`} />
                            </button>
                          </div>

                          <div className="flex justify-between items-center text-xs py-1">
                            <span className="text-[#6B7280]">Session Encryption:</span>
                            <span className="font-bold text-[#17201A]">TLS 1.3 / AES-256</span>
                          </div>

                          <div className="flex justify-between items-center text-xs py-1">
                            <span className="text-[#6B7280]">Active Console:</span>
                            <span className="font-bold text-[#16A34A]">Port 3000 Web Console</span>
                          </div>
                        </div>

                        {/* System Parameters */}
                        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs space-y-4">
                          <h4 className="text-xs font-bold text-[#17201A] uppercase tracking-wider pb-2 border-b border-gray-100">Global Parameters</h4>

                          <div className="flex justify-between items-center text-xs py-1">
                            <span className="text-[#6B7280]">Push Broadcasts:</span>
                            <button
                              onClick={() => {
                                setPushNotifications(!pushNotifications);
                                triggerToast(pushNotifications ? 'Push alerts disabled' : 'Push alerts enabled', 'info');
                              }}
                              className={`w-10 h-5 rounded-full transition-all relative cursor-pointer ${
                                pushNotifications ? 'bg-[#16A34A]' : 'bg-gray-200'
                              }`}
                            >
                              <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${
                                pushNotifications ? 'right-0.5' : 'left-0.5'
                              }`} />
                            </button>
                          </div>

                          <div className="flex justify-between items-center text-xs py-1">
                            <span className="text-[#6B7280]">Console Language:</span>
                            <select
                              value={selectedLanguage}
                              onChange={(e) => {
                                setSelectedLanguage(e.target.value as any);
                                triggerToast(`Console translated to ${e.target.value}`, 'success');
                              }}
                              className="bg-gray-100 hover:bg-gray-200 text-[#17201A] text-xs font-bold py-1 px-2.5 rounded-lg border-none cursor-pointer"
                            >
                              <option value="English">English</option>
                              <option value="Tamil">Tamil</option>
                              <option value="Spanish">Spanish</option>
                            </select>
                          </div>

                          <div className="flex justify-between items-center text-xs py-1">
                            <span className="text-[#6B7280]">Cluster Health:</span>
                            <span className="font-bold text-emerald-600 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              All Nodes Green
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </main>
          </div>

        </div>
      )}

      {/* LOGOUT OVERLAY CONFIRMATION */}
      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={() => {
          setIsLoggedIn(false);
          setShowNotificationsPage(false);
          setActiveTab('dashboard');
          triggerToast('Successfully logged out of Super Admin credentials', 'info');
        }}
        title="Logout Confirmation"
        message="Are you absolutely sure you want to end your current secure session on this RePlate platform node? You will need your admin credentials to login again."
        confirmText="Logout"
        type="danger"
      />

    </div>
  );
}
