import React, { useState, useEffect, useRef } from "react"; // Added useRef
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

// --- DESIGN IMPROVEMENT (REQUEST 2) ---
// Solid star icon for filled state
const SolidStarIcon = ({ className }: { className: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path
      fillRule="evenodd"
      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.007z"
      clipRule="evenodd"
    />
  </svg>
);

// Hollow star icon for empty state
const HollowStarIcon = ({ className }: { className: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.31h5.513c.498 0 .703.656.32.99l-4.38 3.135a.563.563 0 00-.182.635l1.658 5.36a.562.562 0 01-.812.622l-4.38-3.135a.563.563 0 00-.656 0l-4.38 3.135a.562.562 0 01-.812-.622l1.658-5.36a.563.563 0 00-.182-.635l-4.38-3.135a.562.562 0 01.32-.99h5.513a.563.563 0 00.475-.31l2.125-5.111z"
    />
  </svg>
);

interface StudentDashboardProps {
  user: User;
  onLogout: () => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({
  user,
  onLogout,
}) => {
  // States
  const [attendanceHistory, setAttendanceHistory] = useState<MealAttendance[]>(
    []
  );
  const [rebates, setRebates] = useState<Rebate[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [optOuts, setOptOuts] = useState<OptOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mealForm, setMealForm] = useState({
    breakfast: false,
    lunch: false,
    dinner: false,
  });
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [hoverRating, setHoverRating] = useState(0);
  const [optOutForm, setOptOutForm] = useState({
    startDate: "",
    endDate: "",
    reason: "",
  });
  const [rebateLoading, setRebateLoading] = useState(false);
  const [optOutLoading, setOptOutLoading] = useState(false);
  const [currentRebate, setCurrentRebate] = useState<Rebate | null>(null);
  const [showEditProfile, setShowEditProfile] = useState(false);

  // --- DESIGN IMPROVEMENT (REQUEST 1) ---
  // State for the profile dropdown menu
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const today = new Date().toISOString().split("T")[0];

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [historyRes, rebatesRes, reviewsRes, optOutsRes] =
          await Promise.all([
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

  // --- DESIGN IMPROVEMENT (REQUEST 1) ---
  // Effect to handle clicking outside the profile menu to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
      const monthYear = new Date().toISOString().slice(0, 7); // YYYY-MM
      const res = await rebateService.calculateRebate(user.id, monthYear);
      if (res.success) setCurrentRebate(res.rebate || null);
    } catch (err) {
      setError("Failed to calculate rebate");
    } finally {
      setRebateLoading(false);
    }
  };

  const handleReviewChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setReviewForm({ ...reviewForm, [e.target.name]: e.target.value });
  };

  const submitReview = async () => {
    try {
      const res = await reviewService.submitReview({
        mealDate: today,
        ...reviewForm,
      });
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

  // --- Handlers for profile menu actions ---
  const handleEditProfileClick = () => {
    setShowEditProfile(true);
    setIsProfileMenuOpen(false);
  };

  const handleLogoutClick = () => {
    onLogout();
    setIsProfileMenuOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-bg min-h-screen">
      <nav className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="bg-white p-2 rounded-lg shadow-md border border-gray-100">
                  <img
                    src="/favicon.svg"
                    alt="DigiMess Logo"
                    className="h-8 w-8"
                  />
                </div>
                <h1 className="text-xl font-bold text-gray-900">
                  DigiMess
                </h1>
              </div>
            </div>

            {/* --- DESIGN IMPROVEMENT (REQUEST 1) ---
                This is the new Profile Dropdown Menu
            */}
            <div className="flex items-center space-x-4">
              <div className="relative" ref={profileMenuRef}>
                {/* Clickable Welcome Card */}
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-full border border-blue-100 hover:shadow-md transition-shadow cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <svg
                    className="h-5 w-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">
                    Welcome, {user.name}
                  </span>
                  {/* Dropdown arrow */}
                  <svg
                    className={`h-4 w-4 text-gray-600 transition-transform ${
                      isProfileMenuOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown Menu Panel */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-1 border border-gray-200 z-50">
                    <span
                      onClick={handleEditProfileClick}
                      className="flex items-center space-x-2 w-full text-left px-4 py-2 text-sm text-gray-700 transition-colors"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      <span>Edit Profile</span>
                    </span>
                    <span
                      onClick={handleLogoutClick}
                      className="flex items-center space-x-2 w-full text-left px-4 py-2 text-sm text-red-600 transition-colors"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      <span>Logout</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
            {/* --- End of Profile Dropdown --- */}
          </div>
        </div>
      </nav>

      <main className="py-12 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-0">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20">
            <div className="text-center mb-10">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Your Dashboard
              </h1>
              <p className="text-gray-600 text-lg">
                Manage your meals, track rebates, and share your feedback
                effortlessly.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-700 rounded-r-lg">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            {/* Meal Tracker Section */}
            <section className="mb-12">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-xl shadow-lg mb-6">
                <h2 className="text-2xl font-bold mb-2 flex items-center">
                  <svg
                    className="w-6 h-6 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Meal Tracker - {today}
                </h2>
                <p className="text-blue-100">
                  Log your daily meals and track your attendance
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <label className="flex items-center p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200 hover:shadow-md transition-shadow cursor-pointer">
                    <input
                      type="checkbox"
                      name="breakfast"
                      checked={mealForm.breakfast}
                      onChange={handleMealChange}
                      className="mr-3 h-5 w-5 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <div>
                      <span className="font-medium text-gray-900">
                        Breakfast
                      </span>
                      <p className="text-sm text-gray-600">Morning meal</p>
                    </div>
                  </label>
                  <label className="flex items-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200 hover:shadow-md transition-shadow cursor-pointer">
                    <input
                      type="checkbox"
                      name="lunch"
                      checked={mealForm.lunch}
                      onChange={handleMealChange}
                      className="mr-3 h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <div>
                      <span className="font-medium text-gray-900">Lunch</span>
                      <p className="text-sm text-gray-600">Afternoon meal</p>
                    </div>
                  </label>
                  <label className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200 hover:shadow-md transition-shadow cursor-pointer">
                    <input
                      type="checkbox"
                      name="dinner"
                      checked={mealForm.dinner}
                      onChange={handleMealChange}
                      className="mr-3 h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <div>
                      <span className="font-medium text-gray-900">Dinner</span>
                      <p className="text-sm text-gray-600">Evening meal</p>
                    </div>
                  </label>
                </div>
                <button
                  onClick={submitAttendance}
                  className="flex items-center justify-center space-x-2 w-full md:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Log Attendance</span>
                </button>
              </div>
              <div className="mt-8">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  Recent Attendance History
                </h3>
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Meals
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {attendanceHistory
                        .slice(-5)
                        .reverse()
                        .map((att) => (
                          <tr
                            key={att._id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {new Date(att.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div className="flex space-x-2">
                                {att.breakfast && (
                                  <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                                    B
                                  </span>
                                )}
                                {att.lunch && (
                                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                    L
                                  </span>
                                )}
                                {att.dinner && (
                                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                                    D
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                              {att.totalMeals}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Rebate Section */}
            <section className="mb-12">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-xl shadow-lg mb-6">
                <h2 className="text-2xl font-bold mb-2 flex items-center">
                  <svg
                    className="w-6 h-6 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                  Rebate Calculator
                </h2>
                <p className="text-green-100">
                  Calculate and track your monthly meal rebates
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <button
                  onClick={calculateRebate}
                  disabled={rebateLoading}
                  className="flex items-center justify-center space-x-2 w-full md:w-auto px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {rebateLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Calculating...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                      <span>Calculate Current Month Rebate</span>
                    </>
                  )}
                </button>
                {currentRebate && (
                  <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                    <h3 className="font-bold text-lg text-gray-900 mb-4">
                      Rebate for {currentRebate.monthYear}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          ₹{currentRebate.calculatedAmount}
                        </p>
                        <p className="text-sm text-gray-600">Amount</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {currentRebate.attendedDays}
                        </p>
                        <p className="text-sm text-gray-600">Attended</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-600">
                          {currentRebate.optOutDays}
                        </p>
                        <p className="text-sm text-gray-600">Opt-out</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">
                          {currentRebate.missedDays}
                        </p>
                        <p className="text-sm text-gray-600">Missed</p>
                      </div>
                    </div>
                    <div className="mt-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          currentRebate.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : currentRebate.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        Status: {currentRebate.status}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-8">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  Rebate History
                </h3>
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Month
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {rebates
                        .slice(-5)
                        .reverse()
                        .map((reb) => (
                          <tr
                            key={reb._id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {reb.monthYear}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                              ₹{reb.calculatedAmount}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  reb.status === "approved"
                                    ? "bg-green-100 text-green-800"
                                    : reb.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {reb.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Reviews Section */}
            <section className="mb-12">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6 rounded-xl shadow-lg mb-6">
                <h2 className="text-2xl font-bold mb-2 flex items-center">
                  <svg
                    className="w-6 h-6 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  Food Reviews - {today}
                </h2>
                <p className="text-purple-100">
                  Share your feedback and help improve our meals
                </p>
              </div>

              {/* Review submission form */}
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Rating
                    </label>
                    {/* --- DESIGN IMPROVEMENT (REQUEST 2) ---
                        New Hollow/Solid interactive star rating UI
                    */}
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          onClick={() =>
                            setReviewForm({ ...reviewForm, rating: star })
                          }
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 rounded-full text-gray-400 transition-colors duration-150"
                        >
                          {star <= (hoverRating || reviewForm.rating) ? (
                            <SolidStarIcon className="w-10 h-10 text-yellow-400" />
                          ) : (
                            <HollowStarIcon className="w-10 h-10 text-gray-400" />
                          )}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Comment
                    </label>
                    <textarea
                      name="comment"
                      value={reviewForm.comment}
                      onChange={handleReviewChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      placeholder="Share your thoughts about today's meals..."
                    />
                  </div>
                </div>

                <span
                  onClick={submitReview}
                  className="flex items-center justify-center space-x-2 w-[50%] max-w-[50%] md:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200"
                >
                  <svg
                    transform="rotate(40)"
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                  <span>Submit Review</span>
                </span>
              </div>

              {/* Past reviews table */}
              <div className="mt-8">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  Your Past Reviews
                </h3>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Rating
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Comment
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {reviews
                        .slice(-5)
                        .reverse()
                        .map((rev) => (
                          <tr
                            key={rev._id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {new Date(rev.mealDate).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {/* --- DESIGN IMPROVEMENT (REQUEST 2) ---
                                  Using new star icons in the table for consistency
                              */}
                              <div className="flex items-center">
                                {Array.from({ length: 5 }, (_, i) =>
                                  i < rev.rating ? (
                                    <SolidStarIcon
                                      key={i}
                                      className="w-5 h-5 text-yellow-400"
                                    />
                                  ) : (
                                    <HollowStarIcon
                                      key={i}
                                      className="w-5 h-5 text-gray-300"
                                    />
                                  )
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                              {rev.comment || "No comment provided"}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Opt-Out Section */}
            <section className="mb-12">
              <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white p-6 rounded-xl shadow-lg mb-6">
                <h2 className="text-2xl font-bold mb-2 flex items-center">
                  <svg
                    className="w-6 h-6 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Opt-Out Requests
                </h2>
                <p className="text-red-100">
                  Request to skip meals for specific dates
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={optOutForm.startDate}
                      onChange={handleOptOutChange}
                      min={today}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={optOutForm.endDate}
                      onChange={handleOptOutChange}
                      min={optOutForm.startDate || today}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Reason
                    </label>
                    <input
                      type="text"
                      name="reason"
                      value={optOutForm.reason}
                      onChange={handleOptOutChange}
                      placeholder="e.g., Vacation, Sick leave"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <button
                  onClick={submitOptOut}
                  disabled={optOutLoading}
                  className="flex items-center justify-center space-x-2 w-full md:w-auto px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:from-red-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {optOutLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                      </svg>
                      <span>Submit Opt-Out Request</span>
                    </>
                  )}
                </button>
              </div>
              <div className="mt-8">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  Opt-Out History
                </h3>
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Start Date
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          End Date
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Reason
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {optOuts
                        .slice(-5)
                        .reverse()
                        .map((opt) => (
                          <tr
                            key={opt._id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {new Date(opt.startDate).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {new Date(opt.endDate).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                              {opt.reason}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  opt.approved
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {opt.approved ? "Approved" : "Pending"}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <EditProfile
          user={user}
          onProfileUpdate={handleProfileUpdate}
          onClose={() => setShowEditProfile(false)}
        />
      )}
    </div>
  );
};

export default StudentDashboard;