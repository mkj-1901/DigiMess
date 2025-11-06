import React, { useState, useEffect } from "react";
import type {
  User,
  OptOut,
  Rebate,
  Review,
  MealAttendance,
} from "../types/User";
import { optoutService } from "../services/optoutService";
import { rebateService } from "../services/rebateService";
import { reviewService } from "../services/reviewService";
import { adminService } from "../services/adminService";

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  onLogout,
}) => {
  // States
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeToday: 0,
    pendingRequests: 0,
  });
  const today = new Date().toISOString().split("T")[0];
  const [optOuts, setOptOuts] = useState<OptOut[]>([]);
  const [rebates, setRebates] = useState<Rebate[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [attendance, setAttendance] = useState<MealAttendance[]>([]);
  const [reviewSummary, setReviewSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Collapsible section states
  const [showAttendance, setShowAttendance] = useState(false);
  const [showOptOuts, setShowOptOuts] = useState(false);
  const [showReviews, setShowReviews] = useState(true);
  const [showRebates, setShowRebates] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [
          statsRes,
          optOutsRes,
          rebatesRes,
          reviewsRes,
          attendanceRes,
          summaryRes,
        ] = await Promise.all([
          adminService.getStats(),
          adminService.getOptOuts(),
          adminService.getRebates(),
          adminService.getReviews(),
          adminService.getAttendance(),
          adminService.getReviewSummary(),
        ]);

        if (statsRes.success) setStats(statsRes.stats);
        if (optOutsRes.success && optOutsRes.data) setOptOuts(optOutsRes.data);
        if (rebatesRes.success && rebatesRes.data) setRebates(rebatesRes.data);
        if (reviewsRes.success && reviewsRes.data) setReviews(reviewsRes.data);
        if (attendanceRes.success && attendanceRes.data)
          setAttendance(attendanceRes.data);
        if (summaryRes.success) setReviewSummary(summaryRes.data);
      } catch (err) {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleApproveOptOut = async (id: string, approved: boolean) => {
    try {
      await optoutService.approveOptOut(id, { approved, adminNotes: "" });
      // Refresh
      const optOutsRes = await adminService.getOptOuts();
      if (optOutsRes.success && optOutsRes.data) setOptOuts(optOutsRes.data);
    } catch (err) {
      setError("Failed to update opt-out");
    }
  };

  const handleApproveRebate = async (id: string, status: string) => {
    try {
      await rebateService.approveRebate(id, { status, notes: "" });
      // Refresh
      const rebatesRes = await adminService.getRebates();
      if (rebatesRes.success && rebatesRes.data) setRebates(rebatesRes.data);
    } catch (err) {
      setError("Failed to update rebate");
    }
  };

  if (loading) {
    return (
      <div className="dashboard-bg loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-bg min-h-screen">
      <nav className="nav">
        <div className="px-4 sm:px-6 lg:px-8 py-1">
          <div className="flex justify-between h-16">
            <div className="flex items-center rounded">
                <div className="flex items-center space-x-3 text-xs">
                  <div className="p-2 rounded-lg">
                    <img
                      src="/favicon.svg"
                      alt="DigiMess Logo"
                      className="h-10 w-10"
                    />
                  </div>
                  <h1 className="text-base font-bold text-gray-900">
                    DigiMess Admin Dashboard
                  </h1>
                </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-white/50 px-3 py-1 rounded-full">
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
              </div>
              <button
                onClick={onLogout}
                className="btn-danger flex items-center space-x-2 hover:scale-105 transition-transform"
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
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-8 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-0">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Admin Control Center
              </h2>
              <p className="text-gray-600 text-lg">
                Oversee mess operations, monitor performance, and manage
                approvals with ease.
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

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-12">
              <div className="card p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <svg
                        className="w-7 h-7 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Users
                      </dt>
                      <dd className="text-3xl font-bold text-gray-900">
                        {stats.totalUsers}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="card p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                      <svg
                        className="w-7 h-7 text-white"
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
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Students Marked Attendance Today
                      </dt>
                      <dd className="text-3xl font-bold text-gray-900">
                        {
                          new Set(
                            attendance
                              .filter((att) => att.date === today)
                              .map((att) =>
                                typeof att.user === "object"
                                  ? att.user.id
                                  : att.user
                              )
                          ).size
                        }
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="card p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                      <svg
                        className="w-7 h-7 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Pending Requests
                      </dt>
                      <dd className="text-3xl font-bold text-gray-900">
                        {stats.pendingRequests}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            {/* Feedback Summary Section */}
            <section className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Feedback Summary</h3>

                <button
                  onClick={async () => {
                    try {
                      setLoading(true);
                      const summaryRes = await adminService.getReviewSummary();
                      if (summaryRes.success) setReviewSummary(summaryRes.data);
                    } catch (err) {
                      setError("Failed to refresh feedback summary");
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-all duration-200 ${
                    loading
                      ? "bg-yellow-400 text-white cursor-not-allowed"
                      : "bg-yellow-500 hover:bg-yellow-600 text-white hover:shadow-md"
                  }`}
                >
                  {loading ? (
                    <>
                      <svg
                        className="w-4 h-4 animate-spin text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        ></path>
                      </svg>
                      <span>Refreshing...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v6h6M20 20v-6h-6M5 19A9 9 0 0119 5"
                        />
                      </svg>
                      <span>Refresh</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg shadow-md p-6 border border-yellow-200">
                {reviewSummary ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl font-bold text-yellow-600">
                        {reviewSummary.averageRating?.toFixed(1) || "N/A"}
                      </div>
                      <div className="text-gray-600 text-sm">
                        Average Rating (out of 5)
                      </div>
                    </div>

                    {reviewSummary.summaryText ? (
                      <div className="bg-white rounded-md p-4 shadow-sm border border-gray-100">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                          Summary of Feedback:
                        </h4>
                        <p className="text-gray-700 italic">
                          {reviewSummary.summaryText}
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-3">
                        No summarized feedback available yet.
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    Loading feedback summary...
                  </p>
                )}
              </div>
            </section>

            {/* Consolidated Pending Requests */}
            <section className="mt-12">
              <h3 className="text-xl font-bold mb-4">All Pending Requests</h3>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Request Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submitted
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* Pending Opt-Outs */}
                    {optOuts
                      .filter((opt) => opt.approved === false)
                      .map((opt) => (
                        <tr key={`optout-${opt._id}`} className="bg-blue-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-800">
                            Opt-Out
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {typeof opt.user === "object"
                              ? opt.user.name
                              : opt.user}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {new Date(opt.startDate).toLocaleDateString()} -{" "}
                            {new Date(opt.endDate).toLocaleDateString()}
                            <br />
                            <span className="text-xs text-gray-500">
                              {opt.reason.substring(0, 50)}
                              {opt.reason.length > 50 ? "..." : ""}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {opt.createdAt
                              ? new Date(opt.createdAt).toLocaleDateString()
                              : "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => handleApproveOptOut(opt._id, true)}
                              className="btn-success mr-2"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() =>
                                handleApproveOptOut(opt._id, false)
                              }
                              className="btn-danger"
                            >
                              Reject
                            </button>
                          </td>
                        </tr>
                      ))}

                    {/* Pending Rebates */}
                    {rebates
                      .filter((reb) => reb.status === "pending")
                      .map((reb) => (
                        <tr key={`rebate-${reb._id}`} className="bg-green-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-800">
                            Rebate
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {typeof reb.user === "object"
                              ? reb.user.name
                              : reb.user}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            Month: {reb.monthYear}
                            <br />
                            <span className="text-xs text-gray-500">
                              Amount: ₹{reb.calculatedAmount}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {reb.monthYear || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() =>
                                handleApproveRebate(reb._id, "approved")
                              }
                              className="btn-success mr-2"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() =>
                                handleApproveRebate(reb._id, "rejected")
                              }
                              className="btn-danger"
                            >
                              Reject
                            </button>
                          </td>
                        </tr>
                      ))}

                    {/* Pending Reviews (display only, backend handles moderation) */}
                    {reviews
                      .filter((rev) => rev.approved === false)
                      .map((rev) => (
                        <tr key={`review-${rev._id}`} className="bg-purple-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-800">
                            Review
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {typeof rev.user === "object"
                              ? rev.user.name
                              : rev.user}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            Rating: {rev.rating}/5
                            <br />
                            <span className="text-xs text-gray-500">
                              {rev.comment
                                ? rev.comment.substring(0, 80) +
                                  (rev.comment.length > 80 ? "..." : "")
                                : "No comment"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {rev.createdAt
                              ? new Date(rev.createdAt).toLocaleDateString()
                              : "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 italic">
                            Backend handles moderation
                          </td>
                        </tr>
                      ))}

                    {/* No pending requests message */}
                    {optOuts.filter((opt) => opt.approved === false).length ===
                      0 &&
                      rebates.filter((reb) => reb.status === "pending")
                        .length === 0 &&
                      reviews.filter((rev) => rev.approved === false).length ===
                        0 && (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-6 py-8 text-center text-gray-500"
                          >
                            <div className="flex flex-col items-center">
                              <svg
                                className="w-10 h-10 text-gray-400 mb-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              <p className="text-lg font-medium">
                                No pending requests to approve
                              </p>
                              <p className="text-sm">
                                All requests have been processed
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Attendance Overview */}
            <section className="mt-12">
              <button
                onClick={() => setShowAttendance(!showAttendance)}
                className="w-full text-left flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center space-x-3">
                  <svg
                    className="h-6 w-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    />
                  </svg>
                  <h3 className="text-xl font-bold text-gray-900">
                    Recent Attendance
                  </h3>
                </div>
                <svg
                  className={`h-5 w-5 text-gray-500 transform transition-transform duration-200 ${
                    showAttendance ? "rotate-180" : ""
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
              {showAttendance && (
                <div className="mt-4 bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-4 bg-blue-50 border-l-4 border-blue-400">
                    <p className="text-sm text-blue-700">
                      View recent meal attendance records for all students. This
                      helps track daily participation and monitor mess usage
                      patterns.
                    </p>
                  </div>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Meals
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {attendance.map((att) => (
                        <tr key={att._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {typeof att.user === "object"
                              ? att.user.name
                              : att.user}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(att.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {att.totalMeals}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Opt-Out Meals Section */}
            <section className="mt-12">
              <button
                onClick={() => setShowOptOuts(!showOptOuts)}
                className="w-full text-left flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center space-x-3">
                  <svg
                    className="h-6 w-6 text-blue-600"
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
                  <h3 className="text-xl font-bold text-gray-900">
                    Opt-Out Meals
                  </h3>
                </div>
                <svg
                  className={`h-5 w-5 text-gray-500 transform transition-transform duration-200 ${
                    showOptOuts ? "rotate-180" : ""
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
              {showOptOuts && (
                <div className="mt-4 bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-4 bg-blue-50 border-l-4 border-blue-400">
                    <p className="text-sm text-blue-700">
                      View all opt-out requests from students. This includes
                      both approved and pending requests to help track meal
                      preferences and absences.
                    </p>
                  </div>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date Range
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reason
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Submitted
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {optOuts.map((opt) => (
                        <tr key={opt._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {typeof opt.user === "object"
                              ? opt.user.name
                              : opt.user}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(opt.startDate).toLocaleDateString()} -{" "}
                            {new Date(opt.endDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {opt.reason}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                opt.approved
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {opt.approved ? "Approved" : "Pending"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {opt.createdAt
                              ? new Date(opt.createdAt).toLocaleDateString()
                              : "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Reviews Section */}
            <section className="mt-12">
              <button
                onClick={() => setShowReviews(!showReviews)}
                className="w-full text-left flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg shadow hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center space-x-3">
                  <svg
                    className="h-6 w-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                  <h3 className="text-xl font-bold text-gray-900">Reviews</h3>
                </div>
                <svg
                  className={`h-5 w-5 text-gray-500 transform transition-transform duration-200 ${
                    showReviews ? "rotate-180" : ""
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
              {showReviews && (
                <div className="mt-4 bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-4 bg-purple-50 border-l-4 border-purple-400">
                    <p className="text-sm text-purple-700">
                      View all student reviews and feedback. This includes both
                      approved and pending reviews to monitor food quality and
                      student satisfaction.
                    </p>
                  </div>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Meal Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rating
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Comment
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Submitted
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reviews.map((rev) => (
                        <tr key={rev._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {typeof rev.user === "object"
                              ? rev.user.name
                              : rev.user}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(rev.mealDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < rev.rating
                                      ? "text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                              ))}
                              <span className="ml-2">{rev.rating}/5</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {rev.comment || "No comment"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                rev.approved
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {rev.approved ? "Approved" : "Pending"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {rev.createdAt
                              ? new Date(rev.createdAt).toLocaleDateString()
                              : "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Mess Rebates Section */}
            <section className="mt-12">
              <button
                onClick={() => setShowRebates(!showRebates)}
                className="w-full text-left flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg shadow hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center space-x-3">
                  <svg
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h3 className="text-xl font-bold text-gray-900">
                    Mess Rebates
                  </h3>
                </div>
                <svg
                  className={`h-5 w-5 text-gray-500 transform transition-transform duration-200 ${
                    showRebates ? "rotate-180" : ""
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
              {showRebates && (
                <div className="mt-4 bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-4 bg-green-50 border-l-4 border-green-400">
                    <p className="text-sm text-green-700">
                      View all rebate requests and their processing status. This
                      helps track financial adjustments and student billing
                      corrections.
                    </p>
                  </div>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Month/Year
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reason
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Submitted
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {rebates.map((reb) => (
                        <tr key={reb._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {typeof reb.user === "object"
                              ? reb.user.name
                              : reb.user}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {reb.monthYear}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                            ₹{reb.calculatedAmount}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            Rebate for {reb.monthYear}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                reb.status === "approved"
                                  ? "bg-green-100 text-green-800"
                                  : reb.status === "rejected"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {reb.status === "approved"
                                ? "Approved"
                                : reb.status === "rejected"
                                ? "Rejected"
                                : "Pending"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {reb.createdAt
                              ? new Date(reb.createdAt).toLocaleDateString()
                              : "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Food Conclusion Section */}
            <section className="mt-12">
              <h3 className="text-xl font-bold mb-4">Food Conclusion</h3>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {reviewSummary?.averageRating?.toFixed(1) || "N/A"}
                    </div>
                    <div className="text-sm text-gray-500">Average Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {reviews.length}
                    </div>
                    <div className="text-sm text-gray-500">Total Reviews</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {reviews.filter((r) => r.approved).length}
                    </div>
                    <div className="text-sm text-gray-500">
                      Approved Reviews
                    </div>
                  </div>
                </div>
                {reviewSummary?.summaryText && (
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold mb-4">
                      Summarized Feedback
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700 italic">
                        {reviewSummary.summaryText}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};
