/**
 * Tests for src/Components/InfluencerDashboard.jsx
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import InfluencerDashboard from '../Components/InfluencerDashboard';

// ── Mocks ──────────────────────────────────────────────────────────────────────
vi.mock('../Components/SponsorDashboard/Sidebar', () => ({ default: () => null }));
vi.mock('../api/axiosInstance', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
    post: vi.fn(),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

import api from '../api/axiosInstance';

const PROFILE = {
  influencer: { id: 1, category: 'Tech', niche: 'AI', reach: 50000, profileImageUrl: null },
  user: { id: 2, name: 'Test Influencer', email: 'inf@t.com', role: 'influencer' },
};
const CAMPAIGNS = {
  items: [
    { id: 10, title: 'Open Camp 1', category: 'Tech', budget: 10000, isPublic: true, isAcceptedByUser: false, description: 'Test desc' },
    { id: 11, title: 'Open Camp 2', category: 'Fashion', budget: 5000,  isPublic: true, isAcceptedByUser: true,  description: '' },
  ],
  total: 2, page: 1, per_page: 20, pages: 1,
};
const AD_REQUESTS = [
  {
    id: 1, status: 'pending', message: 'Work with us', proposedTerms: '3 posts',
    Campaign: { id: 10, title: 'Open Camp 1', Sponsor: { companyName: 'SponsyCo', id: 1 } },
  },
  {
    id: 2, status: 'accepted', message: 'Accepted deal', proposedTerms: '',
    Campaign: { id: 11, title: 'Camp 2', Sponsor: { companyName: 'OtherSponsor', id: 2 } },
  },
];

function setup() {
  localStorage.setItem('token', 'inf-tok');
  vi.mocked(api.get).mockImplementation((url) => {
    if (url.includes('/profile'))       return Promise.resolve({ data: PROFILE });
    if (url.includes('/open-campaigns'))return Promise.resolve({ data: CAMPAIGNS });
    if (url.includes('/ad-requests'))   return Promise.resolve({ data: AD_REQUESTS });
    return Promise.resolve({ data: {} });
  });
  vi.mocked(api.put).mockResolvedValue({ data: PROFILE });
  vi.mocked(api.post).mockResolvedValue({ data: { message: 'ok' } });
  return render(<MemoryRouter><InfluencerDashboard /></MemoryRouter>);
}

describe('InfluencerDashboard', () => {

  beforeEach(() => {
    mockNavigate.mockClear();
    vi.mocked(api.get).mockReset();
    vi.mocked(api.put).mockReset();
    vi.mocked(api.post).mockReset();
    localStorage.setItem('token', 'inf-tok');
  });

  // ── Redirects ────────────────────────────────────────────────────────────────

  it('redirects to /login when no token', () => {
    localStorage.removeItem('token');
    render(<MemoryRouter><InfluencerDashboard /></MemoryRouter>);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  // ── Profile display ──────────────────────────────────────────────────────────

  it('displays influencer name and category', async () => {
    setup();
    await waitFor(() => expect(screen.getByText('Test Influencer')).toBeInTheDocument());
    expect(screen.getAllByText('Tech')[0]).toBeInTheDocument();
  });

  it('displays niche and reach', async () => {
    setup();
    await waitFor(() => expect(screen.getByText('AI')).toBeInTheDocument());
    expect(screen.getByText(/50,000/)).toBeInTheDocument();
  });

  // ── Tabs ────────────────────────────────────────────────────────────────────

  it('renders Open Campaigns tab', async () => {
    setup();
    await waitFor(() => expect(screen.getByText(/Open Campaigns/i)).toBeInTheDocument());
  });

  it('renders Ad Requests tab', async () => {
    setup();
    await waitFor(() => expect(screen.getByText(/Ad Requests/i)).toBeInTheDocument());
  });

  // ── Campaigns ───────────────────────────────────────────────────────────────

  it('shows campaign cards after load', async () => {
    setup();
    await waitFor(() => expect(screen.getByText('Open Camp 1')).toBeInTheDocument());
    expect(screen.getByText('Open Camp 2')).toBeInTheDocument();
  });

  it('shows Accept Campaign button for non-accepted campaigns', async () => {
    setup();
    await waitFor(() => expect(screen.getAllByText(/Accept Campaign/i).length).toBeGreaterThan(0));
  });

  it('shows Joined badge for already-accepted campaigns', async () => {
    setup();
    await waitFor(() => expect(screen.getAllByText(/Joined/i).length).toBeGreaterThan(0));
  });

  it('calls accept campaign API when button clicked', async () => {
    setup();
    await waitFor(() => screen.getAllByText(/Accept Campaign/i));
    fireEvent.click(screen.getAllByText(/Accept Campaign/i)[0]);
    await waitFor(() => expect(api.post).toHaveBeenCalledWith(
      expect.stringContaining('/accept'), {}
    ));
  });

  // ── Campaign filters ─────────────────────────────────────────────────────────

  it('renders category filter input', async () => {
    setup();
    await waitFor(() => expect(screen.getByPlaceholderText(/Fashion/i)).toBeInTheDocument());
  });

  it('renders min budget filter input', async () => {
    setup();
    await waitFor(() => expect(screen.getByPlaceholderText(/10000/i)).toBeInTheDocument());
  });

  it('calls API with category filter', async () => {
    setup();
    await waitFor(() => screen.getByPlaceholderText(/Fashion/i));
    await userEvent.type(screen.getByPlaceholderText(/Fashion/i), 'Tech');
    fireEvent.click(screen.getByText(/Filter/i));
    await waitFor(() => {
      const lastCall = vi.mocked(api.get).mock.calls.at(-1);
      expect(lastCall?.[1]?.params?.category).toBe('Tech');
    });
  });

  // ── Ad Requests tab ──────────────────────────────────────────────────────────

  it('shows ad requests when switching to Ads tab', async () => {
    setup();
    await waitFor(() => screen.getByText(/Ad Requests/i));
    fireEvent.click(screen.getByText(/Ad Requests/i));
    await waitFor(() => expect(screen.getByText('SponsyCo')).toBeInTheDocument());
  });

  it('shows Accept and Decline buttons for pending requests', async () => {
    setup();
    await waitFor(() => screen.getByText(/Ad Requests/i));
    fireEvent.click(screen.getByText(/Ad Requests/i));
    await waitFor(() => {
      expect(screen.getAllByText(/Accept/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Decline/i)).toBeInTheDocument();
    });
  });

  it('shows Negotiate button for pending requests', async () => {
    setup();
    await waitFor(() => screen.getByText(/Ad Requests/i));
    fireEvent.click(screen.getByText(/Ad Requests/i));
    await waitFor(() => expect(screen.getByText(/Negotiate/i)).toBeInTheDocument());
  });

  it('calls accept API when Accept clicked', async () => {
    setup();
    await waitFor(() => screen.getByText(/Ad Requests/i));
    fireEvent.click(screen.getByText(/Ad Requests/i));
    await waitFor(() => screen.getByText(/^Accept$/i));
    fireEvent.click(screen.getByText(/^Accept$/i));
    await waitFor(() => expect(api.post).toHaveBeenCalledWith(
      expect.stringContaining('/accept'), {}
    ));
  });

  it('calls reject API when Decline clicked', async () => {
    setup();
    await waitFor(() => screen.getByText(/Ad Requests/i));
    fireEvent.click(screen.getByText(/Ad Requests/i));
    await waitFor(() => screen.getByText(/Decline/i));
    fireEvent.click(screen.getByText(/Decline/i));
    await waitFor(() => expect(api.post).toHaveBeenCalledWith(
      expect.stringContaining('/reject'), {}
    ));
  });

  it('shows negotiate counter-offer form when Negotiate clicked', async () => {
    setup();
    await waitFor(() => screen.getByText(/Ad Requests/i));
    fireEvent.click(screen.getByText(/Ad Requests/i));
    await waitFor(() => screen.getByText(/Negotiate/i));
    fireEvent.click(screen.getByText(/Negotiate/i));
    await waitFor(() => expect(screen.getByPlaceholderText(/revised terms/i)).toBeInTheDocument());
  });

  it('calls negotiate API with counterTerms', async () => {
    setup();
    await waitFor(() => screen.getByText(/Ad Requests/i));
    fireEvent.click(screen.getByText(/Ad Requests/i));
    await waitFor(() => screen.getByText(/Negotiate/i));
    fireEvent.click(screen.getByText(/Negotiate/i));
    await waitFor(() => screen.getByPlaceholderText(/revised terms/i));
    await userEvent.type(screen.getByPlaceholderText(/revised terms/i), '2 posts for 8000');
    fireEvent.click(screen.getByText(/Send/i));
    await waitFor(() => expect(api.post).toHaveBeenCalledWith(
      expect.stringContaining('/negotiate'),
      { counterTerms: '2 posts for 8000' }
    ));
  });

  // ── Stats ───────────────────────────────────────────────────────────────────

  it('shows campaigns joined count', async () => {
    setup();
    await waitFor(() => {
      // One campaign is accepted (isAcceptedByUser: true)
      expect(screen.getAllByText('1').length).toBeGreaterThan(0);
    });
  });

  // ── Profile edit ──────────────────────────────────────────────────────────────

  it('shows edit profile button', async () => {
    setup();
    await waitFor(() => expect(screen.getByText(/Edit Profile/i)).toBeInTheDocument());
  });

  it('opens edit form when Edit Profile clicked', async () => {
    setup();
    await waitFor(() => screen.getByText(/Edit Profile/i));
    fireEvent.click(screen.getByText(/Edit Profile/i));
    await waitFor(() => expect(screen.getByText(/Save/i)).toBeInTheDocument());
  });

  it('calls PUT /api/influencer/profile on save', async () => {
    vi.mocked(api.put).mockResolvedValue({
      data: { ...PROFILE, user: { ...PROFILE.user, name: 'Updated Name' } },
    });
    setup();
    await waitFor(() => screen.getByText(/Edit Profile/i));
    fireEvent.click(screen.getByText(/Edit Profile/i));
    await waitFor(() => screen.getByText(/Save/i));
    fireEvent.click(screen.getByText(/Save/i));
    await waitFor(() => expect(api.put).toHaveBeenCalledWith(
      '/api/influencer/profile', expect.any(Object)
    ));
  });
});
