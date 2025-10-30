import React, { useState, useEffect } from 'react';
import type { User, OptOut, Rebate, Review, MealAttendance } from '../types/User';
import { optoutService } from '../services/optoutService';
import { rebateService } from '../services/rebateService';
import { reviewService } from '../services/reviewService';

import { apiService } from '../services/apiService';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  // States
  const [stats, setStats] = useState({ totalUsers: 0, activeToday: 0, pendingRequests: 0 });
  const [optOuts, setOptOuts] = useState<OptOut[]>([]);
  const [rebates, setRebates] = useState<Rebate[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [attendance, setAttendance] = useState<MealAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Assume backend has /api/admin/stats for stats
        const statsRes = await apiService.get('/admin/stats');
        if (statsRes.success) setStats(statsRes.stats);

        const [optOutsRes, rebatesRes, reviewsRes, attendanceRes] = await Promise.all([
          apiService.get('/optout/admin'), // Assume new endpoint for all opt-outs
          apiService.get('/rebate/admin'), // Assume new endpoint for all rebates
          reviewService.getAllReviews(),
          apiService.get('/meals/admin/recent') // Assume new endpoint for recent attendance
        ]);
        if (optOutsRes.success) setOptOuts(optOutsRes.optOuts);
        if (rebatesRes.success) setRebates(rebatesRes.rebates);
        if (reviewsRes.success) setReviews(reviewsRes.reviews);
        if (attendanceRes.success) setAttendance(attendanceRes.attendance);
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleApproveOptOut = async (id: string, approved: boolean) => {
    try {
      await optoutService.approveOptOut(id, { approved, adminNotes: '' });
      // Refresh
      const optOutsRes = await apiService.get('/optout/admin');
      if (optOutsRes.success) setOptOuts(optOutsRes.optOuts);
    } catch (err) {
      setError('Failed to update opt-out');
    }
  };

  const handleApproveRebate = async (id: string, status: string) => {
    try {
      await rebateService.approveRebate(id, { status, notes: '' });
      // Refresh
      const rebatesRes = await apiService.get('/rebate/admin');
      if (rebatesRes.success) setRebates(rebatesRes.rebates);
    } catch (err) {
      setError('Failed to update rebate');
    }
  };

  const handleApproveReview = async (id: string, approved: boolean) => {
    try {
      await reviewService.approveReview(id, approved);
      // Refresh
      const reviewsRes = await reviewService.getAllReviews();
      if (reviewsRes.success) setReviews(reviewsRes.reviews);
    } catch (err) {
      setError('Failed to update review');
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
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-gray-900">DigiMess Admin Dashboard</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-white/50 px-3 py-1 rounded-full">
                <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">Welcome, {user.name}</span>
              </div>
              <button
                onClick={onLogout}
                className="btn-danger flex items-center space-x-2 hover:scale-105 transition-transform"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
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
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Admin Control Center</h2>
              <p className="text-gray-600 text-lg">
                Oversee mess operations, monitor performance, and manage approvals with ease.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-700 rounded-r-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
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
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Users
                      </dt>
                      <dd className="text-3xl font-bold text-gray-900">{stats.totalUsers}</dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="card p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Active Today
                      </dt>
                      <dd className="text-3xl font-bold text-gray-900">{stats.activeToday}</dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="card p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Pending Requests
                      </dt>
                      <dd className="text-3xl font-bold text-gray-900">{stats.pendingRequests}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Attendance Overview */}
            <section className="mt-12">
              <h3 className="text-xl font-bold mb-4">Recent Attendance</h3>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meals</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {attendance.slice(0, 10).map((att) => (
                      <tr key={att._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{typeof att.user === 'object' ? att.user.name : att.user}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(att.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{att.totalMeals}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Opt-Out Approvals */}
            <section className="mt-12">
              <h3 className="text-xl font-bold mb-4">Opt-Out Requests</h3>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {optOuts.filter(o => !o.approved).map((opt) => (
                      <tr key={opt._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{typeof opt.user === 'object' ? opt.user.name : opt.user}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(opt.startDate).toLocaleDateString()} - {new Date(opt.endDate).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{opt.reason}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleApproveOptOut(opt._id, true)}
                            className="btn-success mr-2"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleApproveOptOut(opt._id, false)}
                            className="btn-danger"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Rebate Approvals */}
            <section className="mt-12">
              <h3 className="text-xl font-bold mb-4">Rebate Approvals</h3>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rebates.filter(r => r.status === 'pending').map((reb) => (
                      <tr key={reb._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{typeof reb.user === 'object' ? reb.user.name : reb.user}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{reb.monthYear}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{reb.calculatedAmount}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleApproveRebate(reb._id, 'approved')}
                            className="btn-success mr-2"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleApproveRebate(reb._id, 'rejected')}
                            className="btn-danger"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Review Moderation */}
            <section className="mt-12">
              <h3 className="text-xl font-bold mb-4">Review Moderation</h3>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comment</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reviews.filter(r => !r.approved).map((rev) => (
                      <tr key={rev._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{typeof rev.user === 'object' ? rev.user.name : rev.user}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(rev.mealDate).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rev.rating}/5</td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{rev.comment}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleApproveReview(rev._id, true)}
                            className="btn-success mr-2"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleApproveReview(rev._id, false)}
                            className="btn-danger"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};
