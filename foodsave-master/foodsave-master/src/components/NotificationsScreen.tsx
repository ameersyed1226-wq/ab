import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Bell, CheckSquare, HeartHandshake, Award, ShieldAlert, X, Trophy, Calendar } from 'lucide-react';

export const NotificationsScreen: React.FC = () => {
  const { notifications, toggleNotificationRead, markAllNotificationsRead } = useApp();
  const [showCertificate, setShowCertificate] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleCertificateClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering standard read toggle
    setShowCertificate(true);
  };

  return (
    <div className="flex flex-col w-full space-y-4 py-1">
      {/* Feed Header Controls */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold text-slate-800">Activity Feed</h1>
          <span
            id="unread-count"
            className={`flex items-center justify-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
              unreadCount > 0
                ? 'bg-emerald-50 text-[#006b2c]'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            {unreadCount > 0 ? `${unreadCount} New` : 'All caught up'}
          </span>
        </div>
        
        {unreadCount > 0 && (
          <button
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-bold text-[#006b2c] hover:bg-emerald-50 active:scale-95 transition-all cursor-pointer"
            onClick={markAllNotificationsRead}
          >
            <CheckSquare size={14} />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {/* Notification Feed List */}
      <div className="flex flex-col space-y-2">
        {notifications.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-100 text-center text-slate-400">
            <Bell size={32} className="mx-auto text-slate-200 mb-2" />
            <p className="text-sm">No notifications yet.</p>
          </div>
        ) : (
          notifications.map(item => (
            <div
              key={item.id}
              className={`notification-item relative overflow-hidden flex items-start gap-3 p-4 rounded-2xl bg-white border border-slate-100 shadow-xs hover:border-emerald-100 transition-all cursor-pointer ${
                !item.read ? 'ring-1 ring-emerald-50/50' : 'opacity-80'
              }`}
              onClick={() => toggleNotificationRead(item.id)}
            >
              {/* Unread indicator dot */}
              {!item.read && (
                <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#006b2c]"></span>
              )}

              {/* Emoji thumbnail */}
              <div className="flex-shrink-0 w-11 h-11 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-lg shadow-inner">
                {item.type === 'pickup_request' && '🍱'}
                {item.type === 'pickup_started' && '🚴'}
                {item.type === 'completed' && '🎉'}
                {item.type === 'milestone' && '🌟'}
              </div>

              {/* Text descriptions */}
              <div className="flex flex-col flex-1 min-w-0 pr-4">
                <div className="flex items-baseline justify-between gap-2">
                  <h2 className="text-xs font-bold text-slate-800 truncate">
                    {item.title}
                  </h2>
                  <span className="text-[10px] text-slate-400 flex-shrink-0">
                    {item.time}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {item.body}
                </p>

                {/* Optional contextual micro layouts */}
                {item.badge && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#006b2c] text-[9px] font-bold">
                      <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
                      {item.badge}
                    </span>
                  </div>
                )}

                {item.etaInfo && (
                  <p className="mt-2 text-[10px] text-slate-400 font-medium flex items-center gap-1">
                    <span>📍</span>
                    <span>{item.etaInfo}</span>
                  </p>
                )}

                {/* View certificate shortcut */}
                {item.type === 'milestone' && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award size={15} className="text-[#006b2c] fill-emerald-50" />
                      <span className="text-[10px] font-bold text-slate-700">Gold Zero-Waste Tier</span>
                    </div>
                    <button
                      className="text-[#006b2c] font-bold text-[10px] flex items-center hover:underline cursor-pointer"
                      onClick={handleCertificateClick}
                    >
                      View Certificate →
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom Delight Micro-card */}
      <div className="p-4 rounded-xl bg-emerald-50/20 border border-emerald-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#006b2c] shadow-xs shrink-0 border border-emerald-50">
          <HeartHandshake size={15} />
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <p className="text-[11px] font-bold text-slate-800">Every notification is a meal saved</p>
          <p className="text-[9px] text-slate-500">Thanks for making hunger relief seamless today.</p>
        </div>
      </div>

      {/* BEAUTIFUL IMPACT CERTIFICATE OVERLAY DIALOG */}
      {showCertificate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative border border-slate-100">
            {/* Header backdrop banner */}
            <div className="bg-emerald-800 p-6 text-center text-white relative">
              <button
                className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-colors cursor-pointer"
                onClick={() => setShowCertificate(false)}
              >
                <X size={16} />
              </button>
              
              <Trophy size={48} className="mx-auto text-amber-300 fill-amber-300/10 mb-2" />
              <h3 className="text-base font-bold tracking-tight">Zero-Waste Certificate</h3>
              <p className="text-[10px] text-emerald-100 mt-1">Presented by FoodSave Network</p>
            </div>

            {/* Certificate citation */}
            <div className="p-6 text-center flex flex-col items-center gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-bold text-[#006b2c] tracking-widest uppercase">Honoring</span>
                <h4 className="text-base font-extrabold text-slate-800">ABC Restaurant</h4>
                <p className="text-[11px] text-slate-500 max-w-[280px] mx-auto leading-relaxed">
                  For outstanding dedication to building hunger-free communities by redirecting surplus food safely.
                </p>
              </div>

              {/* Stats badges */}
              <div className="grid grid-cols-2 gap-2 w-full pt-4 border-t border-slate-100">
                <div className="bg-emerald-50/50 p-2.5 rounded-xl text-center border border-emerald-50">
                  <span className="text-[9px] font-bold text-slate-400 block uppercase">Rescues</span>
                  <span className="text-base font-extrabold text-[#006b2c]">24 Batches</span>
                </div>
                <div className="bg-emerald-50/50 p-2.5 rounded-xl text-center border border-emerald-50">
                  <span className="text-[9px] font-bold text-slate-400 block uppercase">Meals Rescued</span>
                  <span className="text-base font-extrabold text-[#006b2c]">1,240 Meals</span>
                </div>
              </div>

              {/* Date footer */}
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] mt-1 font-medium">
                <Calendar size={12} />
                <span>Issued September 2026</span>
              </div>

              <button
                className="w-full py-2.5 bg-[#006b2c] hover:bg-emerald-800 text-white font-bold text-xs rounded-xl cursor-pointer mt-2"
                onClick={() => setShowCertificate(false)}
              >
                Proudly Rescued
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
