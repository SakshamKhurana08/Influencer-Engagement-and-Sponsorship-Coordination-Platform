/**
 * Tests for src/Components/SponsorDashboard/SponsorHome.jsx
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SponsorHome from '../Components/SponsorDashboard/SponsorHome';

vi.mock('../api/axiosInstance', () => ({
  default: {
    get: vi.fn(),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  },
}));

import api from '../api/axiosInstance';

const SPONSOR_DETAILS = {
  id: 1, userId: 2, companyName: 'SuperBrand', industry: 'Technology', budget: 150000,
};

function setup(data = SPONSOR_DETAILS) {
  localStorage.setItem('token', 'sp-tok');
  vi.mocked(api.get).mockResolvedValue({ data });
  return render(<MemoryRouter><SponsorHome /></MemoryRouter>);
}

describe('SponsorHome', () => {

  beforeEach(() => {
    vi.mocked(api.get).mockReset();
    localStorage.setItem('token', 'sp-tok');
  });

  // ── Loads and displays ─────────────────────────────────────────────────────

  it('calls GET /api/sponsors/details on mount', async () => {
    setup();
    await waitFor(() => expect(api.get).toHaveBeenCalledWith('/api/sponsors/details'));
  });

  it('displays company name', async () => {
    setup();
    // companyName appears in the stat card value AND welcome heading
    await waitFor(() => {
      const els = screen.getAllByText('SuperBrand');
      expect(els.length).toBeGreaterThan(0);
    });
  });

  it('displays industry', async () => {
    setup();
    await waitFor(() => expect(screen.getByText('Technology')).toBeInTheDocument());
  });

  it('displays budget formatted with locale string', async () => {
    setup();
    // Budget is shown as ₹1,50,000 (IN locale) or ₹150,000 (US locale)
    await waitFor(() => expect(screen.getByText(/₹[\d,]+/)).toBeInTheDocument());
  });

  it('renders Sponsor Dashboard eyebrow', async () => {
    setup();
    await waitFor(() => expect(screen.getByText(/Sponsor Dashboard/i)).toBeInTheDocument());
  });

  // ── Quick actions ──────────────────────────────────────────────────────────

  it('renders Manage Campaigns quick action', async () => {
    setup();
    await waitFor(() => expect(screen.getByText(/Manage Campaigns/i)).toBeInTheDocument());
  });

  it('renders Account Settings quick action', async () => {
    setup();
    await waitFor(() => expect(screen.getByText(/Account Settings/i)).toBeInTheDocument());
  });

  it('Manage Campaigns links to /sponsor-dashboard/campaign', async () => {
    setup();
    await waitFor(() => {
      const link = screen.getAllByRole('link').find(l =>
        l.getAttribute('href') === '/sponsor-dashboard/campaign'
      );
      expect(link).toBeTruthy();
    });
  });

  // ── Error state ────────────────────────────────────────────────────────────

  it('shows error message when API fails', async () => {
    localStorage.setItem('token', 'sp-tok');
    vi.mocked(api.get).mockRejectedValue(new Error('Network error'));
    render(<MemoryRouter><SponsorHome /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText(/Failed to load profile/i)).toBeInTheDocument());
  });

  // ── No auth — component calls API which rejects without token ─────────────

  it('shows error when no token and API returns error', async () => {
    localStorage.removeItem('token');
    vi.mocked(api.get).mockRejectedValue({ message: 'Not authenticated.' });
    render(<MemoryRouter><SponsorHome /></MemoryRouter>);
    // Component shows the error state (Failed to load) when API rejects
    await waitFor(() => expect(screen.getByText(/Failed to load profile/i)).toBeInTheDocument());
  });

  // ── Zero budget ────────────────────────────────────────────────────────────

  it('handles zero budget gracefully', async () => {
    setup({ ...SPONSOR_DETAILS, budget: 0 });
    // ₹0 is displayed in stat card
    await waitFor(() => expect(screen.getByText('₹0')).toBeInTheDocument());
  });

  // ── Welcome message ────────────────────────────────────────────────────────

  it('shows welcome message with company name', async () => {
    setup();
    await waitFor(() => expect(screen.getByText(/Welcome back/i)).toBeInTheDocument());
    // companyName appears in the gradient text span inside welcome heading
    await waitFor(() => {
      const all = screen.getAllByText('SuperBrand');
      expect(all.length).toBeGreaterThan(0);
    });
  });
});
