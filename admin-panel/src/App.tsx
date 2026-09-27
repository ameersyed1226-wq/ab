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
  ExternalLink
} from 'lucide-react';
import { ConfirmationModal } from './components/ModalSheets';
import { AdminLiveMap } from './components/AdminLiveMap';

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

  // Navigation: 'dashboard' | 'users' | 'donations' | 'reports' | 'profile' | 'notifications'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'donations' | 'reports' | 'profile'>('dashboard');
  const [showNotificationsPage, setShowNotificationsPage] = useState(false);

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
            description: `${u.name} is now a registered FoodSave Verified partner.`,
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
    <div className="md:bg-[#E8EDE9] flex flex-col items-center justify-center min-h-screen py-4 md:py-8 font-sans selection:bg-[#DCFCE7] selection:text-[#166534]">
      
      {/* Dynamic Toast Feedback Notification */}
      {toast && (
        <div className="fixed top-6 max-w-[340px] w-full px-4 z-50 animate-bounce">
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

      {/* Outer physical Smartphone Device Mockup wrapper (md screens and up) */}
      <div className="w-full max-w-[390px] md:h-[844px] md:rounded-[48px] bg-[#F8FAF9] md:shadow-2xl md:ring-12 md:ring-[#17201A] relative flex flex-col overflow-hidden h-screen border border-gray-100">
        
        {/* Dynamic Screen Area Container */}
        <div className="flex-1 overflow-y-auto flex flex-col relative bg-[#F8FAF9]">
          
          {/* LOGIN PAGE */}
          {!isLoggedIn ? (
            <div className="flex-1 flex flex-col justify-between p-6">
              <div className="flex flex-col items-center text-center mt-6">
                
                {/* SVG Logo: Minimal plate + heart + community leaf symbol */}
                <div className="w-16 h-16 bg-[#DCFCE7] rounded-3xl flex items-center justify-center border border-green-200 shadow-md mb-4 transform hover:scale-105 transition-transform">
                  <svg viewBox="0 0 100 100" className="w-10 h-10 text-[#16A34A]" fill="currentColor">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#16A34A" strokeWidth="6" />
                    <path d="M 50 15 C 38 15 32 25 32 35 C 32 47 45 58 50 64 C 55 58 68 47 68 35 C 68 25 62 15 50 15 Z" fill="#16A34A" opacity="0.15" />
                    <path d="M 50 25 C 44 25 40 29 40 34 C 40 40 47 47 50 51 C 53 47 60 40 60 34 C 60 29 56 25 50 25 Z" fill="#16A34A" />
                    <path d="M 45 68 C 30 68 20 58 20 58 C 20 58 35 62 48 58" fill="none" stroke="#16A34A" strokeWidth="4" strokeLinecap="round" />
                    <path d="M 55 68 C 70 68 80 58 80 58 C 80 58 65 62 52 58" fill="none" stroke="#16A34A" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                </div>

                <h1 className="text-xl font-extrabold text-[#17201A] tracking-tight">FoodSave</h1>
                <span className="text-[10px] font-bold text-[#16A34A] tracking-widest uppercase bg-[#DCFCE7] px-2.5 py-0.5 rounded-full mt-1">
                  “Save Food. Share Hope.”
                </span>

                <h2 className="text-sm font-bold text-[#17201A] mt-6">Welcome Back, Admin</h2>
                <p className="text-[11px] text-[#6B7280] max-w-[220px] leading-relaxed mt-1">
                  Manage commercial donors, logistics, and volunteers.
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4 mt-4">
                {loginError && (
                  <div className="p-3 bg-red-50 border border-red-100 text-[10.5px] font-semibold text-red-600 rounded-xl flex items-center space-x-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#17201A] uppercase tracking-wider block">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="login-email-input"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@foodsave.org"
                      className="w-full bg-white pl-9 pr-3 py-2.5 rounded-xl border border-gray-100 text-xs text-[#17201A] focus:outline-hidden focus:ring-1 focus:ring-[#16A34A] focus:border-[#16A34A]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <label className="text-[10px] font-bold text-[#17201A] uppercase tracking-wider">Password</label>
                    <button
                      type="button"
                      onClick={() => triggerToast('Password recovery token dispatched to standard mail server.', 'info')}
                      className="text-[10px] font-bold text-[#16A34A] hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="login-password-input"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white pl-9 pr-3 py-2.5 rounded-xl border border-gray-100 text-xs text-[#17201A] focus:outline-hidden focus:ring-1 focus:ring-[#16A34A] focus:border-[#16A34A]"
                    />
                  </div>
                </div>

                <button
                  id="login-btn"
                  type="submit"
                  className="w-full py-3 bg-[#16A34A] hover:bg-[#166534] text-white text-xs font-bold rounded-xl shadow-md transition-all mt-2 active:scale-98"
                >
                  Login
                </button>
              </form>

              {/* Developer Helper Box for easy evaluation */}
              <div className="bg-[#DCFCE7]/20 border border-[#DCFCE7] rounded-2xl p-3.5 text-[10.5px] mt-6">
                <span className="font-bold text-[#166534] block mb-1">💡 Demo Accounts Credentials</span>
                <span className="text-[#6B7280] block">Email: <strong className="text-[#17201A]">admin@foodsave.org</strong></span>
                <span className="text-[#6B7280] block">Pass: <strong className="text-[#17201A]">admin123</strong></span>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('admin@foodsave.org');
                    setPassword('admin123');
                    triggerToast('Credentials auto-filled!', 'success');
                  }}
                  className="mt-2 text-[9.5px] font-black text-[#16A34A] hover:underline block"
                >
                  Click to Auto-fill Credentials →
                </button>
              </div>

              <div className="text-center py-4">
                <span className="text-[10px] text-[#6B7280] font-semibold flex items-center justify-center">
                  🔒 Secure Admin Access (SSL 256-bit)
                </span>
              </div>
            </div>
          ) : showNotificationsPage ? (
            
            /* DEDICATED NOTIFICATIONS PAGE */
            <div className="flex-1 flex flex-col justify-between">
              {/* Header */}
              <div className="p-4 bg-white border-b border-gray-100 flex justify-between items-center shrink-0">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowNotificationsPage(false)}
                    className="p-1 rounded-full hover:bg-gray-100 text-[#6B7280] text-xs font-bold"
                  >
                    ← Back
                  </button>
                  <h2 className="text-sm font-bold text-[#17201A]">System Notifications</h2>
                </div>
                {unreadNotifsCount > 0 && (
                  <button
                    onClick={markAllNotifsRead}
                    className="text-[9.5px] font-bold text-[#16A34A] hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Scrollable list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[620px]">
                {/* Today Section */}
                <div className="space-y-2">
                  <h3 className="text-[9.5px] font-bold text-[#6B7280] uppercase tracking-wider">Today</h3>
                  {notifications.filter(n => n.section === 'Today').map((n) => (
                    <div
                      key={n.id}
                      onClick={() => toggleNotifRead(n.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start space-x-3 ${
                        n.isRead ? 'bg-white border-gray-50 opacity-75' : 'bg-[#DCFCE7]/10 border-[#DCFCE7]'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${
                        n.isRead ? 'bg-transparent' : 'bg-[#16A34A]'
                      }`} />
                      <div className="min-w-0 flex-1 text-[11px]">
                        <h4 className="font-bold text-[#17201A]">{n.title}</h4>
                        <p className="text-[#6B7280] mt-0.5 leading-relaxed">{n.description}</p>
                        <span className="text-[8.5px] text-[#6B7280] mt-1 block font-semibold">{n.time}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Earlier Section */}
                <div className="space-y-2">
                  <h3 className="text-[9.5px] font-bold text-[#6B7280] uppercase tracking-wider">Earlier</h3>
                  {notifications.filter(n => n.section === 'Earlier').map((n) => (
                    <div
                      key={n.id}
                      onClick={() => toggleNotifRead(n.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start space-x-3 ${
                        n.isRead ? 'bg-white border-gray-50 opacity-75' : 'bg-[#DCFCE7]/10 border-[#DCFCE7]'
                      }`}
                    >
                      <div className="min-w-0 flex-1 text-[11px] pl-3.5">
                        <h4 className="font-bold text-[#17201A]">{n.title}</h4>
                        <p className="text-[#6B7280] mt-0.5 leading-relaxed">{n.description}</p>
                        <span className="text-[8.5px] text-[#6B7280] mt-1 block font-semibold">{n.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom return bar */}
              <div className="p-4 bg-white border-t border-gray-50 shrink-0">
                <button
                  onClick={() => setShowNotificationsPage(false)}
                  className="w-full py-2.5 bg-[#16A34A] text-white text-xs font-bold rounded-xl"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          ) : (
            
            /* SECURE APPLICATION WORKSPACE RENDER (Dashboard, Users, Donations, Reports, Profile) */
            <div className="flex-1 flex flex-col justify-between">
              
              {/* STICKY CONTAINER HEADER */}
              <div className="bg-white px-4 py-2.5 border-b border-gray-100 flex justify-between items-center sticky top-0 z-30 shrink-0">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 bg-[#DCFCE7] rounded-lg flex items-center justify-center border border-green-200">
                    <svg viewBox="0 0 100 100" className="w-4 h-4 text-[#16A34A]" fill="currentColor">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="#16A34A" strokeWidth="6" />
                      <path d="M 50 15 C 38 15 32 25 32 35 C 32 47 45 58 50 64 C 55 58 68 47 68 35 C 68 25 62 15 50 15 Z" fill="#16A34A" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-extrabold text-[#17201A] tracking-tight leading-tight">FoodSave Admin</span>
                    <span className="text-[8.5px] font-bold text-emerald-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live API (Port 5000)
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1.5">
                  {/* Link to Donor/Volunteer App */}
                  <a
                    href="http://localhost:3001"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-[#006b2c] border border-emerald-200 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all"
                    title="Launch Donor & Volunteer App"
                  >
                    <span>App (3001)</span>
                    <ExternalLink size={10} />
                  </a>

                  {/* Bell Icon Trigger */}
                  <button
                    id="header-notification-bell"
                    onClick={() => setShowNotificationsPage(true)}
                    className="p-1.5 rounded-full hover:bg-gray-100 text-[#17201A] relative"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadNotifsCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center animate-pulse">
                        {unreadNotifsCount}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* CENTRAL VIEW BODY (Dynamic Tab switches) */}
              <div className="flex-1 py-3 overflow-y-auto">
                
                {/* 1. ADMIN DASHBOARD SCREEN */}
                {activeTab === 'dashboard' && (
                  <div className="space-y-4 px-4 pb-12">
                    
                    {/* Welcome Greeting Row */}
                    <div className="flex justify-between items-end">
                      <div>
                        <h2 className="text-base font-extrabold text-[#17201A]">Good Morning, Admin 👋</h2>
                        <p className="text-[10px] text-[#6B7280]">Here's your live platform overview today.</p>
                      </div>
                      <span className="text-[9px] font-bold text-[#166534] bg-[#DCFCE7] px-2 py-0.5 rounded-md shrink-0">
                        {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    {/* LIVE GPS GOOGLE MAP - Donor & Volunteer Locations */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
                      <div className="px-3.5 py-2.5 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">🗺️</span>
                          <div>
                            <h3 className="text-xs font-bold text-[#17201A]">Live GPS Map — Donors & Volunteers</h3>
                            <p className="text-[8.5px] text-[#6B7280]">Real-time locations of food donors & volunteer couriers</p>
                          </div>
                        </div>
                        <span className="text-[8.5px] font-black bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                          Live
                        </span>
                      </div>
                      <div className="h-[240px]">
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

                    {/* LIVE GPS COURIER RADAR & RESCUE DELIVERIES (Text Data) */}
                    <div className="bg-slate-900 text-white rounded-2xl p-3.5 shadow-md border border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">📍</span>
                          <div>
                            <h3 className="text-xs font-bold text-white">Live Volunteer Courier GPS Radar</h3>
                            <p className="text-[8.5px] text-slate-400">Real-time volunteer coordinates & destination</p>
                          </div>
                        </div>
                        <span className="text-[8.5px] font-black bg-emerald-950 text-emerald-400 border border-emerald-800/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          Live Sync
                        </span>
                      </div>

                      {Object.values(liveTracking).length > 0 ? (
                        Object.values(liveTracking).map((item: any) => (
                          <div key={item.volunteerId} className="bg-slate-800/80 rounded-xl p-2.5 border border-slate-700 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-base">🚴</span>
                                <div>
                                  <span className="text-xs font-bold text-white block">{item.volunteerName}</span>
                                  <span className="text-[9px] text-slate-400">{item.phone}</span>
                                </div>
                              </div>
                              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                {item.status?.replace(/_/g, ' ')}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-1.5 text-[9.5px] bg-slate-900/60 p-2 rounded-lg">
                              <div>
                                <span className="text-slate-400 block text-[8px]">GPS Coordinates:</span>
                                <span className="font-mono text-emerald-400 font-bold">
                                  {typeof item.lat === 'number' ? item.lat.toFixed(4) : item.lat}° N, {typeof item.lng === 'number' ? item.lng.toFixed(4) : item.lng}° E
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[8px]">Last Ping:</span>
                                <span className="text-slate-300 font-semibold">{item.lastUpdated || 'Just now'}</span>
                              </div>
                            </div>

                            {/* Donor Info */}
                            {item.donorName && (
                              <div className="text-[9.5px] bg-green-950/40 border border-green-900/40 p-2 rounded-lg flex items-start gap-1.5">
                                <span className="text-green-400 shrink-0 mt-0.5">🏢</span>
                                <div>
                                  <span className="text-green-300 font-bold block text-[9px]">Pickup From (Donor):</span>
                                  <span className="text-slate-300 leading-tight block">{item.donorName}</span>
                                  {item.donorLat && <span className="text-green-400/70 font-mono text-[8px]">{item.donorLat.toFixed(4)}°N, {item.donorLng?.toFixed(4)}°E</span>}
                                </div>
                              </div>
                            )}

                            <div className="text-[9.5px] bg-emerald-950/40 border border-emerald-900/40 p-2 rounded-lg flex items-start gap-1.5">
                              <span className="text-emerald-400 shrink-0 mt-0.5">🏁</span>
                              <div>
                                <span className="text-emerald-300 font-bold block text-[9px]">Destination Address:</span>
                                <span className="text-slate-300 leading-tight block">{item.destination || 'Mother Teresa Anbu Illam, Chidambaram'}</span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-3 text-slate-400 text-xs">
                          <span>Awaiting live volunteer dispatch signal...</span>
                        </div>
                      )}
                    </div>

                    {/* DONATION PROGRESS TRACKER - Full Lifecycle View */}
                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-3">
                      <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">📦</span>
                          <h3 className="text-xs font-bold text-[#17201A] uppercase tracking-wider">Donation Progress Tracker</h3>
                        </div>
                        <button onClick={() => setActiveTab('donations')} className="text-[10px] text-[#16A34A] font-bold">View All →</button>
                      </div>

                      {donations.filter(d => d.status !== 'Expired' && d.status !== 'Cancelled').slice(0, 4).map(d => {
                        const steps = [
                          { label: 'Posted', key: 'posted', done: true },
                          { label: 'Accepted', key: 'accepted', done: d.status === 'Accepted' || d.status === 'Picked Up' || d.status === 'Delivered' },
                          { label: 'Picked Up', key: 'pickedUp', done: d.status === 'Picked Up' || d.status === 'Delivered' },
                          { label: 'Delivered', key: 'delivered', done: d.status === 'Delivered' },
                        ];
                        const currentStepIndex = steps.filter(s => s.done).length;

                        return (
                          <div key={d.id} className="bg-[#F8FAF9] rounded-xl p-3 border border-gray-50 space-y-2">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-2">
                                <span className="text-base">{d.foodImage}</span>
                                <div>
                                  <h4 className="text-[11px] font-bold text-[#17201A]">{d.foodName}</h4>
                                  <span className="text-[9px] text-[#6B7280]">{d.quantity} • {d.donorName}</span>
                                </div>
                              </div>
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                d.status === 'Active' ? 'bg-green-50 text-green-700 border border-green-100' :
                                d.status === 'Accepted' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                                d.status === 'Picked Up' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                'bg-emerald-100 text-emerald-800'
                              }`}>
                                {d.status}
                              </span>
                            </div>

                            {/* Visual Progress Steps */}
                            <div className="flex items-center gap-0.5">
                              {steps.map((step, i) => (
                                <div key={step.key} className="flex-1 flex flex-col items-center gap-0.5">
                                  <div className="flex items-center w-full">
                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0 ${
                                      step.done ? 'bg-[#16A34A] text-white' : 'bg-gray-200 text-gray-400'
                                    }`}>
                                      {step.done ? '✓' : i + 1}
                                    </div>
                                    {i < steps.length - 1 && (
                                      <div className={`flex-1 h-0.5 mx-0.5 rounded ${
                                        steps[i + 1].done ? 'bg-[#16A34A]' : 'bg-gray-200'
                                      }`} />
                                    )}
                                  </div>
                                  <span className={`text-[7px] font-bold ${step.done ? 'text-[#16A34A]' : 'text-gray-400'}`}>
                                    {step.label}
                                  </span>
                                </div>
                              ))}
                            </div>

                            {/* Volunteer Info */}
                            {d.volunteerName && (
                              <div className="flex items-center gap-1.5 text-[9.5px] bg-blue-50 border border-blue-100 rounded-lg p-1.5">
                                <span>🚴</span>
                                <span className="text-blue-800 font-bold">{d.volunteerName}</span>
                                <span className="text-blue-500 ml-auto">Assigned</span>
                              </div>
                            )}

                            {/* Location */}
                            <div className="flex items-center gap-1 text-[9px] text-[#6B7280]">
                              <span>📍</span>
                              <span>{d.location}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Platform Stats 2-column mobile grid */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white rounded-2xl p-3 border border-[#F0F2F1] shadow-xs cursor-pointer hover:border-green-300 transition-all" onClick={() => setActiveTab('users')}>
                        <span className="text-[#6B7280] text-[9px] font-semibold block">Total Users</span>
                        <span className="text-lg font-black text-[#17201A] block mt-0.5">{stats.totalUsers}</span>
                        <span className="text-[8px] text-[#6B7280] block mt-1">Donors, NGOs & Drivers</span>
                      </div>

                      <div className="bg-white rounded-2xl p-3 border border-[#F0F2F1] shadow-xs cursor-pointer hover:border-green-300 transition-all" onClick={() => setActiveTab('users')}>
                        <span className="text-[#6B7280] text-[9px] font-semibold block">Food Donors</span>
                        <span className="text-lg font-black text-[#17201A] block mt-0.5">{stats.foodDonors}</span>
                        <span className="text-[8px] text-[#16A34A] font-bold block mt-1">🟢 12 online now</span>
                      </div>

                      <div className="bg-white rounded-2xl p-3 border border-[#F0F2F1] shadow-xs cursor-pointer hover:border-green-300 transition-all" onClick={() => setActiveTab('users')}>
                        <span className="text-[#6B7280] text-[9px] font-semibold block">Active Volunteers</span>
                        <span className="text-lg font-black text-[#17201A] block mt-0.5">{stats.volunteers}</span>
                        <span className="text-[8px] text-blue-600 font-bold block mt-1">45 on duty</span>
                      </div>

                      <div className="bg-white rounded-2xl p-3 border border-[#F0F2F1] shadow-xs cursor-pointer hover:border-green-300 transition-all" onClick={() => setActiveTab('donations')}>
                        <span className="text-[#6B7280] text-[9px] font-semibold block">Active Donations</span>
                        <span className="text-lg font-black text-[#17201A] block mt-0.5">{stats.activeDonations}</span>
                        <span className="text-[8px] text-amber-600 font-bold block mt-1">14 in transit</span>
                      </div>

                      <div className="bg-white rounded-2xl p-3 border border-[#F0F2F1] shadow-xs cursor-pointer hover:border-green-300 transition-all" onClick={() => setActiveTab('donations')}>
                        <span className="text-[#6B7280] text-[9px] font-semibold block">Completed Rescue</span>
                        <span className="text-lg font-black text-[#17201A] block mt-0.5">{stats.completedDonations}</span>
                        <span className="text-[8px] text-emerald-600 font-bold block mt-1">98.5% delivery score</span>
                      </div>

                      <div className="bg-white rounded-2xl p-3 border border-[#F0F2F1] shadow-xs cursor-pointer hover:border-green-300 transition-all" onClick={() => setActiveTab('donations')}>
                        <span className="text-[#6B7280] text-[9px] font-semibold block">Expired / Waste</span>
                        <span className="text-lg font-black text-red-500 block mt-0.5">{stats.expiredDonations}</span>
                        <span className="text-[8px] text-red-500 font-bold block mt-1">↓ 12% drop today</span>
                      </div>
                    </div>

                    {/* TOTAL MEALS RESCUED HIGHLIGHT CARD */}
                    <div className="bg-gradient-to-br from-[#DCFCE7] to-[#EEFDF4] rounded-2xl p-4 border border-green-100 flex items-center space-x-3.5 shadow-sm">
                      <div className="w-11 h-11 bg-white rounded-2xl text-xl flex items-center justify-center border border-green-200 shrink-0 shadow-xs">
                        🍱
                      </div>
                      <div className="min-w-0">
                        <span className="text-[9.5px] font-extrabold text-[#166534] uppercase tracking-wider block">Total Meals Rescued</span>
                        <span className="text-2xl font-black text-[#166534] block leading-none my-1">{stats.mealsRescued.toLocaleString()}</span>
                        <p className="text-[10px] text-[#166534]/90 font-medium">Meals successfully saved from landfills and distributed to shelters.</p>
                      </div>
                    </div>

                    {/* Dynamic line chart & Donut charts */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xs font-bold text-[#17201A] uppercase tracking-wider">Metrics Drilldown</h3>
                        <button onClick={() => setActiveTab('reports')} className="text-[10px] text-[#16A34A] font-bold">Full Analytics →</button>
                      </div>
                      <DonationActivityChart />
                      <div className="grid grid-cols-1 gap-4">
                        <FoodTypeDistributionChart />
                      </div>
                    </div>

                    {/* RECENT ACTIVITY CARD */}
                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-3">
                      <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                        <h3 className="text-xs font-bold text-[#17201A] uppercase tracking-wider">Recent Activity</h3>
                        <span className="w-2 h-2 bg-[#16A34A] rounded-full animate-ping" />
                      </div>

                      <div className="space-y-3 text-[10.5px]">
                        {/* 1 */}
                        <div className="flex items-start space-x-2.5">
                          <span className="text-base">✓</span>
                          <div>
                            <span className="font-bold text-[#17201A] block">New NGO verified</span>
                            <span className="text-[#6B7280]">"Helping Hands NGO" approved by Admin.</span>
                            <span className="text-[8px] text-gray-400 block mt-0.5">10 mins ago</span>
                          </div>
                        </div>
                        {/* 2 */}
                        <div className="flex items-start space-x-2.5">
                          <span className="text-base">✓</span>
                          <div>
                            <span className="font-bold text-[#17201A] block">Donation completed</span>
                            <span className="text-[#6B7280]">"40 meals" delivered successfully by Rahul.</span>
                            <span className="text-[8px] text-gray-400 block mt-0.5">2 hours ago</span>
                          </div>
                        </div>
                        {/* 3 */}
                        <div className="flex items-start space-x-2.5 text-amber-600">
                          <span className="text-base">⚠</span>
                          <div>
                            <span className="font-bold text-[#17201A] block">Donation reported</span>
                            <span className="text-[#6B7280]">"Biryani donation" flagged as stale.</span>
                            <span className="text-[8px] text-gray-400 block mt-0.5">4 hours ago</span>
                          </div>
                        </div>
                        {/* 4 */}
                        <div className="flex items-start space-x-2.5">
                          <span className="text-base">👤</span>
                          <div>
                            <span className="font-bold text-[#17201A] block">New volunteer registered</span>
                            <span className="text-[#6B7280]">Rahul Kumar registered as driver.</span>
                            <span className="text-[8px] text-gray-400 block mt-0.5">Yesterday</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. USER MANAGEMENT SCREEN */}
                {activeTab === 'users' && (
                  <UserViews
                    users={users}
                    onUpdateUserStatus={handleUpdateUserStatus}
                    onVerifyUser={handleVerifyUser}
                  />
                )}

                {/* 3. DONATION MONITORING SCREEN */}
                {activeTab === 'donations' && (
                  <DonationViews
                    donations={donations}
                    onUpdateDonationStatus={handleUpdateDonationStatus}
                  />
                )}

                {/* 4. REPORTS & COMPLAINTS SCREEN */}
                {activeTab === 'reports' && (
                  <ReportViews
                    reports={reports}
                    onUpdateReportStatus={handleUpdateReportStatus}
                    onExportComplete={handleExportComplete}
                  />
                )}

                {/* 5. ADMIN PROFILE & SECURITY SCREEN */}
                {activeTab === 'profile' && (
                  <div className="space-y-4 px-4 pb-12">
                    {/* Top Admin Avatar Info */}
                    <div className="bg-gradient-to-r from-[#166534] to-[#16A34A] rounded-2xl p-4 text-white relative overflow-hidden flex items-center space-x-4 shadow-md">
                      <div className="absolute right-0 bottom-0 translate-x-2 translate-y-2 opacity-10">
                        <svg viewBox="0 0 100 100" className="w-24 h-24" fill="currentColor">
                          <circle cx="50" cy="50" r="40" />
                        </svg>
                      </div>
                      
                      <div className="w-12 h-12 bg-white rounded-2xl text-2xl flex items-center justify-center shadow-xs text-green-700 font-bold shrink-0">
                        👑
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-1.5">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-green-100">Super Admin</h3>
                          <span className="bg-white/20 text-[8px] font-bold px-1.5 py-0.5 rounded-full flex items-center">
                            ✓ Verified
                          </span>
                        </div>
                        <h4 className="text-sm font-black mt-0.5 leading-tight">FoodSave Administrator</h4>
                        <p className="text-[10px] text-green-100 opacity-90 truncate">admin@foodsave.org</p>
                      </div>
                    </div>

                    {/* ACCOUNT OPTIONS */}
                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-3">
                      <h4 className="text-[10px] font-bold text-[#17201A] uppercase tracking-wider pb-1.5 border-b border-gray-50">Account Profile</h4>
                      
                      <button onClick={() => triggerToast('Profile updating triggers real-time admin SMTP sync.', 'info')} className="w-full flex justify-between items-center text-[11px] font-medium text-[#17201A] py-1">
                        <span className="flex items-center space-x-2">
                          <span className="text-gray-400">👤</span>
                          <span>Edit Admin profile</span>
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </button>

                      <div className="flex justify-between items-center text-[10.5px] py-1 text-[#6B7280]">
                        <span className="flex items-center space-x-2">
                          <span className="text-gray-400">📧</span>
                          <span>Secure Email Address</span>
                        </span>
                        <span className="font-bold text-[#17201A]">admin@foodsave.org</span>
                      </div>

                      <div className="flex justify-between items-center text-[10.5px] py-1 text-[#6B7280]">
                        <span className="flex items-center space-x-2">
                          <span className="text-gray-400">📱</span>
                          <span>Assigned Telephone</span>
                        </span>
                        <span className="font-bold text-[#17201A]">+91 94444 00000</span>
                      </div>
                    </div>

                    {/* SECURITY CONTROLS */}
                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-3">
                      <h4 className="text-[10px] font-bold text-[#17201A] uppercase tracking-wider pb-1.5 border-b border-gray-50">Security Infrastructure</h4>

                      <button onClick={() => triggerToast('Admin security override requires external passkey registration.', 'danger')} className="w-full flex justify-between items-center text-[11px] font-medium text-[#17201A] py-1">
                        <span className="flex items-center space-x-2">
                          <span className="text-gray-400">🔐</span>
                          <span>Change Access Password</span>
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </button>

                      {/* Interactive 2-Factor switch */}
                      <div className="flex justify-between items-center text-[11px] font-medium text-[#17201A] py-1">
                        <span className="flex items-center space-x-2">
                          <span className="text-gray-400">🔑</span>
                          <span>Two-Factor Authentication</span>
                        </span>
                        <button
                          onClick={() => {
                            setTwoFactorEnabled(!twoFactorEnabled);
                            triggerToast(twoFactorEnabled ? '2FA disabled' : '2FA enabled on admin device!', 'info');
                          }}
                          className={`w-9 h-5 rounded-full transition-all relative ${
                            twoFactorEnabled ? 'bg-[#16A34A]' : 'bg-gray-200'
                          }`}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${
                            twoFactorEnabled ? 'right-0.5' : 'left-0.5'
                          }`} />
                        </button>
                      </div>

                      {/* Active sessions list */}
                      <div className="pt-1.5 border-t border-gray-50 text-[10px] text-[#6B7280]">
                        <span className="font-semibold text-[#17201A] block mb-1">Active platform nodes</span>
                        <div className="flex justify-between text-[9px] bg-gray-50 p-1.5 rounded-lg">
                          <span>📍 Chennai (This Web Console)</span>
                          <span className="font-bold text-[#16A34A]">Current session</span>
                        </div>
                      </div>
                    </div>

                    {/* SETTINGS MODULE */}
                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-3">
                      <h4 className="text-[10px] font-bold text-[#17201A] uppercase tracking-wider pb-1.5 border-b border-gray-50">Global Parameters</h4>

                      {/* Notifications settings */}
                      <div className="flex justify-between items-center text-[11px] font-medium text-[#17201A] py-1">
                        <span className="flex items-center space-x-2">
                          <span className="text-gray-400">🔔</span>
                          <span>Push Notification Broadcast</span>
                        </span>
                        <button
                          onClick={() => {
                            setPushNotifications(!pushNotifications);
                            triggerToast(pushNotifications ? 'Push alerts disabled' : 'Push alerts enabled', 'info');
                          }}
                          className={`w-9 h-5 rounded-full transition-all relative ${
                            pushNotifications ? 'bg-[#16A34A]' : 'bg-gray-200'
                          }`}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${
                            pushNotifications ? 'right-0.5' : 'left-0.5'
                          }`} />
                        </button>
                      </div>

                      <div className="flex justify-between items-center text-[10.5px] py-1 text-[#6B7280]">
                        <span className="flex items-center space-x-2">
                          <span className="text-gray-400">⚙️</span>
                          <span>System Status Nodes</span>
                        </span>
                        <span className="font-bold text-[#16A34A] flex items-center">
                          <span className="w-1.5 h-1.5 bg-[#16A34A] rounded-full mr-1 animate-pulse" /> All Systems Green
                        </span>
                      </div>

                      {/* Interactive Language Selector */}
                      <div className="flex justify-between items-center text-[11px] font-medium text-[#17201A] py-1">
                        <span className="flex items-center space-x-2">
                          <span className="text-gray-400">🌐</span>
                          <span>Console Language</span>
                        </span>
                        <select
                          value={selectedLanguage}
                          onChange={(e) => {
                            setSelectedLanguage(e.target.value as any);
                            triggerToast(`Console translated to ${e.target.value}`, 'success');
                          }}
                          className="bg-gray-100 hover:bg-gray-200 text-[#17201A] text-[10px] font-bold py-1 px-2 rounded-lg border-none cursor-pointer"
                        >
                          <option value="English">English</option>
                          <option value="Tamil">Tamil</option>
                          <option value="Spanish">Spanish</option>
                        </select>
                      </div>
                    </div>

                    {/* SUPPORT CHANNELS */}
                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-3">
                      <h4 className="text-[10px] font-bold text-[#17201A] uppercase tracking-wider pb-1.5 border-b border-gray-50">Support & Compliance</h4>

                      <button onClick={() => triggerToast('Displaying FoodSave Admin emergency procedures.', 'info')} className="w-full flex justify-between items-center text-[11px] font-medium text-[#17201A] py-1">
                        <span className="flex items-center space-x-2">
                          <span className="text-gray-400">❓</span>
                          <span>Help & Support Channels</span>
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </button>

                      <button onClick={() => triggerToast('Displaying official FoodSave terms and policies.', 'info')} className="w-full flex justify-between items-center text-[11px] font-medium text-[#17201A] py-1">
                        <span className="flex items-center space-x-2">
                          <span className="text-gray-400">📄</span>
                          <span>Terms & Conditions Document</span>
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </button>

                      <button onClick={() => triggerToast('Displaying global user privacy declarations.', 'info')} className="w-full flex justify-between items-center text-[11px] font-medium text-[#17201A] py-1">
                        <span className="flex items-center space-x-2">
                          <span className="text-gray-400">🔒</span>
                          <span>Privacy Policy Guidelines</span>
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>

                    {/* LARGE LOGOUT BUTTON */}
                    <div className="pt-2">
                      <button
                        id="logout-btn-trigger"
                        onClick={() => setIsLogoutModalOpen(true)}
                        className="w-full py-3 border border-red-200 text-red-600 text-xs font-bold rounded-2xl hover:bg-red-50 flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout of FoodSave Admin</span>
                      </button>
                    </div>
                  </div>
                )}

              </div>

              {/* FIXED MOBILE BOTTOM NAVIGATION BAR */}
              <div className="bg-white border-t border-gray-100 px-2 py-1.5 flex justify-between items-center shrink-0 shadow-lg sticky bottom-0 z-30">
                
                {/* Tab 1: Dashboard */}
                <button
                  id="tab-dashboard"
                  onClick={() => {
                    setActiveTab('dashboard');
                    setShowNotificationsPage(false);
                  }}
                  className="flex-1 flex flex-col items-center justify-center relative py-1"
                >
                  <Home className={`w-5 h-5 transition-transform ${activeTab === 'dashboard' ? 'text-[#16A34A] scale-105' : 'text-[#6B7280]'}`} />
                  <span className={`text-[9px] mt-0.5 font-bold tracking-tight ${activeTab === 'dashboard' ? 'text-[#16A34A]' : 'text-[#6B7280]'}`}>
                    Dashboard
                  </span>
                  {activeTab === 'dashboard' && (
                    <div className="w-1.5 h-1.5 bg-[#16A34A] rounded-full absolute -top-1" />
                  )}
                </button>

                {/* Tab 2: Users */}
                <button
                  id="tab-users"
                  onClick={() => {
                    setActiveTab('users');
                    setShowNotificationsPage(false);
                  }}
                  className="flex-1 flex flex-col items-center justify-center relative py-1"
                >
                  <div className="relative">
                    <Users className={`w-5 h-5 transition-transform ${activeTab === 'users' ? 'text-[#16A34A] scale-105' : 'text-[#6B7280]'}`} />
                    {users.filter(u => u.status === 'Pending').length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-amber-500 w-2.5 h-2.5 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <span className={`text-[9px] mt-0.5 font-bold tracking-tight ${activeTab === 'users' ? 'text-[#16A34A]' : 'text-[#6B7280]'}`}>
                    Users
                  </span>
                  {activeTab === 'users' && (
                    <div className="w-1.5 h-1.5 bg-[#16A34A] rounded-full absolute -top-1" />
                  )}
                </button>

                {/* Tab 3: Donations */}
                <button
                  id="tab-donations"
                  onClick={() => {
                    setActiveTab('donations');
                    setShowNotificationsPage(false);
                  }}
                  className="flex-1 flex flex-col items-center justify-center relative py-1"
                >
                  <Package className={`w-5 h-5 transition-transform ${activeTab === 'donations' ? 'text-[#16A34A] scale-105' : 'text-[#6B7280]'}`} />
                  <span className={`text-[9px] mt-0.5 font-bold tracking-tight ${activeTab === 'donations' ? 'text-[#16A34A]' : 'text-[#6B7280]'}`}>
                    Donations
                  </span>
                  {activeTab === 'donations' && (
                    <div className="w-1.5 h-1.5 bg-[#16A34A] rounded-full absolute -top-1" />
                  )}
                </button>

                {/* Tab 4: Reports */}
                <button
                  id="tab-reports"
                  onClick={() => {
                    setActiveTab('reports');
                    setShowNotificationsPage(false);
                  }}
                  className="flex-1 flex flex-col items-center justify-center relative py-1"
                >
                  <div className="relative">
                    <BarChart3 className={`w-5 h-5 transition-transform ${activeTab === 'reports' ? 'text-[#16A34A] scale-105' : 'text-[#6B7280]'}`} />
                    {reports.filter(r => r.status === 'Pending').length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 w-2.5 h-2.5 rounded-full border-2 border-white animate-pulse" />
                    )}
                  </div>
                  <span className={`text-[9px] mt-0.5 font-bold tracking-tight ${activeTab === 'reports' ? 'text-[#16A34A]' : 'text-[#6B7280]'}`}>
                    Reports
                  </span>
                  {activeTab === 'reports' && (
                    <div className="w-1.5 h-1.5 bg-[#16A34A] rounded-full absolute -top-1" />
                  )}
                </button>

                {/* Tab 5: Profile */}
                <button
                  id="tab-profile"
                  onClick={() => {
                    setActiveTab('profile');
                    setShowNotificationsPage(false);
                  }}
                  className="flex-1 flex flex-col items-center justify-center relative py-1"
                >
                  <UserCircle2 className={`w-5 h-5 transition-transform ${activeTab === 'profile' ? 'text-[#16A34A] scale-105' : 'text-[#6B7280]'}`} />
                  <span className={`text-[9px] mt-0.5 font-bold tracking-tight ${activeTab === 'profile' ? 'text-[#16A34A]' : 'text-[#6B7280]'}`}>
                    Profile
                  </span>
                  {activeTab === 'profile' && (
                    <div className="w-1.5 h-1.5 bg-[#16A34A] rounded-full absolute -top-1" />
                  )}
                </button>

              </div>

            </div>
          )}

        </div>

        {/* Mock Physical Bottom Drag bar / Home Indicator */}
        <div className="bg-white py-2 flex justify-center shrink-0 relative select-none">
          <div className="w-32 h-1 bg-black rounded-full" />
        </div>

      </div>

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
        message="Are you absolutely sure you want to end your current secure session on this FoodSave platform node? You will need your admin credentials to login again."
        confirmText="Logout"
        type="danger"
      />

    </div>
  );
}
