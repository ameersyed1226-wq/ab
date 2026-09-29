import { useState } from 'react';
import { User, UserRole, UserStatus } from '../types';
import { Search, SlidersHorizontal, MapPin, CheckCircle, Clock, AlertTriangle, ShieldCheck, ArrowRight, UserCheck, UserX, Trash2, Eye, FileText } from 'lucide-react';
import { BottomSheet, ConfirmationModal, DocumentViewerModal } from './ModalSheets';

interface UserViewsProps {
  users: User[];
  onUpdateUserStatus: (userId: string, newStatus: UserStatus) => void;
  onVerifyUser: (userId: string) => void;
}

export function UserViews({ users, onUpdateUserStatus, onVerifyUser }: UserViewsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | 'Donors' | 'Volunteers' | 'NGOs' | 'Pending'>('All');
  
  // Modals & Bottom Sheets State
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [filterLocation, setFilterLocation] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  
  // Document Viewer & Confirmations
  const [isDocViewerOpen, setIsDocViewerOpen] = useState(false);
  const [viewingDocTitle, setViewingDocTitle] = useState('');
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    userId: string;
    action: 'Verify' | 'Suspend' | 'Block' | 'Unblock';
    userName: string;
  }>({
    isOpen: false,
    userId: '',
    action: 'Verify',
    userName: '',
  });

  // Extract unique locations for filtering
  const locations = ['All', ...Array.from(new Set(users.map((u) => u.location)))];

  // Tab Filtering logic
  const filteredByTab = users.filter((u) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Donors') return u.role === 'Donor';
    if (activeTab === 'Volunteers') return u.role === 'Volunteer';
    if (activeTab === 'NGOs') return u.role === 'NGO';
    if (activeTab === 'Pending') return u.status === 'Pending';
    return true;
  });

  // Search & Filter options logic
  const finalFilteredUsers = filteredByTab.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.role.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLocation = filterLocation === 'All' || u.location === filterLocation;
    const matchesStatus = filterStatus === 'All' || u.status === filterStatus;

    return matchesSearch && matchesLocation && matchesStatus;
  });

  // Reset Filters helper
  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterLocation('All');
    setFilterStatus('All');
    setActiveTab('All');
  };

  // Helper for status styling
  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case 'Verified':
        return (
          <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-[#166534] bg-[#DCFCE7] px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-[#16A34A] rounded-full animate-pulse" />
            <span>Verified</span>
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
            <span>Pending</span>
          </span>
        );
      case 'Suspended':
        return (
          <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
            <span>Suspended</span>
          </span>
        );
      case 'Blocked':
        return (
          <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full" />
            <span>Blocked</span>
          </span>
        );
    }
  };

  // Document verification modal launcher
  const handleViewDocument = (title: string) => {
    setViewingDocTitle(title);
    setIsDocViewerOpen(true);
  };

  // Confirm Actions helper
  const handleStatusAction = (userId: string, userName: string, action: 'Verify' | 'Suspend' | 'Block' | 'Unblock') => {
    setConfirmModal({
      isOpen: true,
      userId,
      userName,
      action,
    });
  };

  const executeStatusAction = () => {
    const { userId, action } = confirmModal;
    if (action === 'Verify') {
      onVerifyUser(userId);
      // If currently inspecting this user in detail, update their detail render state
      if (selectedUser?.id === userId) {
        setSelectedUser((prev) => prev ? { ...prev, status: 'Verified' } : null);
      }
    } else if (action === 'Suspend') {
      onUpdateUserStatus(userId, 'Suspended');
      if (selectedUser?.id === userId) {
        setSelectedUser((prev) => prev ? { ...prev, status: 'Suspended' } : null);
      }
    } else if (action === 'Block') {
      onUpdateUserStatus(userId, 'Blocked');
      if (selectedUser?.id === userId) {
        setSelectedUser((prev) => prev ? { ...prev, status: 'Blocked' } : null);
      }
    } else if (action === 'Unblock') {
      onUpdateUserStatus(userId, 'Verified');
      if (selectedUser?.id === userId) {
        setSelectedUser((prev) => prev ? { ...prev, status: 'Verified' } : null);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with Title & Custom Interactive Subtitle */}
      <div className="flex justify-between items-center px-4 pt-1">
        <div>
          <h2 className="text-lg font-bold text-[#17201A]">User Management</h2>
          <p className="text-[10px] text-[#6B7280]">Manage credentials and verification files.</p>
        </div>
        <span className="text-[10px] font-bold text-[#16A34A] bg-[#DCFCE7] px-2.5 py-1 rounded-full">
          {users.length} Active
        </span>
      </div>

      {/* Modern Search & Sticky Filter Ribbon */}
      <div className="px-4 flex space-x-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="user-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users by name..."
            className="w-full bg-white pl-9 pr-3 py-2.5 rounded-xl border border-gray-100 text-xs text-[#17201A] focus:outline-hidden focus:ring-1 focus:ring-[#16A34A] focus:border-[#16A34A] placeholder-gray-400"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-bold hover:text-gray-600"
            >
              ×
            </button>
          )}
        </div>
        <button
          id="user-filter-btn"
          onClick={() => setIsFilterSheetOpen(true)}
          className={`px-3 py-2.5 rounded-xl border text-xs font-semibold flex items-center space-x-1 transition-all ${
            filterLocation !== 'All' || filterStatus !== 'All'
              ? 'border-[#16A34A] bg-[#DCFCE7]/20 text-[#16A34A]'
              : 'border-gray-100 bg-white text-[#17201A] hover:bg-gray-50'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filter</span>
        </button>
      </div>

      {/* Horizontal Nav Tabs for Mobile Roles */}
      <div className="px-4 overflow-x-auto scrollbar-none">
        <div className="flex space-x-1.5 pb-1 min-w-max border-b border-gray-100">
          {(['All', 'Donors', 'Volunteers', 'NGOs', 'Pending'] as const).map((tab) => {
            const count = tab === 'All' ? users.length :
                          tab === 'Donors' ? users.filter(u => u.role === 'Donor').length :
                          tab === 'Volunteers' ? users.filter(u => u.role === 'Volunteer').length :
                          tab === 'NGOs' ? users.filter(u => u.role === 'NGO').length :
                          users.filter(u => u.status === 'Pending').length;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-1.5 text-xs font-semibold transition-all relative px-1 ${
                  activeTab === tab
                    ? 'text-[#16A34A] font-bold'
                    : 'text-[#6B7280] hover:text-[#17201A]'
                }`}
              >
                <span className="flex items-center space-x-1">
                  <span>{tab}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                    activeTab === tab ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {count}
                  </span>
                </span>
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#16A34A] rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Users Cards */}
      <div className="px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pb-8">
        {finalFilteredUsers.length > 0 ? (
          finalFilteredUsers.map((user) => (
            <div
              key={user.id}
              onClick={() => setSelectedUser(user)}
              className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-xs flex items-center justify-between hover:border-[#16A34A]/50 active:bg-[#F8FAF9] cursor-pointer transition-all hover:shadow-sm"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#F0F2F1] text-base flex items-center justify-center shrink-0 border border-gray-50 shadow-inner">
                  {user.avatar}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <h4 className="text-xs font-bold text-[#17201A] truncate max-w-[150px] md:max-w-[180px]">{user.name}</h4>
                    {getStatusBadge(user.status)}
                  </div>
                  <div className="flex items-center space-x-1.5 mt-1 text-[10px] text-[#6B7280]">
                    <span className="font-semibold bg-gray-50 text-gray-600 px-1.5 py-0.5 rounded-md text-[9px]">
                      {user.role}
                    </span>
                    <span className="flex items-center shrink-0">
                      <MapPin className="w-2.5 h-2.5 mr-0.5 text-gray-400" />
                      {user.location}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <span className="text-[10px] font-semibold text-[#16A34A]">View</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#16A34A]" />
              </div>
            </div>
          ))
        ) : (
          /* Empty Search and Filter States */
          <div className="py-12 text-center bg-white rounded-2xl border border-gray-100 p-4">
            <span className="text-3xl">👥</span>
            <h4 className="text-xs font-bold text-[#17201A] mt-2">No users matching search</h4>
            <p className="text-[10px] text-[#6B7280] mt-1 max-w-[200px] mx-auto leading-relaxed">
              We couldn't find any RePlate platform accounts with those constraints.
            </p>
            <button
              onClick={handleClearFilters}
              className="mt-3 px-3.5 py-1.5 bg-[#DCFCE7] text-[#166534] text-[10px] font-bold rounded-lg hover:bg-[#16A34A] hover:text-white transition-all"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* USER DETAILS BOTTOM SHEET */}
      <BottomSheet
        isOpen={selectedUser !== null}
        onClose={() => setSelectedUser(null)}
        title={selectedUser ? `${selectedUser.role} Details` : 'User Details'}
      >
        {selectedUser && (
          <div className="space-y-4">
            {/* Main Header Container */}
            <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-2xl border border-gray-100">
              <div className="w-12 h-12 bg-white rounded-xl text-2xl flex items-center justify-center border border-gray-100 shadow-xs">
                {selectedUser.avatar}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-[#17201A] truncate">{selectedUser.name}</h4>
                <p className="text-[10px] text-[#6B7280]">{selectedUser.email}</p>
                <div className="mt-1 flex items-center space-x-2">
                  <span className="text-[9px] font-bold bg-[#DCFCE7] text-[#166534] px-1.5 py-0.5 rounded">
                    {selectedUser.role}
                  </span>
                  {getStatusBadge(selectedUser.status)}
                </div>
              </div>
            </div>

            {/* General Info Metadata */}
            <div className="bg-white rounded-2xl border border-gray-100 p-3.5 space-y-2.5 text-[10.5px]">
              <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                <span className="text-[#6B7280]">Registered On</span>
                <span className="font-semibold text-[#17201A]">{selectedUser.regDate}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                <span className="text-[#6B7280]">Phone Number</span>
                <span className="font-semibold text-[#17201A]">{selectedUser.phone}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#6B7280]">City Location</span>
                <span className="font-semibold text-[#17201A] flex items-center">
                  <MapPin className="w-3 h-3 text-[#16A34A] mr-0.5" />
                  {selectedUser.location}
                </span>
              </div>
            </div>

            {/* Performance Statistics Metrics Card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-3">
              <h5 className="text-[10px] font-bold text-[#17201A] uppercase tracking-wider mb-2.5">Rescue Metrics</h5>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-[#F8FAF9] p-2 rounded-xl">
                  <span className="block text-[14px] font-extrabold text-[#17201A]">
                    {selectedUser.role === 'Donor' ? selectedUser.stats.donations : selectedUser.stats.pickups}
                  </span>
                  <span className="text-[8.5px] text-[#6B7280] font-medium">
                    {selectedUser.role === 'Donor' ? 'Donated' : 'Pickups'}
                  </span>
                </div>
                <div className="bg-[#F8FAF9] p-2 rounded-xl">
                  <span className="block text-[14px] font-extrabold text-[#17201A]">{selectedUser.stats.completed}</span>
                  <span className="text-[8.5px] text-[#6B7280] font-medium">Completed</span>
                </div>
                <div className="bg-[#F8FAF9] p-2 rounded-xl">
                  <span className="block text-[14px] font-extrabold text-[#16A34A]">
                    {selectedUser.stats.completed > 0 ? `${Math.round((selectedUser.stats.completed / (selectedUser.role === 'Donor' ? (selectedUser.stats.donations || 1) : (selectedUser.stats.pickups || 1))) * 100)}%` : '100%'}
                  </span>
                  <span className="text-[8.5px] text-[#6B7280] font-medium">Success Rate</span>
                </div>
              </div>
            </div>

            {/* Document Verification Drawer (If NGO or Volunteer Pending Verification) */}
            {selectedUser.status === 'Pending' && selectedUser.documents && (
              <div className="bg-amber-50/50 rounded-2xl border border-amber-100 p-3.5 space-y-3">
                <div className="flex items-center space-x-1.5 text-[#D97706]">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span className="text-[11px] font-bold">Action Needed: Pending Verification</span>
                </div>
                
                <div className="space-y-1.5">
                  <button
                    onClick={() => handleViewDocument(selectedUser.documents!.certName)}
                    className="w-full flex items-center justify-between p-2.5 bg-white border border-gray-100 rounded-xl hover:border-[#16A34A] transition-all"
                  >
                    <div className="flex items-center space-x-2 min-w-0">
                      <FileText className="w-4 h-4 text-[#16A34A] shrink-0" />
                      <span className="text-[10px] font-bold text-[#17201A] truncate text-left">
                        {selectedUser.documents.certName}
                      </span>
                    </div>
                    <span className="text-[9px] font-bold text-[#16A34A] bg-[#DCFCE7] px-2 py-0.5 rounded flex items-center">
                      <Eye className="w-2.5 h-2.5 mr-0.5" /> View
                    </span>
                  </button>

                  <button
                    onClick={() => handleViewDocument(selectedUser.documents!.idName)}
                    className="w-full flex items-center justify-between p-2.5 bg-white border border-gray-100 rounded-xl hover:border-[#16A34A] transition-all"
                  >
                    <div className="flex items-center space-x-2 min-w-0">
                      <FileText className="w-4 h-4 text-[#16A34A] shrink-0" />
                      <span className="text-[10px] font-bold text-[#17201A] truncate text-left">
                        {selectedUser.documents.idName}
                      </span>
                    </div>
                    <span className="text-[9px] font-bold text-[#16A34A] bg-[#DCFCE7] px-2 py-0.5 rounded flex items-center">
                      <Eye className="w-2.5 h-2.5 mr-0.5" /> View
                    </span>
                  </button>
                </div>

                <div className="flex space-x-2 pt-1.5">
                  <button
                    id="reject-user-btn"
                    onClick={() => handleStatusAction(selectedUser.id, selectedUser.name, 'Block')}
                    className="flex-1 py-2 bg-red-50 text-red-600 border border-red-100 text-[10px] font-bold rounded-lg hover:bg-red-100 transition-all"
                  >
                    Reject Verified Application
                  </button>
                  <button
                    id="approve-user-btn"
                    onClick={() => handleStatusAction(selectedUser.id, selectedUser.name, 'Verify')}
                    className="flex-1 py-2 bg-[#16A34A] text-white text-[10px] font-bold rounded-lg shadow-xs hover:bg-[#166534] transition-all"
                  >
                    Approve Verification
                  </button>
                </div>
              </div>
            )}

            {/* Standard Verified Admin Controls */}
            <div className="space-y-2 pt-2">
              <h5 className="text-[10px] font-bold text-[#17201A] uppercase tracking-wider">Administrative Actions</h5>
              <div className="grid grid-cols-2 gap-2">
                {selectedUser.status === 'Verified' ? (
                  <>
                    <button
                      id="suspend-user-action"
                      onClick={() => handleStatusAction(selectedUser.id, selectedUser.name, 'Suspend')}
                      className="py-2.5 border border-amber-200 text-amber-600 hover:bg-amber-50 rounded-xl text-[10.5px] font-semibold flex items-center justify-center space-x-1 transition-all"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Suspend Profile</span>
                    </button>
                    <button
                      id="block-user-action"
                      onClick={() => handleStatusAction(selectedUser.id, selectedUser.name, 'Block')}
                      className="py-2.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-[10.5px] font-semibold flex items-center justify-center space-x-1 transition-all"
                    >
                      <UserX className="w-3.5 h-3.5" />
                      <span>Block Access</span>
                    </button>
                  </>
                ) : selectedUser.status === 'Suspended' || selectedUser.status === 'Blocked' ? (
                  <button
                    id="unblock-user-action"
                    onClick={() => handleStatusAction(selectedUser.id, selectedUser.name, 'Unblock')}
                    className="col-span-2 py-2.5 bg-[#16A34A] text-white rounded-xl text-[10.5px] font-semibold flex items-center justify-center space-x-1 shadow-xs hover:bg-[#166534] transition-all"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Restore Account Privileges</span>
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </BottomSheet>

      {/* FILTER BOTTOM SHEET */}
      <BottomSheet
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        title="Filter Platform Users"
      >
        <div className="space-y-4">
          {/* Location Filter Category */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-[#17201A] uppercase tracking-wider">Location</span>
            <div className="flex flex-wrap gap-1.5">
              {locations.map((loc) => (
                <button
                  key={loc}
                  onClick={() => setFilterLocation(loc)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                    filterLocation === loc
                      ? 'bg-[#16A34A] text-white'
                      : 'bg-gray-100 text-[#6B7280] hover:bg-gray-200'
                  }`}
                >
                  {loc === 'All' ? 'All Locations' : loc}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter Category */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-[#17201A] uppercase tracking-wider">Status</span>
            <div className="flex flex-wrap gap-1.5">
              {['All', 'Verified', 'Pending', 'Suspended', 'Blocked'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                    filterStatus === st
                      ? 'bg-[#16A34A] text-white'
                      : 'bg-gray-100 text-[#6B7280] hover:bg-gray-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="flex space-x-2 pt-2 border-t border-gray-50">
            <button
              onClick={handleClearFilters}
              className="flex-1 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-[#6B7280]"
            >
              Reset Filters
            </button>
            <button
              onClick={() => setIsFilterSheetOpen(false)}
              className="flex-1 py-2 bg-[#16A34A] text-white text-xs font-semibold rounded-xl shadow-xs"
            >
              Apply Filter
            </button>
          </div>
        </div>
      </BottomSheet>

      {/* DOCUMENT VIEWER MODAL */}
      <DocumentViewerModal
        isOpen={isDocViewerOpen}
        onClose={() => setIsDocViewerOpen(false)}
        documentTitle={viewingDocTitle}
        userName={selectedUser?.name || ''}
        regId={selectedUser?.regId}
      />

      {/* ACTION CONFIRMATION MODAL */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={executeStatusAction}
        title={`${confirmModal.action} ${confirmModal.userName}`}
        message={`Are you absolutely sure you want to perform the "${confirmModal.action}" administrative override for ${confirmModal.userName}? They will be notified immediately.`}
        confirmText={confirmModal.action}
        type={confirmModal.action === 'Verify' || confirmModal.action === 'Unblock' ? 'success' : 'danger'}
      />
    </div>
  );
}
