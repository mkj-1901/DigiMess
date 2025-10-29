import React, { useState, useEffect } from "react";
import type { User, MealAttendance, Rebate, Review } from '../types/User';
import { mealService } from '../services/mealService';
import { rebateService } from '../services/rebateService';
import { reviewService } from '../services/reviewService';

interface StudentDashboardProps {
  user: User;
  onLogout: () => void;
}





const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, onLogout }) => {
  // States
  const [attendanceHistory, setAttendanceHistory] = useState<MealAttendance[]>([]);
  const [rebates, setRebates] = useState<Rebate[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mealForm, setMealForm] = useState({ breakfast: false, lunch: false, dinner: false });
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [rebateLoading, setRebateLoading] = useState(false);
  const [currentRebate, setCurrentRebate] = useState<Rebate | null>(null);

  const today = new Date().toISOString().split('T')[0];

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [historyRes, rebatesRes, reviewsRes] = await Promise.all([
          mealService.getHistory(user.id),
          rebateService.getRebates(user.id),
          reviewService.getReviews(user.id)
        ]);
        if (historyRes.success) setAttendanceHistory(historyRes.history);
        if (rebatesRes.success) setRebates(rebatesRes.rebates);
        if (reviewsRes.success) setReviews(reviewsRes.reviews);
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.id]);

  const handleMealChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMealForm({ ...mealForm, [e.target.name]: e.target.checked });
  };

  const submitAttendance = async () => {
    try {
      const res = await mealService.logAttendance({ date: today, ...mealForm });
      if (res.success) {
        // Refresh history
        const historyRes = await mealService.getHistory(user.id);
        if (historyRes.success) setAttendanceHistory(historyRes.history);
        setMealForm({ breakfast: false, lunch: false, dinner: false });
      }
    } catch (err) {
      setError('Failed to log attendance');
    }
  };

  const calculateRebate = async () => {
    try {
      setRebateLoading(true);
      const monthYear = new Date().toISOString().slice(0, 7); // YYYY-MM
      const res = await rebateService.calculateRebate(user.id, monthYear);
      if (res.success) setCurrentRebate(res.rebate || null);
    } catch (err) {
      setError('Failed to calculate rebate');
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
        // Refresh reviews
        const reviewsRes = await reviewService.getReviews(user.id);
        if (reviewsRes.success) setReviews(reviewsRes.reviews);
        setReviewForm({ rating: 5, comment: '' });
      }
    } catch (err) {
      setError('Failed to submit review');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">DigiMess Student Dashboard</h1>
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
        <div className="w-full px-6 py-8 max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Student Dashboard</h1>
            <p className="text-gray-600">
              Track your meals, calculate rebates, and submit reviews.
            </p>
          </header>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Meal Tracker Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Meal Tracker - {today}</h2>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="breakfast"
                    checked={mealForm.breakfast}
                    onChange={handleMealChange}
                    className="mr-2"
                  />
                  Breakfast
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="lunch"
                    checked={mealForm.lunch}
                    onChange={handleMealChange}
                    className="mr-2"
                  />
                  Lunch
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="dinner"
                    checked={mealForm.dinner}
                    onChange={handleMealChange}
                    className="mr-2"
                  />
                  Dinner
                </label>
              </div>
              <button
                onClick={submitAttendance}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Log Attendance
              </button>
            </div>
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Recent Attendance History</h3>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meals</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {attendanceHistory.slice(-5).reverse().map((att) => (
                      <tr key={att._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(att.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {att.breakfast && 'B '}{att.lunch && 'L '}{att.dinner && 'D '}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{att.totalMeals}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Rebate Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Rebate Calculator</h2>
            <div className="bg-white p-6 rounded-lg shadow">
              <button
                onClick={calculateRebate}
                disabled={rebateLoading}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
              >
                {rebateLoading ? 'Calculating...' : 'Calculate Current Month Rebate'}
              </button>
              {currentRebate && (
                <div className="mt-4 p-4 bg-gray-50 rounded">
                  <h3 className="font-semibold">Rebate for {currentRebate.monthYear}</h3>
                  <p>Amount: ₹{currentRebate.calculatedAmount}</p>
                  <p>Attended: {currentRebate.attendedDays}/{currentRebate.totalDays} days</p>
                  <p>Opt-out: {currentRebate.optOutDays} days</p>
                  <p>Missed: {currentRebate.missedDays} days</p>
                  <p>Status: {currentRebate.status}</p>
                </div>
              )}
            </div>
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Rebate History</h3>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rebates.slice(-5).reverse().map((reb) => (
                      <tr key={reb._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{reb.monthYear}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{reb.calculatedAmount}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className={`px-2 py-1 rounded text-xs ${reb.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
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
            <h2 className="text-2xl font-bold mb-4">Food Reviews - {today}</h2>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rating (1-5)</label>
                  <input
                    type="number"
                    name="rating"
                    min="1"
                    max="5"
                    value={reviewForm.rating}
                    onChange={handleReviewChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                  <textarea
                    name="comment"
                    value={reviewForm.comment}
                    onChange={handleReviewChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Your feedback..."
                  />
                </div>
              </div>
              <button
                onClick={submitReview}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              >
                Submit Review
              </button>
            </div>
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Your Past Reviews</h3>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comment</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approved</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reviews.slice(-5).reverse().map((rev) => (
                      <tr key={rev._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(rev.mealDate).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rev.rating}/5</td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{rev.comment}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded text-xs ${rev.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {rev.approved ? 'Yes' : 'Pending'}
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
      </main>
    </div>
  );
};

export default StudentDashboard;
