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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">DigiMess Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {user.name}</span>
              <button
                onClick={onLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-md text-sm hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Admin Panel</h2>
            <p className="text-gray-600">
              Manage mess operations, view reports, and handle approvals.
            </p>

            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            {/* Stats */}
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded"></div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Users
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">{stats.totalUsers}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-500 rounded"></div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Active Today
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">{stats.activeToday}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-yellow-500 rounded"></div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Pending Requests
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">{stats.pendingRequests}</dd>
                      </dl>
                    </div>
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
                            className="bg-green-600 text-white px-2 py-1 rounded mr-2 hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleApproveOptOut(opt._id, false)}
                            className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
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
                            className="bg-green-600 text-white px-2 py-1 rounded mr-2 hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleApproveRebate(reb._id, 'rejected')}
                            className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
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
                            className="bg-green-600 text-white px-2 py-1 rounded mr-2 hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleApproveReview(rev._id, false)}
                            className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
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
