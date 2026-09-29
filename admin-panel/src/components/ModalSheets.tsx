import { useState, useEffect } from 'react';
import { Download, CheckCircle, FileText, AlertTriangle, ShieldCheck, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'success' | 'info';
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning',
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const colorMap = {
    danger: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100', btn: 'bg-red-600 hover:bg-red-700 focus:ring-red-500' },
    warning: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', btn: 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-500' },
    success: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100', btn: 'bg-green-600 hover:bg-green-700 focus:ring-green-500' },
    info: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', btn: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500' },
  };

  const scheme = colorMap[type];

  return (
    <div className="fixed inset-0 bg-[#17201A]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div 
        id="confirmation-modal-container"
        className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-gray-100 transform scale-100 transition-all"
      >
        <div className="flex flex-col items-center text-center">
          <div className={`p-3 rounded-full ${scheme.bg} ${scheme.text} mb-3 border ${scheme.border}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          
          <h3 className="text-base font-bold text-[#17201A] mb-1.5">{title}</h3>
          <p className="text-xs text-[#6B7280] leading-relaxed mb-5">{message}</p>
          
          <div className="flex w-full space-x-2">
            <button
              id="modal-cancel-btn"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-[#6B7280] hover:bg-gray-50 active:bg-gray-100 transition-all"
            >
              {cancelText}
            </button>
            <button
              id="modal-confirm-btn"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold text-white transition-all shadow-xs focus:ring-2 focus:ring-offset-2 ${scheme.btn}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
  userName: string;
  regId?: string;
}

export function DocumentViewerModal({
  isOpen,
  onClose,
  documentTitle,
  userName,
  regId,
}: DocumentViewerModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#17201A]/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-gray-100 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-full hover:bg-gray-100 text-[#6B7280] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 mb-4">
          <div className="p-2 bg-green-50 rounded-xl text-[#16A34A] border border-green-100">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#17201A] uppercase tracking-wider">Document Viewer</h3>
            <p className="text-[10px] text-[#6B7280]">{userName}</p>
          </div>
        </div>

        {/* Mock Document Render */}
        <div className="bg-[#F8FAF9] rounded-2xl border border-gray-200 p-4 mb-4 text-center">
          <div className="py-6 flex flex-col items-center">
            <ShieldCheck className="w-12 h-12 text-[#16A34A] opacity-80 mb-2" />
            <span className="text-[11px] font-bold text-[#17201A] max-w-[200px] block truncate">
              {documentTitle}
            </span>
            <span className="text-[9px] text-[#6B7280] mt-1">Official Verification Document</span>
          </div>

          <div className="border-t border-dashed border-gray-200 pt-3 text-left space-y-1.5 text-[10px]">
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Registration Authority</span>
              <span className="font-semibold text-[#17201A]">Govt. Society Commission</span>
            </div>
            {regId && (
              <div className="flex justify-between">
                <span className="text-[#6B7280]">License/Reg Number</span>
                <span className="font-semibold text-[#17201A]">{regId}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Status</span>
              <span className="font-semibold text-green-600 flex items-center">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1" /> Authenticated
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-[10px] text-[#166534] bg-[#DCFCE7] p-2.5 rounded-xl border border-green-200">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>This document matches state database records and registration ID validation filters.</span>
          </div>
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-[#16A34A] text-white text-xs font-semibold rounded-xl shadow-xs hover:bg-[#166534] transition-all"
          >
            Verified & Close
          </button>
        </div>
      </div>
    </div>
  );
}

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExportSuccess: (format: string) => void;
}

export function ExportReportModal({
  isOpen,
  onClose,
  onExportSuccess,
}: ExportReportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<'PDF' | 'EXCEL'>('EXCEL');
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const generateCSVData = () => {
    let csv = "";
    // Title
    csv += "FOODSAVE PLATFORM EXECUTIVE CONSOLIDATED AUDIT REPORT\r\n";
    csv += `Generated Date,${new Date().toLocaleDateString()}\r\n`;
    csv += "System Administrator,FoodSave Platform Admin Node\r\n";
    csv += "Status,SECURE SIGNED CLOUD REPORT\r\n\r\n";

    // Section 1
    csv += "SECTION 1: CORE METRICS SUMMARY\r\n";
    csv += "Metric Parameter,Rescued/Onboarded Quantity,Target Threshold,Wastage Rates\r\n";
    csv += "Total Registered Users,1248,1500,N/A\r\n";
    csv += "Active Food Donors,420,500,N/A\r\n";
    csv += "Registered Volunteers,768,1000,N/A\r\n";
    csv += "Active Rescue Routes,86,100,N/A\r\n";
    csv += "Completed Pickups,4620,5000,94.4% Success Rate\r\n";
    csv += "Expired Food Wastage,272,300,1.4% Wastage Drop\r\n";
    csv += "Total Saved Meals,58420,60000,N/A\r\n\r\n";

    // Section 2
    csv += "SECTION 2: USER DIRECTORY & REGISTRY LOGS\r\n";
    csv += "User ID,Name,Email,Phone,Role,Location,Registered Date,Status,Donations,Pickups Completed\r\n";
    csv += "u-1,Kumar Restaurant,contact@kumarrestaurant.com,+91 94432 12345,Donor,Chidambaram,2026-04-12,Verified,142,138\r\n";
    csv += "u-2,Rahul Kumar,rahul.kumar@gmail.com,+91 88701 98765,Volunteer,Chidambaram,2026-05-18,Verified,0,82\r\n";
    csv += "u-3,Helping Hands NGO,verify@helpinghands.org,+91 73735 44221,NGO,Chidambaram,2026-09-18,Pending,0,12\r\n";
    csv += "u-4,ABC Restaurant,manager@abcrestaurant.com,+91 98423 55667,Donor,Chidambaram,2026-01-10,Verified,210,205\r\n";
    csv += "u-5,Chennai Hope Center,info@chennaihope.org,+91 44 2445 9900,NGO,Chennai,2026-02-14,Verified,0,150\r\n";
    csv += "u-6,Anjali Sharma,anjali.s@outlook.com,+91 91234 56789,Volunteer,Cuddalore,2026-03-22,Suspended,0,20\r\n\r\n";

    // Section 3
    csv += "SECTION 3: ACTIVE & COMPLETED FOOD RESCUES\r\n";
    csv += "Rescue ID,Food Name,Quantity,Food Type,Registered Donor,Location,Prepared Time,Consume Before,Status,Volunteer Assigned\r\n";
    csv += "d-1,Vegetable Rice,25 Meals,Vegetarian,ABC Restaurant,Chidambaram,08:30 AM,12:30 PM,Active,Rahul Kumar\r\n";
    csv += "d-2,Biryani Special,40 Meals,Non-Vegetarian,Kumar Restaurant,Chidambaram,Yesterday 07:00 PM,Yesterday 11:00 PM,Delivered,Rahul Kumar\r\n";
    csv += "d-3,Garden Fresh Salad,15 Meals,Vegan,Green Salad Club,Chennai,Yesterday 10:00 AM,Yesterday 02:00 PM,Expired,Unassigned\r\n";
    csv += "d-4,Paneer Butter Masala,30 Meals,Vegetarian,ABC Restaurant,Cuddalore,09:00 AM,01:00 PM,Accepted,Rahul Kumar\r\n";
    csv += "d-5,Steamed Idli & Chutney,50 Meals,Vegan,Anand Bhavan,Puducherry,07:00 AM,11:00 AM,Picked Up,Suresh Kumar\r\n\r\n";

    // Section 4
    csv += "SECTION 4: SYSTEM COMPLAINTS & FRAUD REVIEWS\r\n";
    csv += "Ticket ID,Complaint Category,Reported By,Reporter Role,Affected Item,Reason,Status,Date Filed\r\n";
    csv += "r-1,Expired Food,Rahul Kumar,Volunteer,Biryani Special,Food appeared expired and smelled stale upon inspection,Pending,Today\r\n";
    csv += "r-2,Fake Donation,Helping Hands NGO,NGO,Garden Fresh Salad,The listed donor address is completely vacant,Investigating,Yesterday\r\n";

    return csv;
  };

  const generateHTMLPDFData = () => {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>FoodSave Platform Executive Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif; color: #111827; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.5; background-color: #ffffff; }
    h1 { color: #16a34a; font-size: 24px; margin-bottom: 5px; text-transform: uppercase; border-bottom: 2px solid #16a34a; padding-bottom: 10px; font-weight: 800; }
    .meta { font-size: 12px; color: #6b7280; margin-bottom: 30px; display: flex; justify-content: space-between; }
    h2 { font-size: 15px; color: #111827; margin-top: 30px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
    th { background-color: #f9fafb; text-align: left; padding: 8px 10px; font-weight: bold; border-bottom: 2px solid #e5e7eb; color: #374151; }
    td { padding: 8px 10px; border-bottom: 1px solid #f3f4f6; color: #4b5563; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 15px; }
    .stat-card { background: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px; border-radius: 10px; text-align: center; }
    .stat-val { font-size: 18px; font-weight: 800; color: #15803d; }
    .stat-lbl { font-size: 10px; color: #166534; margin-top: 2px; font-weight: 600; }
    .footer { margin-top: 50px; text-align: center; font-size: 11px; color: #9ca3af; border-top: 1px dashed #e5e7eb; padding-top: 20px; }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px; border-radius: 8px; margin-bottom: 25px; text-align: center; font-size: 12px; font-family: sans-serif; color: #166534;">
    <strong>PDF Print Document View:</strong> To save as a high-fidelity PDF, press <strong>Ctrl + P</strong> (or <strong>Cmd + P</strong> on macOS) and choose <strong>Save as PDF</strong>.
  </div>
  
  <h1>FoodSave Executive Platform Audit Report</h1>
  <div class="meta">
    <div><strong>Generated Date:</strong> ${new Date().toLocaleDateString()}</div>
    <div><strong>Platform node:</strong> Secure Admin Node-FS3</div>
  </div>

  <h2>1. Executive Summary & Core Metrics</h2>
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-val">1,248</div>
      <div class="stat-lbl">Registered Users</div>
    </div>
    <div class="stat-card">
      <div class="stat-val">420</div>
      <div class="stat-lbl">Active Donors</div>
    </div>
    <div class="stat-card">
      <div class="stat-val">768</div>
      <div class="stat-lbl">Active Volunteers</div>
    </div>
    <div class="stat-card">
      <div class="stat-val">58,420</div>
      <div class="stat-lbl">Saved Meals</div>
    </div>
  </div>

  <h2>2. Registered Users Log</h2>
  <table>
    <thead>
      <tr>
        <th>User ID</th>
        <th>Name</th>
        <th>Role</th>
        <th>Location</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>u-1</td>
        <td>Kumar Restaurant</td>
        <td>Donor</td>
        <td>Chidambaram</td>
        <td>Verified</td>
      </tr>
      <tr>
        <td>u-2</td>
        <td>Rahul Kumar</td>
        <td>Volunteer</td>
        <td>Chidambaram</td>
        <td>Verified</td>
      </tr>
      <tr>
        <td>u-3</td>
        <td>Helping Hands NGO</td>
        <td>NGO</td>
        <td>Chidambaram</td>
        <td>Pending</td>
      </tr>
      <tr>
        <td>u-4</td>
        <td>ABC Restaurant</td>
        <td>Donor</td>
        <td>Chidambaram</td>
        <td>Verified</td>
      </tr>
      <tr>
        <td>u-5</td>
        <td>Chennai Hope Center</td>
        <td>NGO</td>
        <td>Chennai</td>
        <td>Verified</td>
      </tr>
    </tbody>
  </table>

  <h2>3. Surplus Food Rescue Feed</h2>
  <table>
    <thead>
      <tr>
        <th>Rescue ID</th>
        <th>Food Item</th>
        <th>Quantity</th>
        <th>Registered Donor</th>
        <th>Route Status</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>d-1</td>
        <td>Vegetable Rice</td>
        <td>25 Meals</td>
        <td>ABC Restaurant</td>
        <td>Active (In Route)</td>
      </tr>
      <tr>
        <td>d-2</td>
        <td>Biryani Special</td>
        <td>40 Meals</td>
        <td>Kumar Restaurant</td>
        <td>Delivered Successfully</td>
      </tr>
      <tr>
        <td>d-3</td>
        <td>Garden Fresh Salad</td>
        <td>15 Meals</td>
        <td>Green Salad Club</td>
        <td>Expired</td>
      </tr>
      <tr>
        <td>d-4</td>
        <td>Paneer Butter Masala</td>
        <td>30 Meals</td>
        <td>ABC Restaurant</td>
        <td>Accepted</td>
      </tr>
    </tbody>
  </table>

  <h2>4. Infractions & complaints Summary</h2>
  <table>
    <thead>
      <tr>
        <th>Ticket ID</th>
        <th>Complaint Category</th>
        <th>Reported By</th>
        <th>Reason</th>
        <th>Investigation Status</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>r-1</td>
        <td>Expired Food</td>
        <td>Rahul Kumar (Volunteer)</td>
        <td>Food appeared expired and smelled stale.</td>
        <td>Pending Review</td>
      </tr>
      <tr>
        <td>r-2</td>
        <td>Fake Donation</td>
        <td>Helping Hands (NGO)</td>
        <td>Listed address is completely vacant.</td>
        <td>Under Active Investigation</td>
      </tr>
    </tbody>
  </table>

  <div class="footer">
    FoodSave Platform &bull; "Save Food. Share Hope." &bull; Signed Audit Certification Document
  </div>
</body>
</html>`;
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isExporting) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setIsExporting(false);
              setProgress(0);

              // Perform actual download trigger
              try {
                if (selectedFormat === 'EXCEL') {
                  const content = generateCSVData();
                  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.setAttribute('href', url);
                  link.setAttribute('download', 'FoodSave_Platform_Consolidated_Report.csv');
                  link.style.visibility = 'hidden';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                } else {
                  // Beautiful HTML document that opens perfectly in any browser/mobile device and is printable as pure PDF
                  const content = generateHTMLPDFData();
                  const blob = new Blob([content], { type: 'text/html;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.setAttribute('href', url);
                  link.setAttribute('download', 'FoodSave_Platform_Consolidated_Report_Printable.html');
                  link.style.visibility = 'hidden';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }
              } catch (err) {
                console.error("Browser download block:", err);
              }

              onExportSuccess(selectedFormat);
              onClose();
            }, 400);
            return 100;
          }
          return prev + 25;
        });
      }, 200);
    }
    return () => clearInterval(interval);
  }, [isExporting, selectedFormat, onExportSuccess, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#17201A]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-gray-100">
        <h3 className="text-sm font-bold text-[#17201A] mb-1">Export Platform Report</h3>
        <p className="text-[10px] text-[#6B7280] mb-4">Select format to export consolidated system parameters.</p>

        {!isExporting ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSelectedFormat('EXCEL')}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  selectedFormat === 'EXCEL'
                    ? 'border-[#16A34A] bg-[#DCFCE7]/20 text-[#16A34A]'
                    : 'border-gray-200 text-[#6B7280] hover:bg-gray-50'
                }`}
              >
                <Download className="w-6 h-6 mx-auto mb-1 opacity-80" />
                <span className="text-[11px] font-bold">Excel / CSV</span>
                <span className="block text-[8px] opacity-80 mt-0.5">Raw Data Audit</span>
              </button>

              <button
                onClick={() => setSelectedFormat('PDF')}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  selectedFormat === 'PDF'
                    ? 'border-[#16A34A] bg-[#DCFCE7]/20 text-[#16A34A]'
                    : 'border-gray-200 text-[#6B7280] hover:bg-gray-50'
                }`}
              >
                <FileText className="w-6 h-6 mx-auto mb-1 opacity-80" />
                <span className="text-[11px] font-bold">PDF Format</span>
                <span className="block text-[8px] opacity-80 mt-0.5">Polished Printable</span>
              </button>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-[#6B7280] hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setIsExporting(true)}
                className="flex-1 py-2.5 bg-[#16A34A] hover:bg-[#166534] text-white text-xs font-semibold rounded-xl shadow-xs transition-all"
              >
                Start Export
              </button>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center">
            <div className="w-12 h-12 rounded-full bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center mx-auto mb-3 animate-pulse">
              <Download className="w-5 h-5 animate-bounce" />
            </div>
            <p className="text-xs font-bold text-[#17201A] mb-1 font-sans">Generating {selectedFormat} report...</p>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-[200px] mx-auto mt-3">
              <div
                className="h-full bg-[#16A34A] transition-all duration-200 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[9px] text-[#6B7280] mt-1.5 block">{progress}% compiled</span>
          </div>
        )}
      </div>
    </div>
  );
}

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#17201A]/60 backdrop-blur-xs flex items-end md:items-center justify-center z-40 transition-opacity p-0 md:p-4">
      {/* Backdrop tap to close */}
      <div className="absolute inset-0" onClick={onClose} />
      
      {/* Container */}
      <div className="bg-white w-full max-w-full md:max-w-xl rounded-t-[28px] md:rounded-3xl shadow-2xl border border-gray-100 z-50 flex flex-col max-h-[85vh] animate-slide-up relative">
        {/* Native drag handle (mobile only) */}
        <div className="w-full flex md:hidden justify-center py-2 shrink-0 cursor-pointer" onClick={onClose}>
          <div className="w-12 h-1 bg-gray-200 rounded-full" />
        </div>

        <div className="flex justify-between items-center px-4 pb-2 border-b border-gray-50 shrink-0">
          <h3 className="text-xs font-bold text-[#17201A] uppercase tracking-wider">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 text-[#6B7280]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto p-4 flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
