"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Bell, Check, X, Trash2 } from "lucide-react";
import { useNotifications, type Notification } from "@/hooks/useNotifications";
import { useWalletStore } from "@/hooks/useWallet";
import { cn } from "@/lib/utils";

const ICONS: Record<Notification["type"], string> = {
  bid: "💰",
  assigned: "🎯",
  started: "▶️",
  delivered: "📦",
  completed: "✅",
};

const COLORS: Record<Notification["type"], string> = {
  bid: "from-blue-500/20 to-blue-500/5 border-blue-500/30",
  assigned: "from-purple-500/20 to-purple-500/5 border-purple-500/30",
  started: "from-yellow-500/20 to-yellow-500/5 border-yellow-500/30",
  delivered: "from-orange-500/20 to-orange-500/5 border-orange-500/30",
  completed: "from-green-500/20 to-green-500/5 border-green-500/30",
};

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function NotificationBell() {
  const { address } = useWalletStore();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
  } = useNotifications(address);

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  if (!address) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-white/5 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-dark-200" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-gradient-to-br from-primary-500 to-accent-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Mobile backdrop */}
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 sm:hidden" onClick={() => setOpen(false)} />

          <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-96 max-w-md bg-dark-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-primary-500/10 z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="font-space font-bold text-white">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-dark-400 hover:text-white transition-colors flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    Mark all read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-xs text-dark-400 hover:text-red-400 transition-colors flex items-center gap-1"
                    title="Clear all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="text-dark-400 hover:text-white transition-colors p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-[60vh] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-4xl mb-2 opacity-50">🔔</div>
                  <p className="text-dark-300 text-sm">No notifications yet</p>
                  <p className="text-dark-500 text-xs mt-1">
                    You'll be notified when bids are placed, jobs are assigned, delivered, or completed.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {notifications.map((n) => (
                    <Link
                      key={n.id}
                      href={`/jobs/${n.jobId}`}
                      onClick={() => {
                        markAsRead(n.id);
                        setOpen(false);
                      }}
                      className={cn(
                        "block p-4 transition-all hover:bg-white/5",
                        !n.read && "bg-gradient-to-r border-l-2",
                        !n.read && COLORS[n.type]
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl flex-shrink-0">{ICONS[n.type]}</div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              "text-sm leading-snug",
                              n.read ? "text-dark-300" : "text-white font-medium"
                            )}
                          >
                            {n.message}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-dark-500">{timeAgo(n.timestamp)}</span>
                            {!n.read && (
                              <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-3 border-t border-white/10 bg-dark-950/50">
                <p className="text-[10px] text-dark-500 text-center">
                  Polling on-chain every 15s
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
