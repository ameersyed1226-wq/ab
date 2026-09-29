import { useState } from 'react';
import { Donation, DonationStatus, FoodType } from '../types';
import { Search, MapPin, Clock, Calendar, CheckCircle2, User, HelpCircle, ChevronRight, XCircle, FileClock, ShieldCheck } from 'lucide-react';
import { BottomSheet, ConfirmationModal } from './ModalSheets';

interface DonationViewsProps {
  donations: Donation[];
  onUpdateDonationStatus: (donationId: string, newStatus: DonationStatus) => void;
}

export function DonationViews({ donations, onUpdateDonationStatus }: DonationViewsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | 'Active' | 'Accepted' | 'Picked Up' | 'Delivered' | 'Expired'>('All');
  
  // Selected Donation details drawer state
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    donationId: string;
    newStatus: DonationStatus;
    foodName: string;
  }>({
    isOpen: false,
    donationId: '',
    newStatus: 'Expired',
    foodName: '',
  });

  // Tab Filtering
  const filteredByTab = donations.filter((d) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Active') return d.status === 'Active';
    if (activeTab === 'Accepted') return d.status === 'Accepted';
    if (activeTab === 'Picked Up') return d.status === 'Picked Up';
    if (activeTab === 'Delivered') return d.status === 'Delivered';
    if (activeTab === 'Expired') return d.status === 'Expired';
    return true;
  });

  // Search filter
  const finalFilteredDonations = filteredByTab.filter((d) => {
    return d.foodName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           d.donorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           d.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
           (d.volunteerName && d.volunteerName.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  const getStatusBadge = (status: DonationStatus) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center space-x-1 text-[9.5px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
            <span className="w-1.5 h-1.5 bg-[#16A34A] rounded-full animate-pulse" />
            <span>Active</span>
          </span>
        );
      case 'Accepted':
        return (
          <span className="inline-flex items-center space-x-1 text-[9.5px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
            <span>Accepted</span>
          </span>
        );
      case 'Picked Up':
        return (
          <span className="inline-flex items-center space-x-1 text-[9.5px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
            <span>Picked Up</span>
          </span>
        );
      case 'Delivered':
        return (
          <span className="inline-flex items-center space-x-1 text-[9.5px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />
            <span>Delivered</span>
          </span>
        );
      case 'Expired':
        return (
          <span className="inline-flex items-center space-x-1 text-[9.5px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
            <span>Expired</span>
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center space-x-1 text-[9.5px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
            <span>Cancelled</span>
          </span>
        );
    }
  };

  const getFoodTypeBadge = (type: FoodType) => {
    switch (type) {
      case 'Vegetarian':
        return <span className="text-[9px] font-bold text-green-700 bg-green-50 border border-green-100 px-1.5 py-0.5 rounded">VEG</span>;
      case 'Non-Vegetarian':
        return <span className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded">NON-VEG</span>;
      case 'Vegan':
        return <span className="text-[9px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded">VEGAN</span>;
    }
  };

  const handleUpdateStatusAction = (donationId: string, foodName: string, status: DonationStatus) => {
    setConfirmModal({
      isOpen: true,
      donationId,
      newStatus: status,
      foodName,
    });
  };

  const executeStatusChange = () => {
    const { donationId, newStatus } = confirmModal;
    onUpdateDonationStatus(donationId, newStatus);
    if (selectedDonation?.id === donationId) {
      setSelectedDonation((prev) => prev ? { ...prev, status: newStatus } : null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Sticky Header Row */}
      <div className="flex justify-between items-center px-4 pt-1">
        <div>
          <h2 className="text-lg font-bold text-[#17201A]">Donation Monitoring</h2>
          <p className="text-[10px] text-[#6B7280]">Real-time tracking of surplus rescue cycles.</p>
        </div>
        <span className="text-[10px] font-bold text-[#16A34A] bg-[#DCFCE7] px-2.5 py-1 rounded-full animate-pulse">
          Live feed
        </span>
      </div>

      {/* Modern Compact Search Bar */}
      <div className="px-4">
        <div className="relative">
          <Search className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="donation-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search food item, donor, or volunteer..."
            className="w-full bg-white pl-9 pr-3 py-2.5 rounded-xl border border-gray-100 text-xs text-[#17201A] focus:outline-hidden focus:ring-1 focus:ring-[#16A34A] focus:border-[#16A34A]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Horizontal Nav Tabs */}
      <div className="px-4 overflow-x-auto scrollbar-none">
        <div className="flex space-x-1.5 pb-1 min-w-max border-b border-gray-100">
          {(['All', 'Active', 'Accepted', 'Picked Up', 'Delivered', 'Expired'] as const).map((tab) => {
            const count = tab === 'All' ? donations.length : donations.filter(d => d.status === tab).length;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-1.5 text-xs font-semibold transition-all relative px-1 ${
                  activeTab === tab ? 'text-[#16A34A] font-bold' : 'text-[#6B7280]'
                }`}
              >
                <span className="flex items-center space-x-1">
                  <span>{tab}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                    activeTab === tab ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-gray-100'
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

      {/* Main Donation Cards Feed */}
      <div className="px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pb-8">
        {finalFilteredDonations.length > 0 ? (
          finalFilteredDonations.map((d) => (
            <div
              key={d.id}
              onClick={() => setSelectedDonation(d)}
              className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-xs flex flex-col hover:border-[#16A34A]/50 transition-all cursor-pointer active:bg-[#F8FAF9] hover:shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#DCFCE7]/20 text-xl flex items-center justify-center border border-gray-50 shrink-0">
                    {d.foodImage}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-[#17201A] truncate">{d.foodName}</h4>
                    <span className="text-[10px] text-[#6B7280] font-semibold">{d.quantity}</span>
                  </div>
                </div>
                {getStatusBadge(d.status)}
              </div>

              {/* Quick info grid */}
              <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 border-t border-dashed border-gray-100 pt-2.5 mt-2.5 text-[10px] text-[#6B7280]">
                <div className="flex items-center min-w-0">
                  <span className="font-bold text-[#17201A] truncate max-w-[120px]">{d.donorName}</span>
                </div>
                <div className="flex items-center justify-end">
                  <MapPin className="w-2.5 h-2.5 mr-0.5 text-gray-400 shrink-0" />
                  <span className="truncate">{d.location}</span>
                </div>
                <div className="flex items-center text-[9px]">
                  <Clock className="w-2.5 h-2.5 mr-1 text-gray-400 shrink-0" />
                  <span>Prep: {d.preparedTime.split(',').pop()?.trim()}</span>
                </div>
                <div className="flex items-center justify-end text-[9px] text-red-500 font-medium">
                  <Clock className="w-2.5 h-2.5 mr-0.5 shrink-0" />
                  <span>Exp: {d.expiryTime.split(',').pop()?.trim()}</span>
                </div>
              </div>

              {/* Assigned volunteer block */}
              {d.volunteerName && (
                <div className="mt-2.5 pt-2 border-t border-gray-50 flex justify-between items-center text-[9.5px]">
                  <span className="text-[#6B7280] flex items-center">
                    <User className="w-3 h-3 mr-1 text-gray-400" />
                    Volunteer: <span className="font-semibold text-[#17201A] ml-1">{d.volunteerName}</span>
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDonation(d);
                    }}
                    className="text-[#16A34A] font-bold hover:underline"
                  >
                    View Timeline →
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          /* Empty Donation Filter State */
          <div className="py-12 text-center bg-white rounded-2xl border border-gray-100 p-4">
            <span className="text-3xl">📦</span>
            <h4 className="text-xs font-bold text-[#17201A] mt-2">No donations match constraints</h4>
            <p className="text-[10px] text-[#6B7280] mt-1 max-w-[200px] mx-auto leading-relaxed">
              There is no active food donation matching your selected filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveTab('All');
              }}
              className="mt-3 px-3.5 py-1.5 bg-[#DCFCE7] text-[#166534] text-[10px] font-bold rounded-lg hover:bg-[#16A34A] hover:text-white transition-all"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* DONATION DETAILS DRAWET */}
      <BottomSheet
        isOpen={selectedDonation !== null}
        onClose={() => setSelectedDonation(null)}
        title="Donation Tracker"
      >
        {selectedDonation && (
          <div className="space-y-4">
            {/* Header info block */}
            <div className="flex items-center space-x-3 bg-[#F8FAF9] p-3 rounded-2xl border border-gray-100">
              <div className="w-12 h-12 bg-white rounded-xl text-2xl flex items-center justify-center border border-gray-100 shrink-0">
                {selectedDonation.foodImage}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-1.5">
                  <h4 className="text-sm font-bold text-[#17201A] truncate">{selectedDonation.foodName}</h4>
                  {getFoodTypeBadge(selectedDonation.foodType)}
                </div>
                <p className="text-[10.5px] font-bold text-[#16A34A] mt-0.5">{selectedDonation.quantity}</p>
                <div className="mt-1 flex items-center space-x-2">
                  <span className="text-[9px] font-semibold text-gray-500">ID: FS-{selectedDonation.id.toUpperCase()}</span>
                  {getStatusBadge(selectedDonation.status)}
                </div>
              </div>
            </div>

            {/* Donor & Volunteer verification details */}
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="bg-white p-2.5 rounded-xl border border-gray-100">
                <span className="text-[#6B7280] block text-[9px] uppercase tracking-wider mb-1">Donor</span>
                <span className="font-bold text-[#17201A] block truncate">{selectedDonation.donorName}</span>
                <span className="text-green-600 font-semibold flex items-center mt-1">
                  <ShieldCheck className="w-3 h-3 mr-0.5 text-green-500" /> RePlate Verified
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-gray-100">
                <span className="text-[#6B7280] block text-[9px] uppercase tracking-wider mb-1">Volunteer</span>
                <span className="font-bold text-[#17201A] block truncate">{selectedDonation.volunteerName || 'Unassigned'}</span>
                {selectedDonation.volunteerName ? (
                  <span className="text-green-600 font-semibold flex items-center mt-1">
                    <ShieldCheck className="w-3 h-3 mr-0.5 text-green-500" /> Verified Driver
                  </span>
                ) : (
                  <span className="text-amber-600 font-semibold flex items-center mt-1">
                    Pending Acceptance
                  </span>
                )}
              </div>
            </div>

            {/* Time constraints info */}
            <div className="bg-white rounded-xl border border-gray-100 p-2.5 text-[10px] space-y-1.5">
              <div className="flex justify-between items-center text-gray-600">
                <span>Prepared Time</span>
                <span className="font-bold text-[#17201A]">{selectedDonation.preparedTime}</span>
              </div>
              <div className="flex justify-between items-center text-red-500">
                <span className="font-medium">Consume Before</span>
                <span className="font-extrabold">{selectedDonation.expiryTime}</span>
              </div>
            </div>

            {/* VERTICAL STATUS TIMELINE */}
            <div className="bg-white rounded-2xl border border-gray-100 p-3.5">
              <h5 className="text-[10px] font-bold text-[#17201A] uppercase tracking-wider mb-3">Fulfillment Timeline</h5>
              <div className="space-y-4 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1.5px] before:bg-gray-100">
                {/* 1. Posted */}
                <div className="flex items-start space-x-3 relative">
                  <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0 border-4 border-white z-10 shadow-xs">
                    ✓
                  </div>
                  <div className="text-[10px]">
                    <h6 className="font-bold text-[#17201A]">Donation Posted</h6>
                    <p className="text-[9px] text-[#6B7280]">Registered on platform by {selectedDonation.donorName}</p>
                    <span className="text-[8px] text-[#6B7280] font-semibold mt-0.5 block">{selectedDonation.timeline.posted || selectedDonation.preparedTime}</span>
                  </div>
                </div>

                {/* 2. Accepted */}
                <div className="flex items-start space-x-3 relative">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-4 border-white z-10 shadow-xs ${
                    selectedDonation.timeline.accepted ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400 font-semibold text-xs'
                  }`}>
                    {selectedDonation.timeline.accepted ? '✓' : '•'}
                  </div>
                  <div className="text-[10px]">
                    <h6 className={`font-bold ${selectedDonation.timeline.accepted ? 'text-[#17201A]' : 'text-gray-400'}`}>Volunteer Accepted</h6>
                    <p className="text-[9px] text-[#6B7280]">
                      {selectedDonation.volunteerName ? `Assigned to ${selectedDonation.volunteerName}` : 'Awaiting dispatch confirmation'}
                    </p>
                    {selectedDonation.timeline.accepted && (
                      <span className="text-[8px] text-[#6B7280] font-semibold mt-0.5 block">{selectedDonation.timeline.accepted}</span>
                    )}
                  </div>
                </div>

                {/* 3. Picked Up */}
                <div className="flex items-start space-x-3 relative">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-4 border-white z-10 shadow-xs ${
                    selectedDonation.timeline.pickedUp ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400 font-semibold text-xs'
                  }`}>
                    {selectedDonation.timeline.pickedUp ? '✓' : '•'}
                  </div>
                  <div className="text-[10px]">
                    <h6 className={`font-bold ${selectedDonation.timeline.pickedUp ? 'text-[#17201A]' : 'text-gray-400'}`}>Food Picked Up</h6>
                    <p className="text-[9px] text-[#6B7280]">Food package loaded and quality check verified at pickup point.</p>
                    {selectedDonation.timeline.pickedUp && (
                      <span className="text-[8px] text-[#6B7280] font-semibold mt-0.5 block">{selectedDonation.timeline.pickedUp}</span>
                    )}
                  </div>
                </div>

                {/* 4. Delivered */}
                <div className="flex items-start space-x-3 relative">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-4 border-white z-10 shadow-xs ${
                    selectedDonation.timeline.delivered ? 'bg-[#16A34A] text-white font-bold' : 
                    selectedDonation.status === 'Expired' ? 'bg-red-500 text-white' :
                    selectedDonation.status === 'Cancelled' ? 'bg-gray-400 text-white' :
                    'bg-gray-100 text-gray-400 font-semibold text-xs'
                  }`}>
                    {selectedDonation.timeline.delivered ? '✓' : 
                     selectedDonation.status === 'Expired' || selectedDonation.status === 'Cancelled' ? '×' : '•'}
                  </div>
                  <div className="text-[10px]">
                    <h6 className={`font-bold ${
                      selectedDonation.timeline.delivered ? 'text-[#16A34A]' :
                      selectedDonation.status === 'Expired' ? 'text-red-500' :
                      selectedDonation.status === 'Cancelled' ? 'text-gray-400' : 'text-gray-400'
                    }`}>
                      {selectedDonation.status === 'Expired' ? 'Donation Expired' : 
                       selectedDonation.status === 'Cancelled' ? 'Donation Cancelled' : 'Food Delivered'}
                    </h6>
                    <p className="text-[9px] text-[#6B7280]">
                      {selectedDonation.status === 'Expired' ? 'Marked expired by system audit' :
                       selectedDonation.status === 'Cancelled' ? 'Cancelled by admin instruction' :
                       selectedDonation.timeline.delivered ? 'Delivered and community support registered' : 'Awaiting delivery receipt upload'}
                    </p>
                    {selectedDonation.timeline.delivered && (
                      <span className="text-[8px] text-[#6B7280] font-semibold mt-0.5 block">{selectedDonation.timeline.delivered}</span>
                    )}
                    {selectedDonation.timeline.expired && (
                      <span className="text-[8px] text-red-500 font-semibold mt-0.5 block">{selectedDonation.timeline.expired}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Admin Actions inside bottom sheet */}
            {selectedDonation.status !== 'Delivered' && selectedDonation.status !== 'Expired' && selectedDonation.status !== 'Cancelled' && (
              <div className="space-y-2 pt-2">
                <h5 className="text-[10px] font-bold text-[#17201A] uppercase tracking-wider">Administrative Interventions</h5>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    id="mark-expired-btn"
                    onClick={() => handleUpdateStatusAction(selectedDonation.id, selectedDonation.foodName, 'Expired')}
                    className="py-2.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-[10px] font-semibold flex items-center justify-center space-x-1 transition-colors"
                  >
                    <FileClock className="w-3.5 h-3.5" />
                    <span>Force Expired</span>
                  </button>
                  <button
                    id="cancel-donation-btn"
                    onClick={() => handleUpdateStatusAction(selectedDonation.id, selectedDonation.foodName, 'Cancelled')}
                    className="py-2.5 border border-gray-200 text-gray-500 hover:bg-gray-50 rounded-xl text-[10px] font-semibold flex items-center justify-center space-x-1 transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Cancel Donation</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </BottomSheet>

      {/* CONFIRMATION OVERLAY */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={executeStatusChange}
        title={`Set status to ${confirmModal.newStatus}?`}
        message={`This will permanently update "${confirmModal.foodName}" status to ${confirmModal.newStatus} on the public feed. All assigned users will be synchronized.`}
        confirmText={`Set as ${confirmModal.newStatus}`}
        type="danger"
      />
    </div>
  );
}
