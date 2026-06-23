import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import type {
  User,
  MealAttendance,
  Rebate,
  Review,
  OptOut,
} from "../types/User";
import { mealService } from "../services/mealService";
import { rebateService } from "../services/rebateService";
import { reviewService } from "../services/reviewService";
import { optoutService } from "../services/optoutService";
import { EditProfile } from "./EditProfile";

// Solid star icon for filled state
const SolidStarIcon = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.007z" clipRule="evenodd" />
  </svg>
);

// Hollow star icon for empty state
const HollowStarIcon = ({ className, style }: { className: string; style?: React.CSSProperties }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.31h5.513c.498 0 .703.656.32.99l-4.38 3.135a.563.563 0 00-.182.635l1.658 5.36a.562.562 0 01-.812.622l-4.38-3.135a.563.563 0 00-.656 0l-4.38 3.135a.562.562 0 01-.812-.622l1.658-5.36a.563.563 0 00-.182-.635l-4.38-3.135a.562.562 0 01.32-.99h5.513a.563.563 0 00.475-.31l2.125-5.111z" />
  </svg>
);

// === Sidebar Nav Items ===
type SectionId = "dashboard" | "meals" | "reviews" | "optout" | "rebates";

interface NavItem {
  id: SectionId;
  label: string;
  icon: React.ReactNode;
  accentColor: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    accentColor: "#818cf8",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    id: "meals",
    label: "Meal Tracker",
    accentColor: "#818cf8",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    ),
  },
  {
    id: "reviews",
    label: "Food Reviews",
    accentColor: "#a78bfa",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  },
  {
    id: "optout",
    label: "Opt-Out",
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

interface StudentDashboardProps {
  user: User;
  onLogout: () => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, onLogout }) => {
  // Active section
  const [activeSection, setActiveSection] = useState<SectionId>("dashboard");

  // Data states
  const [attendanceHistory, setAttendanceHistory] = useState<MealAttendance[]>([]);
  const [rebates, setRebates] = useState<Rebate[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [optOuts, setOptOuts] = useState<OptOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mealForm, setMealForm] = useState({ breakfast: false, lunch: false, dinner: false });
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [hoverRating, setHoverRating] = useState(0);
  const [optOutForm, setOptOutForm] = useState({ startDate: "", endDate: "", reason: "" });
  const [rebateLoading, setRebateLoading] = useState(false);
  const [optOutLoading, setOptOutLoading] = useState(false);
  const [currentRebate, setCurrentRebate] = useState<Rebate | null>(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [historyRes, rebatesRes, reviewsRes, optOutsRes] = await Promise.all([
          mealService.getHistory(user.id),
          rebateService.getRebates(user.id),
          reviewService.getReviews(user.id),
          optoutService.getOptOuts(user.id),
        ]);
        if (historyRes.success) setAttendanceHistory(historyRes.history);
        if (rebatesRes.success) setRebates(rebatesRes.rebates);
        if (reviewsRes.success) setReviews(reviewsRes.reviews);
        if (optOutsRes.success) setOptOuts(optOutsRes.optOuts);
      } catch (err) {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.id]);

  // Handlers
  const handleMealChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMealForm({ ...mealForm, [e.target.name]: e.target.checked });
  };

  const submitAttendance = async () => {
    try {
      const res = await mealService.logAttendance({ date: today, ...mealForm });
      if (res.success) {
        const historyRes = await mealService.getHistory(user.id);
        if (historyRes.success) setAttendanceHistory(historyRes.history);
        setMealForm({ breakfast: false, lunch: false, dinner: false });
      }
    } catch (err) {
      setError("Failed to log attendance");
    }
  };

  const calculateRebate = async () => {
    try {
      setRebateLoading(true);
      const monthYear = new Date().toISOString().slice(0, 7);
      const res = await rebateService.calculateRebate(user.id, monthYear);
      if (res.success) setCurrentRebate(res.rebate || null);
    } catch (err) {
      setError("Failed to calculate rebate");
    } finally {
      setRebateLoading(false);
    }
  };

  const handleReviewChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setReviewForm({ ...reviewForm, [e.target.name]: e.target.value });
  };

  const submitReview = async () => {
    try {
      const res = await reviewService.submitReview({ mealDate: today, ...reviewForm });
      if (res.success) {
        const reviewsRes = await reviewService.getReviews(user.id);
        if (reviewsRes.success) setReviews(reviewsRes.reviews);
        setReviewForm({ rating: 5, comment: "" });
      }
    } catch (err) {
      setError("Failed to submit review");
    }
  };

  const handleOptOutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOptOutForm({ ...optOutForm, [e.target.name]: e.target.value });
  };

  const submitOptOut = async () => {
    try {
      setOptOutLoading(true);
      const res = await optoutService.submitOptOut(optOutForm);
      if (res.success) {
        const optOutsRes = await optoutService.getOptOuts(user.id);
        if (optOutsRes.success) setOptOuts(optOutsRes.optOuts);
        setOptOutForm({ startDate: "", endDate: "", reason: "" });
      }
    } catch (err) {
      setError("Failed to submit opt-out request");
    } finally {
      setOptOutLoading(false);
    }
  };

  const handleProfileUpdate = (updatedUser: User) => {
    console.log("Profile updated", updatedUser);
    setShowEditProfile(false);
  };

  // Quick stat helpers
  const totalMealsThisMonth = attendanceHistory.reduce((sum, a) => sum + (a.totalMeals || 0), 0);
  const pendingOptOuts = optOuts.filter(o => !o.approved).length;
  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "—";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-primary)" }}>
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--primary-color)", borderTopColor: "transparent" }} />
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Loading dashboard...</p>
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
                DigiMess
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
                className="w-full flex items-center rounded-xl transition-all duration-200 border-none shadow-none"
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
              </button>
            );
          })}
        </nav>

        {/* Bottom — Profile & Logout */}
        <div className="px-3 py-4 space-y-1" style={{ borderTop: "1px solid var(--border-color)" }}>
          <button
            onClick={() => setShowEditProfile(true)}
            className="w-full flex items-center rounded-xl transition-all duration-200 border-none shadow-none"
            style={{
              padding: sidebarCollapsed ? "10px" : "10px 14px",
              justifyContent: sidebarCollapsed ? "center" : "flex-start",
              background: "transparent",
              color: "var(--text-secondary)",
            }}
            title={sidebarCollapsed ? "Edit Profile" : undefined}
          >
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {!sidebarCollapsed && (
              <div className="ml-3 text-left overflow-hidden">
                <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{user.name}</p>
                <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{user.email}</p>
              </div>
            )}
          </button>

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
        <div className="max-w-5xl mx-auto px-6 py-8">
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

          {/* DASHBOARD VIEW */}
          {activeSection === "dashboard" && (
            <div className="animate-fade-in">
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
                  Welcome back, {user.name}
                </h1>
                <p style={{ color: "var(--text-secondary)" }}>Here's your overview for today — {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard label="Total Meals" value={String(totalMealsThisMonth)} color="#818cf8" icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                } />
                <StatCard label="Avg. Rating" value={avgRating} color="#fbbf24" icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                } />
                <StatCard label="Pending Opt-Outs" value={String(pendingOptOuts)} color="#f87171" icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                } />
                <StatCard label="Rebates" value={String(rebates.length)} color="#34d399" icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" /></svg>
                } />
              </div>

              {/* Meal Attendance (inline) */}
              <div className="p-6 rounded-xl mb-6" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-color)" }}>
                <h2 className="text-xl font-semibold mb-4 flex items-center" style={{ color: "var(--text-primary)" }}>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--primary-color)" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Mark Attendance — {today}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  {(["breakfast", "lunch", "dinner"] as const).map((meal) => {
                    const colors: Record<string, string> = { breakfast: "#fb923c", lunch: "#34d399", dinner: "#a78bfa" };
                    const labels: Record<string, string> = { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner" };
                    const checked = mealForm[meal];
                    return (
                      <label
                        key={meal}
                        className="flex items-center p-3.5 rounded-lg cursor-pointer transition-all"
                        style={{
                          background: checked ? `${colors[meal]}15` : "var(--bg-surface-hover)",
                          border: `1px solid ${checked ? `${colors[meal]}30` : "var(--border-color)"}`,
                        }}
                      >
                        <input type="checkbox" name={meal} checked={checked} onChange={handleMealChange} className="mr-3 h-4 w-4 rounded" style={{ accentColor: colors[meal] }} />
                        <span className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>{labels[meal]}</span>
                      </label>
                    );
                  })}
                </div>
                <button onClick={submitAttendance} className="btn-primary flex items-center space-x-2 px-5 py-2.5 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span>Log Attendance</span>
                </button>
              </div>

              {/* Recent History */}
              <div className="p-6 rounded-xl" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-color)" }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Recent Attendance</h3>
                  <button onClick={() => setActiveSection("meals")} className="text-xs font-medium bg-transparent border-none shadow-none p-0" style={{ color: "var(--primary-color)" }}>
                    View All →
                  </button>
                </div>
                <DarkTable
                  headers={["Date", "Meals", "Total"]}
                  rows={attendanceHistory.slice(-5).reverse().map((att) => [
                    new Date(att.date).toLocaleDateString(),
                    <div className="flex space-x-1.5">
                      {att.breakfast && <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: "rgba(251,146,60,0.15)", color: "#fb923c" }}>B</span>}
                      {att.lunch && <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: "rgba(52,211,153,0.15)", color: "#34d399" }}>L</span>}
                      {att.dinner && <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: "rgba(167,139,250,0.15)", color: "#a78bfa" }}>D</span>}
                    </div>,
                    att.totalMeals,
                  ])}
                />
              </div>
            </div>
          )}

          {/* MEALS VIEW */}
          {activeSection === "meals" && (
            <div className="animate-fade-in">
              <SectionHeader title="Meal Tracker" subtitle="Log your daily meals and view your complete attendance history" color="#818cf8" />

              <div className="p-6 rounded-xl mb-6" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-color)" }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Mark Attendance — {today}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  {(["breakfast", "lunch", "dinner"] as const).map((meal) => {
                    const colors: Record<string, string> = { breakfast: "#fb923c", lunch: "#34d399", dinner: "#a78bfa" };
                    const labels: Record<string, string> = { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner" };
                    const descs: Record<string, string> = { breakfast: "Morning meal", lunch: "Afternoon meal", dinner: "Evening meal" };
                    const checked = mealForm[meal];
                    return (
                      <label key={meal} className="flex items-center p-4 rounded-lg cursor-pointer transition-all" style={{ background: checked ? `${colors[meal]}15` : "var(--bg-surface-hover)", border: `1px solid ${checked ? `${colors[meal]}30` : "var(--border-color)"}` }}>
                        <input type="checkbox" name={meal} checked={checked} onChange={handleMealChange} className="mr-3 h-5 w-5 rounded" style={{ accentColor: colors[meal] }} />
                        <div>
                          <span className="font-medium" style={{ color: "var(--text-primary)" }}>{labels[meal]}</span>
                          <p className="text-xs" style={{ color: "var(--text-muted)" }}>{descs[meal]}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
                <button onClick={submitAttendance} className="btn-primary flex items-center space-x-2 px-6 py-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span>Log Attendance</span>
                </button>
              </div>

              <div className="p-6 rounded-xl" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-color)" }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Attendance History</h3>
                <DarkTable
                  headers={["Date", "Meals", "Total"]}
                  rows={attendanceHistory.slice(-10).reverse().map((att) => [
                    new Date(att.date).toLocaleDateString(),
                    <div className="flex space-x-1.5">
                      {att.breakfast && <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: "rgba(251,146,60,0.15)", color: "#fb923c" }}>B</span>}
                      {att.lunch && <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: "rgba(52,211,153,0.15)", color: "#34d399" }}>L</span>}
                      {att.dinner && <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: "rgba(167,139,250,0.15)", color: "#a78bfa" }}>D</span>}
                    </div>,
                    att.totalMeals,
                  ])}
                />
              </div>
            </div>
          )}

          {/* REVIEWS VIEW */}
          {activeSection === "reviews" && (
            <div className="animate-fade-in">
              <SectionHeader title="Food Reviews" subtitle="Share your feedback and help improve our meals" color="#a78bfa" />

              <div className="p-6 rounded-xl mb-6" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-color)" }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Submit a Review — {today}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Rating</label>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} onClick={() => setReviewForm({ ...reviewForm, rating: star })} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} className="p-0.5 cursor-pointer transition-colors duration-150">
                          {star <= (hoverRating || reviewForm.rating)
                            ? <SolidStarIcon className="w-9 h-9 text-yellow-400" />
                            : <HollowStarIcon className="w-9 h-9" style={{ color: "var(--text-muted)" }} />
                          }
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Comment</label>
                    <textarea name="comment" value={reviewForm.comment} onChange={handleReviewChange} rows={3} className="form-input resize-none" placeholder="Share your thoughts about today's meals..." />
                  </div>
                </div>
                <button onClick={submitReview} className="flex items-center space-x-2 px-6 py-3 font-semibold rounded-lg text-white transition-all" style={{ background: "linear-gradient(135deg, var(--accent-color), var(--accent-secondary))", boxShadow: "0 2px 10px rgba(167,139,250,0.25)" }}>
                  <svg transform="rotate(40)" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                  <span>Submit Review</span>
                </button>
              </div>

              <div className="p-6 rounded-xl" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-color)" }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Your Past Reviews</h3>
                <DarkTable
                  headers={["Date", "Rating", "Comment"]}
                  rows={reviews.slice(-10).reverse().map((rev) => [
                    new Date(rev.mealDate).toLocaleDateString(),
                    <div className="flex items-center">
                      {Array.from({ length: 5 }, (_, i) => i < rev.rating ? <SolidStarIcon key={i} className="w-4 h-4 text-yellow-400" /> : <HollowStarIcon key={i} className="w-4 h-4" style={{ color: "var(--text-muted)" }} />)}
                    </div>,
                    <span className="max-w-xs truncate block" style={{ color: "var(--text-secondary)" }}>{rev.comment || "No comment"}</span>,
                  ])}
                />
              </div>
            </div>
          )}

          {/* OPT-OUT VIEW */}
          {activeSection === "optout" && (
            <div className="animate-fade-in">
              <SectionHeader title="Opt-Out Requests" subtitle="Request to skip meals for specific date ranges" color="#f87171" />

              <div className="p-6 rounded-xl mb-6" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-color)" }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>New Opt-Out Request</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Start Date</label>
                    <input type="date" name="startDate" value={optOutForm.startDate} onChange={handleOptOutChange} min={today} className="form-input" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>End Date</label>
                    <input type="date" name="endDate" value={optOutForm.endDate} onChange={handleOptOutChange} min={optOutForm.startDate || today} className="form-input" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Reason</label>
                    <input type="text" name="reason" value={optOutForm.reason} onChange={handleOptOutChange} placeholder="e.g., Vacation" className="form-input" />
                  </div>
                </div>
                <button onClick={submitOptOut} disabled={optOutLoading} className="btn-danger flex items-center space-x-2 px-6 py-3 disabled:opacity-50">
                  {optOutLoading ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /><span>Submitting...</span></> : <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg><span>Submit Request</span></>}
                </button>
              </div>

              <div className="p-6 rounded-xl" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-color)" }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Opt-Out History</h3>
                <DarkTable
                  headers={["Start", "End", "Reason", "Status"]}
                  rows={optOuts.slice(-10).reverse().map((opt) => [
                    new Date(opt.startDate).toLocaleDateString(),
                    new Date(opt.endDate).toLocaleDateString(),
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
              <SectionHeader title="Rebate Calculator" subtitle="Calculate and track your monthly meal rebates" color="#34d399" />

              <div className="p-6 rounded-xl mb-6" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-color)" }}>
                <button onClick={calculateRebate} disabled={rebateLoading} className="btn-success flex items-center space-x-2 px-6 py-3 disabled:opacity-50">
                  {rebateLoading ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /><span>Calculating...</span></> : <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg><span>Calculate Current Month</span></>}
                </button>

                {currentRebate && (
                  <div className="mt-6 p-6 rounded-xl" style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.15)" }}>
                    <h4 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Rebate for {currentRebate.monthYear}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold" style={{ color: "var(--success-color)" }}>₹{currentRebate.calculatedAmount}</p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>Amount</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold" style={{ color: "var(--primary-color)" }}>{currentRebate.attendedDays}</p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>Attended</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold" style={{ color: "var(--warning-color)" }}>{currentRebate.optOutDays}</p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>Opt-out</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold" style={{ color: "var(--error-color)" }}>{currentRebate.missedDays}</p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>Missed</p>
                      </div>
                    </div>
                    <div className="mt-4 text-center">
                      <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ background: currentRebate.status === "approved" ? "rgba(52,211,153,0.15)" : currentRebate.status === "pending" ? "rgba(251,191,36,0.15)" : "rgba(248,113,113,0.15)", color: currentRebate.status === "approved" ? "var(--success-color)" : currentRebate.status === "pending" ? "var(--warning-color)" : "var(--error-color)" }}>
                        {currentRebate.status}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 rounded-xl" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-color)" }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Rebate History</h3>
                <DarkTable
                  headers={["Month", "Amount", "Status"]}
                  rows={rebates.slice(-10).reverse().map((reb) => [
                    reb.monthYear,
                    <span style={{ color: "var(--success-color)", fontWeight: 600 }}>₹{reb.calculatedAmount}</span>,
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: reb.status === "approved" ? "rgba(52,211,153,0.15)" : reb.status === "pending" ? "rgba(251,191,36,0.15)" : "rgba(248,113,113,0.15)", color: reb.status === "approved" ? "var(--success-color)" : reb.status === "pending" ? "var(--warning-color)" : "var(--error-color)" }}>{reb.status}</span>,
                  ])}
                />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <EditProfile user={user} onProfileUpdate={handleProfileUpdate} onClose={() => setShowEditProfile(false)} />
      )}
    </div>
  );
};

