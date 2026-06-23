import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import type {
  User,
  OptOut,
  Rebate,
  Review,
  MealAttendance,
} from "../types/User";
import { optoutService } from "../services/optoutService";
import { rebateService } from "../services/rebateService";
import { adminService } from "../services/adminService";

// Hollow star icon for reviews
const HollowStarIcon = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.31h5.513c.498 0 .703.656.32.99l-4.38 3.135a.563.563 0 00-.182.635l1.658 5.36a.562.562 0 01-.812.622l-4.38-3.135a.563.563 0 00-.656 0l-4.38 3.135a.562.562 0 01-.812-.622l1.658-5.36a.563.563 0 00-.182-.635l-4.38-3.135a.562.562 0 01.32-.99h5.513a.563.563 0 00.475-.31l2.125-5.111z" />
  </svg>
);

// Solid star icon
const SolidStarIcon = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.007z" clipRule="evenodd" />
  </svg>
);

type SectionId = "dashboard" | "approvals" | "attendance" | "reviews" | "optout" | "rebates";

interface NavItem {
  id: SectionId;
  label: string;
  icon: React.ReactNode;
  accentColor: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: "dashboard",
    label: "Overview",
    accentColor: "#818cf8",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    id: "approvals",
    label: "Approvals",
    accentColor: "#f59e0b",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: "attendance",
    label: "Attendance",
    accentColor: "#3b82f6",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    ),
  },
  {
    id: "reviews",
    label: "Reviews",
    accentColor: "#a78bfa",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  },
  {
    id: "optout",
    label: "Opt-Outs",
    accentColor: "#f87171",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: "rebates",
    label: "Rebates",
    accentColor: "#34d399",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
      </svg>
    ),
  },
];

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  const [activeSection, setActiveSection] = useState<SectionId>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [approvalTypeFilter, setApprovalTypeFilter] = useState("all");

  // States
  const [stats, setStats] = useState({ totalUsers: 0, activeToday: 0, pendingRequests: 0 });
  const [optOuts, setOptOuts] = useState<OptOut[]>([]);
  const [rebates, setRebates] = useState<Rebate[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [attendance, setAttendance] = useState<MealAttendance[]>([]);
  const [reviewSummary, setReviewSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Clear filters when switching sections
    setSearchTerm("");
    setApprovalTypeFilter("all");
  }, [activeSection]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, optOutsRes, rebatesRes, reviewsRes, attendanceRes] = await Promise.all([
        adminService.getStats(),
        adminService.getOptOuts(),
        adminService.getRebates(),
        adminService.getReviews(),
        adminService.getAttendance(),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (optOutsRes.success && optOutsRes.data) setOptOuts(optOutsRes.data);
      if (rebatesRes.success && rebatesRes.data) setRebates(rebatesRes.data);
      if (reviewsRes.success && reviewsRes.data) setReviews(reviewsRes.data);
      if (attendanceRes.success && attendanceRes.data) setAttendance(attendanceRes.data);
    } catch (err) {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }

    // Fetch the heavy AI summary asynchronously so it doesn't block the dashboard
    refreshSummary();
  };

  const handleApproveOptOut = async (id: string, approved: boolean) => {
    try {
      await optoutService.approveOptOut(id, { approved, adminNotes: "" });
      const optOutsRes = await adminService.getOptOuts();
      if (optOutsRes.success && optOutsRes.data) setOptOuts(optOutsRes.data);
      
      // Update pending count stat locally for UI snappiness
      const pendingRes = await adminService.getStats();
      if (pendingRes.success) setStats(pendingRes.stats);
    } catch (err) {
      setError("Failed to update opt-out");
    }
  };

  const handleApproveRebate = async (id: string, status: string) => {
    try {
      await rebateService.approveRebate(id, { status, notes: "" });
      const rebatesRes = await adminService.getRebates();
      if (rebatesRes.success && rebatesRes.data) setRebates(rebatesRes.data);

      const pendingRes = await adminService.getStats();
      if (pendingRes.success) setStats(pendingRes.stats);
    } catch (err) {
      setError("Failed to update rebate");
    }
  };

  const refreshSummary = async () => {
    try {
      setSummaryLoading(true);
      const summaryRes = await adminService.getReviewSummary();
      if (summaryRes.success) setReviewSummary(summaryRes.data);
    } catch (err) {
      setError("Failed to refresh feedback summary");
    } finally {
      setSummaryLoading(false);
    }
  };

  // Calculations
  const pendingOptOuts = optOuts.filter((opt) => opt.approved === false);
  const pendingRebates = rebates.filter((reb) => reb.status === "pending");
  const uniqueAttendeesToday = new Set(
    attendance
      .filter((att) => att.date === today)
      .map((att) => (typeof att.user === "object" ? att.user.id : att.user))
  ).size;

  // Filtered Arrays
  const filteredOptOuts = pendingOptOuts.filter((opt) => {
    if (approvalTypeFilter === "rebate") return false;
    const name = typeof opt.user === "object" ? opt.user.name : String(opt.user);
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredRebates = pendingRebates.filter((reb) => {
    if (approvalTypeFilter === "optout") return false;
    const name = typeof reb.user === "object" ? reb.user.name : String(reb.user);
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredAttendance = attendance.filter((att) => {
    const name = typeof att.user === "object" ? att.user.name : String(att.user);
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredReviews = reviews.filter((rev) => {
    const name = typeof rev.user === "object" ? rev.user.name : String(rev.user);
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredAllOptOuts = optOuts.filter((opt) => {
    const name = typeof opt.user === "object" ? opt.user.name : String(opt.user);
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredAllRebates = rebates.filter((reb) => {
    const name = typeof reb.user === "object" ? reb.user.name : String(reb.user);
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-primary)" }}>
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--primary-color)", borderTopColor: "transparent" }} />
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg-primary)" }}>
      {/* ========== SIDEBAR ========== */}
      <aside
        className="flex flex-col h-full shrink-0 transition-all duration-300"
        style={{
          width: sidebarCollapsed ? 72 : 260,
          background: "var(--bg-secondary)",
          borderRight: "1px solid var(--border-color)",
        }}
      >
        {/* Logo & Toggle */}
        <div className="flex items-center justify-between px-4 py-5" style={{ borderBottom: "1px solid var(--border-color)" }}>
          <Link to="/" className="flex items-center space-x-3 overflow-hidden hover:opacity-80 transition-opacity" style={{ textDecoration: 'none' }}>
            <img src="/favicon.svg" alt="DigiMess Logo" className="w-9 h-9 shrink-0" style={{ filter: "drop-shadow(0 2px 6px rgba(129,140,248,0.3))" }} />
            {!sidebarCollapsed && (
              <span className="text-lg font-bold whitespace-nowrap" style={{ color: "var(--text-primary)" }}>
                DigiMess Admin
              </span>
            )}
          </Link>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 rounded-lg bg-transparent border-none shadow-none shrink-0"
            style={{ color: "var(--text-muted)" }}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {sidebarCollapsed ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              )}
            </svg>
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className="w-full flex items-center rounded-xl transition-all duration-200 border-none shadow-none relative"
                style={{
                  padding: sidebarCollapsed ? "10px" : "10px 14px",
                  justifyContent: sidebarCollapsed ? "center" : "flex-start",
                  background: isActive ? `${item.accentColor}15` : "transparent",
                  color: isActive ? item.accentColor : "var(--text-secondary)",
                  border: isActive ? `1px solid ${item.accentColor}25` : "1px solid transparent",
                }}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <span className="shrink-0">{item.icon}</span>
                {!sidebarCollapsed && (
                  <span className="ml-3 text-sm font-medium whitespace-nowrap">{item.label}</span>
                )}
                {/* Badges for approvals */}
                {item.id === "approvals" && stats.pendingRequests > 0 && !sidebarCollapsed && (
                  <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: "var(--error-color)" }}>
                    {stats.pendingRequests}
                  </span>
                )}
                {item.id === "approvals" && stats.pendingRequests > 0 && sidebarCollapsed && (
                  <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full" style={{ background: "var(--error-color)" }} />
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom — Profile & Logout */}
        <div className="px-3 py-4 space-y-1" style={{ borderTop: "1px solid var(--border-color)" }}>
          <div
            className="w-full flex items-center rounded-xl transition-all duration-200 border-none shadow-none"
            style={{
              padding: sidebarCollapsed ? "10px" : "10px 14px",
              justifyContent: sidebarCollapsed ? "center" : "flex-start",
              background: "transparent",
              color: "var(--text-secondary)",
            }}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(129, 140, 248, 0.2)", color: "var(--primary-color)" }}>
              <span className="font-bold">{user.name.charAt(0)}</span>
            </div>
            {!sidebarCollapsed && (
              <div className="ml-3 text-left overflow-hidden">
                <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{user.name}</p>
                <p className="text-xs truncate" style={{ color: "var(--text-accent)" }}>Administrator</p>
              </div>
            )}
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center rounded-xl transition-all duration-200 border-none shadow-none"
            style={{
              padding: sidebarCollapsed ? "10px" : "10px 14px",
              justifyContent: sidebarCollapsed ? "center" : "flex-start",
              background: "transparent",
              color: "var(--error-color)",
            }}
            title={sidebarCollapsed ? "Logout" : undefined}
          >
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {!sidebarCollapsed && <span className="ml-3 text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* ========== MAIN CONTENT ========== */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {error && (
            <div className="mb-6 error-message">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
                <button onClick={() => setError("")} className="ml-auto bg-transparent border-none shadow-none p-0" style={{ color: "var(--error-color)" }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
          )}

          {/* DASHBOARD OVERVIEW */}
          {activeSection === "dashboard" && (
            <div className="animate-fade-in">
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
                  Admin Control Center
                </h1>
                <p style={{ color: "var(--text-secondary)" }}>Oversee mess operations, monitor performance, and manage approvals.</p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                <StatCard label="Total Users" value={String(stats.totalUsers)} color="#818cf8" icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>
                } />
                <StatCard label="Students Present Today" value={String(uniqueAttendeesToday)} color="#34d399" icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                } />
                <StatCard label="Pending Requests" value={String(stats.pendingRequests)} color="#f59e0b" icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                } />
              </div>

              {/* AI Feedback Summary */}
              <div className="p-6 rounded-xl mb-6 glass-card border glow-border" style={{ borderColor: "rgba(251, 191, 36, 0.2)" }}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg" style={{ background: "rgba(251, 191, 36, 0.15)", color: "#fbbf24" }}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>AI Feedback Summary</h2>
                  </div>
                  <button onClick={refreshSummary} disabled={summaryLoading} className="btn-secondary flex items-center space-x-2 text-sm px-4 py-2">
                    {summaryLoading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" /> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v6h6M20 20v-6h-6M5 19A9 9 0 0119 5" /></svg>}
                    <span>Refresh</span>
                  </button>
                </div>

                {reviewSummary ? (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-1 p-6 rounded-xl flex flex-col items-center justify-center" style={{ background: "var(--bg-surface)" }}>
                      <p className="text-5xl font-bold mb-2" style={{ color: "#fbbf24" }}>
                        {reviewSummary.averageRating?.toFixed(1) || "—"}
                      </p>
                      <div className="flex space-x-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star}>
                            {star <= Math.round(reviewSummary.averageRating || 0) ? <SolidStarIcon className="w-4 h-4 text-yellow-400" /> : <HollowStarIcon className="w-4 h-4 text-gray-600" />}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs uppercase tracking-wider font-semibold" style={{ color: "var(--text-muted)" }}>{reviews.length} Total Reviews</p>
                    </div>
                    <div className="md:col-span-3 p-6 rounded-xl" style={{ background: "var(--bg-surface)" }}>
                      <h4 className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>AI Insight</h4>
                      <p className="text-lg leading-relaxed italic" style={{ color: "var(--text-primary)" }}>
                        "{reviewSummary.summaryText || "No feedback to summarize yet."}"
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-center py-8" style={{ color: "var(--text-muted)" }}>Loading feedback summary...</p>
                )}
              </div>
            </div>
          )}

          {/* APPROVALS VIEW */}
          {activeSection === "approvals" && (
            <div className="animate-fade-in">
              <SectionHeader title="Pending Approvals" subtitle="Review and approve opt-out requests and rebates" color="#f59e0b" />
              
              <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  placeholder="Search student name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input flex-1 px-4 py-2.5 rounded-lg outline-none transition-all"
                  style={{ background: "var(--bg-surface)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}
                  onFocus={(e) => e.target.style.borderColor = "#f59e0b"}
                  onBlur={(e) => e.target.style.borderColor = "var(--border-color)"}
                />
                <select
                  value={approvalTypeFilter}
                  onChange={(e) => setApprovalTypeFilter(e.target.value)}
                  className="form-input px-4 py-2.5 rounded-lg outline-none cursor-pointer transition-all"
                  style={{ background: "var(--bg-surface)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}
                  onFocus={(e) => e.target.style.borderColor = "#f59e0b"}
                  onBlur={(e) => e.target.style.borderColor = "var(--border-color)"}
                >
                  <option value="all">All Requests</option>
                  <option value="optout">Opt-Outs Only</option>
                  <option value="rebate">Rebates Only</option>
                </select>
              </div>

              <div className="p-6 rounded-xl" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-color)" }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>All Pending Requests</h3>
                
                {filteredOptOuts.length === 0 && filteredRebates.length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ background: "rgba(52, 211, 153, 0.1)", color: "var(--success-color)" }}>
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <h3 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>You're all caught up!</h3>
                    <p style={{ color: "var(--text-muted)" }}>No pending requests require your attention.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-gray-800">
                    <table className="min-w-full">
                      <thead>
                        <tr style={{ background: "var(--bg-tertiary)" }}>
                          <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Type</th>
                          <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Student</th>
                          <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Details</th>
                          <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Submitted</th>
                          <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Pending Opt-Outs */}
                        {filteredOptOuts.map((opt) => (
                          <tr key={`opt-${opt._id}`} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                            <td className="px-5 py-4 whitespace-nowrap">
                              <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ background: "rgba(248, 113, 113, 0.15)", color: "#f87171" }}>Opt-Out</span>
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap font-medium" style={{ color: "var(--text-primary)" }}>
                              {typeof opt.user === "object" ? opt.user.name : opt.user}
                            </td>
                            <td className="px-5 py-4 text-sm" style={{ color: "var(--text-secondary)" }}>
                              <p className="font-semibold text-gray-300">{new Date(opt.startDate).toLocaleDateString()} – {new Date(opt.endDate).toLocaleDateString()}</p>
                              <p className="text-xs text-gray-500 mt-1 truncate max-w-xs">{opt.reason}</p>
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">
                              {opt.createdAt ? new Date(opt.createdAt).toLocaleDateString() : "N/A"}
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap text-right">
                              <div className="flex justify-end space-x-2">
                                <button onClick={() => handleApproveOptOut(opt._id, true)} className="btn-success px-3 py-1.5 text-xs">Approve</button>
                                <button onClick={() => handleApproveOptOut(opt._id, false)} className="btn-danger px-3 py-1.5 text-xs">Reject</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        
                        {/* Pending Rebates */}
                        {filteredRebates.map((reb) => (
                          <tr key={`reb-${reb._id}`} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                            <td className="px-5 py-4 whitespace-nowrap">
                              <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ background: "rgba(52, 211, 153, 0.15)", color: "#34d399" }}>Rebate</span>
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap font-medium" style={{ color: "var(--text-primary)" }}>
                              {typeof reb.user === "object" ? reb.user.name : reb.user}
                            </td>
                            <td className="px-5 py-4 text-sm" style={{ color: "var(--text-secondary)" }}>
                              <p className="font-semibold text-gray-300">Month: {reb.monthYear}</p>
                              <p className="text-xs text-green-400 mt-1 font-medium">Amount: ₹{reb.calculatedAmount}</p>
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">
                              {reb.monthYear}
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap text-right">
                              <div className="flex justify-end space-x-2">
                                <button onClick={() => handleApproveRebate(reb._id, "approved")} className="btn-success px-3 py-1.5 text-xs">Approve</button>
                                <button onClick={() => handleApproveRebate(reb._id, "rejected")} className="btn-danger px-3 py-1.5 text-xs">Reject</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ATTENDANCE VIEW */}
          {activeSection === "attendance" && (
            <div className="animate-fade-in">
              <SectionHeader title="Global Attendance Log" subtitle="Monitor all daily meal attendance records across the student body." color="#3b82f6" />
              
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Search student name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input w-full px-4 py-2.5 rounded-lg outline-none transition-all"
                  style={{ background: "var(--bg-surface)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}
                  onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
                  onBlur={(e) => e.target.style.borderColor = "var(--border-color)"}
                />
              </div>

              <div className="p-6 rounded-xl" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-color)" }}>
                <DarkTable
                  headers={["Student", "Date", "Total Meals", "Specifics"]}
                  rows={filteredAttendance.map((att) => [
                    <span className="font-medium">{typeof att.user === "object" ? att.user.name : att.user}</span>,
                    new Date(att.date).toLocaleDateString(),
                    att.totalMeals,
                    <div className="flex space-x-1.5">
                      {att.breakfast && <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: "rgba(251,146,60,0.15)", color: "#fb923c" }}>B</span>}
                      {att.lunch && <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: "rgba(52,211,153,0.15)", color: "#34d399" }}>L</span>}
                      {att.dinner && <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: "rgba(167,139,250,0.15)", color: "#a78bfa" }}>D</span>}
                    </div>,
                  ])}
                />
              </div>
            </div>
          )}

          {/* REVIEWS VIEW */}
          {activeSection === "reviews" && (
            <div className="animate-fade-in">
              <SectionHeader title="All Feedback" subtitle="Read detailed reviews submitted by students." color="#a78bfa" />
              
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Search student name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input w-full px-4 py-2.5 rounded-lg outline-none transition-all"
                  style={{ background: "var(--bg-surface)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}
                  onFocus={(e) => e.target.style.borderColor = "#a78bfa"}
                  onBlur={(e) => e.target.style.borderColor = "var(--border-color)"}
                />
              </div>

              <div className="p-6 rounded-xl" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-color)" }}>
                <DarkTable
                  headers={["Student", "Date", "Rating", "Comment"]}
                  rows={filteredReviews.map((rev) => [
                    <span className="font-medium">{typeof rev.user === "object" ? rev.user.name : rev.user}</span>,
                    new Date(rev.mealDate).toLocaleDateString(),
                    <div className="flex items-center">
                      {Array.from({ length: 5 }, (_, i) => i < rev.rating ? <SolidStarIcon key={i} className="w-4 h-4 text-yellow-400" /> : <HollowStarIcon key={i} className="w-4 h-4 text-gray-600" />)}
                    </div>,
                    <span className="text-gray-300">{rev.comment || "—"}</span>,
                  ])}
                />
              </div>
            </div>
          )}

          {/* OPT-OUTS VIEW */}
          {activeSection === "optout" && (
            <div className="animate-fade-in">
              <SectionHeader title="Opt-Out Records" subtitle="Historical and pending opt-out requests." color="#f87171" />
              
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Search student name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input w-full px-4 py-2.5 rounded-lg outline-none transition-all"
                  style={{ background: "var(--bg-surface)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}
                  onFocus={(e) => e.target.style.borderColor = "#f87171"}
                  onBlur={(e) => e.target.style.borderColor = "var(--border-color)"}
                />
              </div>

              <div className="p-6 rounded-xl" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-color)" }}>
                <DarkTable
                  headers={["Student", "Date Range", "Reason", "Status"]}
                  rows={filteredAllOptOuts.map((opt) => [
                    <span className="font-medium">{typeof opt.user === "object" ? opt.user.name : opt.user}</span>,
                    `${new Date(opt.startDate).toLocaleDateString()} – ${new Date(opt.endDate).toLocaleDateString()}`,
                    opt.reason,
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: opt.approved ? "rgba(52,211,153,0.15)" : "rgba(251,191,36,0.15)", color: opt.approved ? "var(--success-color)" : "var(--warning-color)" }}>{opt.approved ? "Approved" : "Pending"}</span>,
                  ])}
                />
              </div>
            </div>
          )}

          {/* REBATES VIEW */}
          {activeSection === "rebates" && (
            <div className="animate-fade-in">
              <SectionHeader title="Rebate Records" subtitle="Historical and pending rebate calculations." color="#34d399" />
              
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Search student name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input w-full px-4 py-2.5 rounded-lg outline-none transition-all"
                  style={{ background: "var(--bg-surface)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}
                  onFocus={(e) => e.target.style.borderColor = "#34d399"}
                  onBlur={(e) => e.target.style.borderColor = "var(--border-color)"}
                />
              </div>

              <div className="p-6 rounded-xl" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-color)" }}>
                <DarkTable
                  headers={["Student", "Month", "Amount", "Status"]}
                  rows={filteredAllRebates.map((reb) => [
                    <span className="font-medium">{typeof reb.user === "object" ? reb.user.name : reb.user}</span>,
                    reb.monthYear,
                    <span className="text-green-400 font-semibold">₹{reb.calculatedAmount}</span>,
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: reb.status === "approved" ? "rgba(52,211,153,0.15)" : reb.status === "pending" ? "rgba(251,191,36,0.15)" : "rgba(248,113,113,0.15)", color: reb.status === "approved" ? "var(--success-color)" : reb.status === "pending" ? "var(--warning-color)" : "var(--error-color)" }}>{reb.status}</span>,
                  ])}
                />
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

/* ========== REUSABLE SUB-COMPONENTS ========== */

const StatCard: React.FC<{ label: string; value: string; color: string; icon: React.ReactNode }> = ({ label, value, color, icon }) => (
  <div className="p-5 rounded-xl transition-all" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-color)" }}>
    <div className="flex items-center justify-between mb-3">
      <div className="w-12 h-12 rounded-lg flex items-center justify-center shadow-lg" style={{ background: `linear-gradient(135deg, ${color}, ${color}80)`, color: "#fff" }}>{icon}</div>
    </div>
    <p className="text-4xl font-bold" style={{ color: "var(--text-primary)" }}>{value}</p>
    <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>{label}</p>
  </div>
);

const SectionHeader: React.FC<{ title: string; subtitle: string; color: string }> = ({ title, subtitle, color }) => (
  <div className="mb-6 p-6 rounded-xl" style={{ background: `${color}10`, border: `1px solid ${color}20` }}>
    <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>{title}</h1>
    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{subtitle}</p>
  </div>
);

const DarkTable: React.FC<{ headers: string[]; rows: any[][] }> = ({ headers, rows }) => (
  <div className="overflow-x-auto rounded-lg" style={{ border: "1px solid var(--border-color)" }}>
    <table className="min-w-full">
      <thead>
        <tr style={{ background: "var(--bg-tertiary)" }}>
          {headers.map((h) => (
            <th key={h} className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr><td colSpan={headers.length} className="px-5 py-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>No data found.</td></tr>
        ) : (
          rows.map((row, i) => (
            <tr
              key={i}
              className="transition-colors"
              style={{ borderBottom: "1px solid var(--border-color)" }}
              onMouseOver={(e) => { e.currentTarget.style.background = "var(--bg-surface-hover)"; }}
              onMouseOut={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              {row.map((cell, j) => (
                <td key={j} className="px-5 py-4 whitespace-nowrap text-sm" style={{ color: "var(--text-primary)" }}>{cell}</td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);
