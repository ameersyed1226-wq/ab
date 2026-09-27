import { useState } from 'react';
import { ComplaintReport, ReportStatus, ReportType } from '../types';
import { AreaAnalyticsChart, DonationActivityChart, FoodTypeDistributionChart } from './AnalyticsCharts';
import { FileDown, Calendar, AlertTriangle, ShieldCheck, User, ArrowRight, Eye, ShieldAlert, Heart, ClipboardCheck, ChevronRight, Check } from 'lucide-react';
import { BottomSheet, ConfirmationModal, ExportReportModal } from './ModalSheets';

interface ReportViewsProps {
  reports: ComplaintReport[];
  onUpdateReportStatus: (reportId: string, newStatus: ReportStatus) => void;
  onExportComplete: (format: string) => void;
}

export function ReportViews({ reports, onUpdateReportStatus, onExportComplete }: ReportViewsProps) {
  const [activeSection, setActiveSection] = useState<'analytics' | 'complaints'>('analytics');
  
  // Date filter for analytics page
  const [dateFilter, setDateFilter] = useState<'Today' | '7 Days' | '30 Days' | 'This Year'>('7 Days');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Complaints state
  const [complaintTab, setComplaintTab] = useState<'All' | 'Pending' | 'Investigating' | 'Resolved'>('All');
  const [selectedReport, setSelectedReport] = useState<ComplaintReport | null>(null);
  
  // Confirmation states
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    reportId: string;
    action: 'Investigate' | 'Resolve' | 'Reject';
    reportType: string;
  }>({
    isOpen: false,
    reportId: '',
    action: 'Investigate',
    reportType: '',
  });

  // Sample volunteer activity data as specified (simple activity lists)
  const topVolunteers = [
    { name: 'Rahul Kumar', pickups: 84, meals: 1240, location: 'Chidambaram' },
    { name: 'Suresh Kumar', pickups: 72, meals: 950, location: 'Chennai' },
    { name: 'Meera Nair', pickups: 56, meals: 680, location: 'Puducherry' },
  ];

  // Filter complaints tab logic
  const filteredReports = reports.filter((r) => {
    if (complaintTab === 'All') return true;
    if (complaintTab === 'Pending') return r.status === 'Pending';
    if (complaintTab === 'Investigating') return r.status === 'Investigating';
    if (complaintTab === 'Resolved') return r.status === 'Resolved';
    return true;
  });

  const getReportStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="inline-flex items-center space-x-1 text-[9px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
            <span>Pending</span>
          </span>
        );
      case 'Investigating':
        return (
          <span className="inline-flex items-center space-x-1 text-[9px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            <span>Investigation</span>
          </span>
        );
      case 'Resolved':
        return (
          <span className="inline-flex items-center space-x-1 text-[9px] font-bold text-[#166534] bg-[#DCFCE7] px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-[#16A34A] rounded-full" />
            <span>Resolved</span>
          </span>
        );
    }
  };

  const handleReportAction = (reportId: string, type: string, action: 'Investigate' | 'Resolve' | 'Reject') => {
    setConfirmModal({
      isOpen: true,
      reportId,
      action,
      reportType: type,
    });
  };

  const executeReportAction = () => {
    const { reportId, action } = confirmModal;
    const nextStatusMap: Record<'Investigate' | 'Resolve' | 'Reject', ReportStatus> = {
      Investigate: 'Investigating',
      Resolve: 'Resolved',
      Reject: 'Resolved', // Reject marks ticket resolved without taking penalty action
    };

    onUpdateReportStatus(reportId, nextStatusMap[action]);

    if (selectedReport?.id === reportId) {
      setSelectedReport((prev) => prev ? { ...prev, status: nextStatusMap[action] } : null);
    }
  };

  return (
    <div className="space-y-3.5">
      {/* Dynamic Navigation Section Selector */}
      <div className="px-4 pt-1 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-[#17201A]">Reports & Analytics</h2>
          <p className="text-[10px] text-[#6B7280]">Consolidated metrics and quality controls.</p>
        </div>
      </div>

      {/* Segmented Top Control Toggle */}
      <div className="px-4">
        <div className="bg-[#F1F3F2] p-1 rounded-xl flex">
          <button
            onClick={() => setActiveSection('analytics')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeSection === 'analytics'
                ? 'bg-white text-[#16A34A] shadow-xs'
                : 'text-[#6B7280] hover:text-[#17201A]'
            }`}
          >
            📊 Analytics Summary
          </button>
          <button
            onClick={() => setActiveSection('complaints')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeSection === 'complaints'
                ? 'bg-white text-[#16A34A] shadow-xs'
                : 'text-[#6B7280] hover:text-[#17201A]'
            }`}
          >
            ⚠ Complaints & Issues ({reports.filter(r => r.status !== 'Resolved').length})
          </button>
        </div>
      </div>

      {/* SECTION 1: ANALYTICS DASHBOARD */}
      {activeSection === 'analytics' ? (
        <div className="space-y-4 max-h-[500px] overflow-y-auto px-4 pb-12">
          
          {/* Quick Date filter button */}
          <div className="flex justify-between items-center bg-white p-2.5 rounded-2xl border border-gray-100">
            <span className="text-[10px] font-bold text-gray-500 uppercase">Reporting Scope</span>
            <div className="relative">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                className="bg-gray-100 hover:bg-gray-200 text-[#17201A] text-[10.5px] font-bold py-1 px-2.5 rounded-lg border-none focus:ring-1 focus:ring-[#16A34A] cursor-pointer"
              >
                <option value="Today">Today</option>
                <option value="7 Days">Last 7 Days</option>
                <option value="30 Days">Last 30 Days</option>
                <option value="This Year">This Year</option>
              </select>
            </div>
          </div>

          {/* Core Summary Cards Grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white rounded-2xl p-3 border border-gray-100 shadow-xs">
              <span className="text-[#6B7280] text-[9.5px] font-medium block">Total Donations</span>
              <span className="text-sm font-extrabold text-[#17201A] block mt-0.5">4,892</span>
              <span className="text-[8px] text-[#16A34A] font-bold mt-1 block">↑ 8.2% vs last month</span>
            </div>

            <div className="bg-[#DCFCE7] rounded-2xl p-3 border border-green-100">
              <span className="text-[#166534] text-[9.5px] font-bold block">Meals Rescued</span>
              <span className="text-sm font-black text-[#166534] block mt-0.5">58,420</span>
              <span className="text-[8px] text-[#166534] font-semibold mt-1 block">Save Food. Share Hope.</span>
            </div>

            <div className="bg-white rounded-2xl p-3 border border-gray-100 shadow-xs">
              <span className="text-[#6B7280] text-[9.5px] font-medium block">Completed Pickups</span>
              <span className="text-sm font-extrabold text-[#17201A] block mt-0.5">4,620</span>
              <span className="text-[8px] text-green-600 font-bold mt-1 block">94.4% success rate</span>
            </div>

            <div className="bg-white rounded-2xl p-3 border border-gray-100 shadow-xs">
              <span className="text-[#6B7280] text-[9.5px] font-medium block">Expired Donations</span>
              <span className="text-sm font-extrabold text-red-500 block mt-0.5">272</span>
              <span className="text-[8px] text-red-500 font-bold mt-1 block">↓ 1.4% wastage drop</span>
            </div>
          </div>

          {/* Highlighted Rescue Card */}
          <div className="bg-gradient-to-r from-[#DCFCE7] to-[#F1FDF5] rounded-2xl p-3.5 border border-green-100 flex items-center space-x-3 shadow-xs">
            <div className="w-10 h-10 bg-white rounded-xl text-lg flex items-center justify-center border border-green-100 shrink-0 shadow-xs">
              🍱
            </div>
            <div>
              <span className="text-[9px] font-bold text-green-800 uppercase tracking-wider block">Eco Impact Milestone</span>
              <h4 className="text-sm font-black text-[#166534]">58,420 Meals Saved</h4>
              <p className="text-[9.5px] text-[#166534] opacity-90 font-medium">Successfully rescued from local commercial landfill waste.</p>
            </div>
          </div>

          {/* Custom Dynamic Activity Chart */}
          <DonationActivityChart />

          {/* Donut chart for type distribution */}
          <FoodTypeDistributionChart />

          {/* Area horizontal bar chart */}
          <AreaAnalyticsChart />

          {/* Active Volunteer List without rank language */}
          <div className="bg-white rounded-2xl p-4 border border-[#F0F2F1] shadow-xs">
            <h3 className="text-sm font-bold text-[#17201A] mb-3">Active Volunteers Contribution</h3>
            <div className="divide-y divide-gray-50 space-y-2.5">
              {topVolunteers.map((vol, idx) => (
                <div key={idx} className="flex items-center justify-between pt-2.5 first:pt-0">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#F8FAF9] flex items-center justify-center text-xs text-[#16A34A] font-bold border border-gray-50">
                      👨
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-[#17201A] truncate">{vol.name}</h4>
                      <span className="text-[8.5px] text-[#6B7280] font-semibold">{vol.location}</span>
                    </div>
                  </div>
                  <div className="text-right text-[10px]">
                    <span className="font-bold text-[#17201A] block">{vol.pickups} pickups</span>
                    <span className="text-[8.5px] text-[#16A34A] font-semibold">{vol.meals} meals delivered</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* EXPORT DATA PRIMARY BUTTON */}
          <div className="pt-2">
            <button
              id="export-report-launcher"
              onClick={() => setIsExportModalOpen(true)}
              className="w-full py-3 bg-[#16A34A] text-white text-xs font-bold rounded-2xl shadow-md hover:bg-[#166534] flex items-center justify-center space-x-1.5 transition-all"
            >
              <FileDown className="w-4 h-4" />
              <span>Export Platform Report</span>
            </button>
          </div>
        </div>
      ) : (
        /* SECTION 2: COMPLAINTS & ISSUE REPORTS */
        <div className="space-y-3 max-h-[500px] overflow-y-auto px-4 pb-12">
          
          {/* horizontal scroll tab selector for Issues */}
          <div className="flex space-x-1.5 border-b border-gray-100 pb-1 overflow-x-auto scrollbar-none">
            {(['All', 'Pending', 'Investigating', 'Resolved'] as const).map((tab) => {
              const count = tab === 'All' ? reports.length : reports.filter(r => r.status === tab).length;
              return (
                <button
                  key={tab}
                  onClick={() => setComplaintTab(tab)}
                  className={`pb-1 px-1 text-xs font-semibold relative transition-all min-w-max ${
                    complaintTab === tab ? 'text-[#16A34A] font-bold' : 'text-[#6B7280]'
                  }`}
                >
                  <span className="flex items-center space-x-1">
                    <span>{tab}</span>
                    <span className={`text-[8.5px] px-1.5 py-0.5 rounded-full ${
                      complaintTab === tab ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {count}
                    </span>
                  </span>
                  {complaintTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#16A34A] rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* List of complaints */}
          <div className="space-y-2">
            {filteredReports.length > 0 ? (
              filteredReports.map((report) => (
                <div
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className="bg-white rounded-2xl p-3 border border-gray-100 shadow-xs flex flex-col hover:border-red-200 transition-all cursor-pointer active:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 border border-red-100 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-4 h-4 animate-bounce" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-[#17201A] flex items-center space-x-1.5">
                          <span className="truncate">{report.reportType}</span>
                        </h4>
                        <span className="text-[9px] text-[#6B7280]">Donation: <span className="font-semibold text-[#17201A]">{report.donationName}</span></span>
                      </div>
                    </div>
                    {getReportStatusBadge(report.status)}
                  </div>

                  <p className="text-[10px] text-[#6B7280] line-clamp-2 mt-2 leading-relaxed italic bg-[#F8FAF9] p-2 rounded-lg border border-gray-50">
                    "{report.reason}"
                  </p>

                  <div className="mt-2 pt-2 border-t border-gray-50 flex justify-between items-center text-[8.5px] text-[#6B7280]">
                    <span>Reported By: <span className="font-semibold text-[#17201A]">{report.reportedBy} ({report.reportedByRole})</span></span>
                    <span className="font-bold text-[#16A34A] flex items-center">
                      View Audit <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center bg-white rounded-2xl border border-gray-100 p-4">
                <span className="text-3xl">🎉</span>
                <h4 className="text-xs font-bold text-[#17201A] mt-2">All Clear! No complaints</h4>
                <p className="text-[10px] text-[#6B7280] mt-1 max-w-[200px] mx-auto leading-relaxed">
                  There are no open issues or complaint tickets matching your selection.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* COMPLAINT DETAILS SHEET */}
      <BottomSheet
        isOpen={selectedReport !== null}
        onClose={() => setSelectedReport(null)}
        title="Issue Complaint Audit"
      >
        {selectedReport && (
          <div className="space-y-4">
            {/* Header info */}
            <div className="bg-red-50/50 p-3.5 rounded-2xl border border-red-100/60 flex items-start space-x-3">
              <div className="p-2 bg-red-100 text-red-600 rounded-xl">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[8.5px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded uppercase tracking-wider">
                  Quality Infraction File
                </span>
                <h4 className="text-xs font-bold text-[#17201A] mt-1">{selectedReport.reportType} Report</h4>
                <p className="text-[10px] text-[#6B7280] mt-0.5">Ticket ID: TK-{selectedReport.id.toUpperCase()}</p>
              </div>
            </div>

            {/* Reported Reason Message */}
            <div className="bg-white rounded-xl border border-gray-100 p-3 space-y-1">
              <span className="text-[9px] font-bold text-gray-500 uppercase">Statement of issue</span>
              <p className="text-[10.5px] text-gray-700 leading-relaxed italic">
                "{selectedReport.reason}"
              </p>
              <div className="text-[9px] text-[#6B7280] pt-1 border-t border-gray-50 mt-1 flex justify-between">
                <span>By: <span className="font-semibold text-[#17201A]">{selectedReport.reportedBy} ({selectedReport.reportedByRole})</span></span>
                <span>Filed: {selectedReport.date}</span>
              </div>
            </div>

            {/* Donation Details referenced */}
            <div className="bg-white rounded-2xl border border-gray-100 p-3 space-y-2 text-[10px]">
              <h5 className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Referenced Donation</h5>
              
              <div className="flex justify-between pb-1.5 border-b border-gray-50">
                <span className="text-[#6B7280]">Food Item</span>
                <span className="font-bold text-[#17201A]">{selectedReport.donationName} ({selectedReport.quantity})</span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-gray-50">
                <span className="text-[#6B7280]">Registered Donor</span>
                <span className="font-bold text-[#17201A]">{selectedReport.donorName}</span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-gray-50">
                <span className="text-[#6B7280]">Prepared Time</span>
                <span className="font-medium text-[#17201A]">{selectedReport.preparedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Consume Before</span>
                <span className="font-extrabold text-red-500">{selectedReport.expiryTime}</span>
              </div>
            </div>

            {/* Status Info */}
            <div className="flex justify-between items-center bg-[#F8FAF9] p-2.5 rounded-xl border border-gray-100 text-[10.5px]">
              <span className="text-gray-500">Current Progress</span>
              {getReportStatusBadge(selectedReport.status)}
            </div>

            {/* Actions Panel */}
            {selectedReport.status !== 'Resolved' && (
              <div className="space-y-2 pt-1.5">
                <h5 className="text-[10px] font-bold text-[#17201A] uppercase tracking-wider">Administrative Resolutions</h5>
                
                <div className="flex space-x-2">
                  {selectedReport.status === 'Pending' && (
                    <button
                      id="investigate-ticket-btn"
                      onClick={() => handleReportAction(selectedReport.id, selectedReport.reportType, 'Investigate')}
                      className="flex-1 py-2.5 border border-amber-200 text-amber-600 hover:bg-amber-50 text-[10px] font-semibold rounded-xl flex items-center justify-center space-x-1"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
                      <span>Investigate</span>
                    </button>
                  )}
                  
                  <button
                    id="resolve-ticket-btn"
                    onClick={() => handleReportAction(selectedReport.id, selectedReport.reportType, 'Resolve')}
                    className="flex-1 py-2.5 bg-[#16A34A] text-white text-[10px] font-bold rounded-xl flex items-center justify-center space-x-1 shadow-xs hover:bg-[#166534]"
                  >
                    <ClipboardCheck className="w-3.5 h-3.5" />
                    <span>Resolve Ticket</span>
                  </button>

                  <button
                    id="reject-ticket-btn"
                    onClick={() => handleReportAction(selectedReport.id, selectedReport.reportType, 'Reject')}
                    className="py-2.5 px-3 border border-red-200 text-red-500 hover:bg-red-50 text-[10px] font-bold rounded-xl"
                  >
                    Reject
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </BottomSheet>

      {/* EXPORT OPTIONS MODAL */}
      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExportSuccess={onExportComplete}
      />

      {/* CONFIRM TICKET ACTION MODAL */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={executeReportAction}
        title={`${confirmModal.action} ticket?`}
        message={`Are you sure you want to flag this ${confirmModal.reportType} report as "${confirmModal.action === 'Resolve' ? 'Resolved' : confirmModal.action === 'Investigate' ? 'Under Investigation' : 'Rejected'}"? Relevant users will be notified of the decision.`}
        confirmText={confirmModal.action}
        type={confirmModal.action === 'Resolve' ? 'success' : confirmModal.action === 'Investigate' ? 'warning' : 'danger'}
      />
    </div>
  );
}