/* ========== REUSABLE SUB-COMPONENTS ========== */

const StatCard: React.FC<{ label: string; value: string; color: string; icon: React.ReactNode }> = ({ label, value, color, icon }) => (
  <div className="p-4 rounded-xl transition-all" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-color)" }}>
    <div className="flex items-center justify-between mb-2">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${color}15`, color }}>{icon}</div>
    </div>
    <p className="text-2xl font-bold" style={{ color }}>{value}</p>
    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</p>
  </div>
);

const SectionHeader: React.FC<{ title: string; subtitle: string; color: string }> = ({ title, subtitle, color }) => (
  <div className="mb-6 p-5 rounded-xl" style={{ background: `${color}10`, border: `1px solid ${color}20` }}>
    <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>{title}</h1>
    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{subtitle}</p>
  </div>
);

const DarkTable: React.FC<{ headers: string[]; rows: any[][] }> = ({ headers, rows }) => (
  <div className="overflow-x-auto rounded-lg" style={{ border: "1px solid var(--border-color)" }}>
    <table className="min-w-full">
      <thead>
        <tr style={{ background: "var(--bg-tertiary)" }}>
          {headers.map((h) => (
            <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr><td colSpan={headers.length} className="px-5 py-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>No data yet</td></tr>
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
                <td key={j} className="px-5 py-3 whitespace-nowrap text-sm" style={{ color: "var(--text-primary)" }}>{cell}</td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

export default StudentDashboard;