import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, vi, beforeEach, expect } from 'vitest';
import AdminDashboard from '../AdminDashboard';
import { apiService } from '../../services/apiService';
import { reviewService } from '../../services/reviewService';

vi.mock('../../services/apiService');
vi.mock('../../services/reviewService');

const mockedApi: any = apiService as any;
const mockedReview: any = reviewService as any;

const mockUser = { id: '1', name: 'Admin', email: 'admin@example.com', role: 'admin' };

describe('AdminDashboard', () => {
  beforeEach(() => {
    mockedApi.get = vi.fn((endpoint: string) => {
      if (endpoint === '/admin/stats') return Promise.resolve({ success: true, stats: { totalUsers: 10, activeToday: 3, pendingRequests: 2 } });
      if (endpoint === '/optout/admin') return Promise.resolve({ success: true, optOuts: [] });
      if (endpoint === '/rebate/admin') return Promise.resolve({ success: true, rebates: [] });
      if (endpoint === '/meals/admin/recent') return Promise.resolve({ success: true, attendance: [] });
      return Promise.resolve({ success: true });
    });

    mockedReview.getAllReviews = vi.fn(() => Promise.resolve({ success: true, reviews: [] }));
    mockedReview.getReviewSummary = vi.fn(() => Promise.resolve({ success: true, summary: { totalReviews: 5, averageRating: 4.2, ratingDistribution: [], insights: { positiveMentions: 3, negativeMentions: 1 } } }));
  });

  it('renders stats from API', async () => {
    render(<AdminDashboard user={mockUser as any} onLogout={() => {}} />);

    await waitFor(() => expect(screen.getByText('Total Users')).toBeInTheDocument());
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Active Today')).toBeInTheDocument();
  });

  it('renders loading state initially', () => {
    render(<AdminDashboard user={mockUser as any} onLogout={() => {}} />);
    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
  });
});
