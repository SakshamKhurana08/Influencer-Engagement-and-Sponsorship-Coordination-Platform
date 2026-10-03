/**
 * Tests for src/Components/SponsorDashboard/SponsorRequests.jsx
 *
 * Sponsors can:
 *  - View all influencer-initiated requests across their campaigns
 *  - Filter by status (all / pending / negotiation / accepted / rejected)
 *  - Accept, reject, or negotiate on a request
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import SponsorRequests from '../Components/SponsorDashboard/SponsorRequests';

vi.mock('../api/axiosInstance', () => ({
  default: {
    get:  vi.fn(),
    post: vi.fn(),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  },
}));

import api from '../api/axiosInstance';

// ── Mock data ─────────────────────────────────────────────────────────────────

const PENDING_REQUEST = {
  id: 1,
  status: 'pending',
  message: 'I would love to collaborate on this campaign!',
  proposedTerms: '3 posts for 15000',
  Campaign: { id: 10, title: 'Summer Launch' },
  influencer: {
    id: 1,
    name: 'Priya Sharma',
    email: 'priya@test.com',
    category: 'Fashion',
    niche: 'Streetwear',
    reach: 120000,
    profileImageUrl: null,
  },
};

const ACCEPTED_REQUEST = {
  id: 2,
  status: 'accepted',
  message: 'Happy to work together.',
  proposedTerms: '',
  Campaign: { id: 11, title: 'Tech Review Campaign' },
  influencer: {
    id: 2,
    name: 'Rahul Verma',
    email: 'rahul@test.com',
    category: 'Tech',
    niche: 'Gadgets',
    reach: 80000,
    profileImageUrl: null,
  },
};

const NEGOTIATION_REQUEST = {
  id: 3,
  status: 'negotiation',
  message: 'Interested but need better terms.',
  proposedTerms: '2 posts for 20000',
  Campaign: { id: 10, title: 'Summer Launch' },
  influencer: {
    id: 3,
    name: 'Ananya Singh',
    email: 'ananya@test.com',
    category: 'Lifestyle',
    niche: 'Wellness',
    reach: 55000,
    profileImageUrl: null,
  },
};

function setupMocks(requests = [PENDING_REQUEST, ACCEPTED_REQUEST]) {
  vi.mocked(api.get).mockResolvedValue({ data: requests });
  vi.mocked(api.post).mockResolvedValue({ data: { message: 'Request accepteded successfully.' } });
}

function renderRequests() {
  localStorage.setItem('token', 'sp-tok');
  setupMocks();
  return render(<MemoryRouter><SponsorRequests /></MemoryRouter>);
}

// Helper: get action buttons (CheckCircle/XCircle/MessageSquare) — NOT the tab buttons.
// Tab buttons have class "is-tab"; action buttons have class "is-btn".
function getActionButton(name) {
  return screen.getAllByRole('button').find(b =>
    b.textContent?.trim().toLowerCase().includes(name.toLowerCase()) &&
    !b.classList.contains('is-tab')
  );
}

describe('SponsorRequests', () => {

  beforeEach(() => {
    vi.mocked(api.get).mockReset();
    vi.mocked(api.post).mockReset();
    localStorage.setItem('token', 'sp-tok');
  });

  // ── Rendering ─────────────────────────────────────────────────────────────

  it('renders Sponsor Portal heading area', async () => {
    renderRequests();
    // The heading is split across spans — check for the page-level text separately
    await waitFor(() =>
      expect(screen.getByText(/Sponsor Portal/i)).toBeInTheDocument()
    );
  });

  it('renders Requests sub-heading', async () => {
    renderRequests();
    // h1 renders "Influencer <span>Requests</span>" — check the span directly
    await waitFor(() =>
      expect(screen.getByText('Requests', { selector: '.is-gradient-text' })).toBeInTheDocument()
    );
  });

  it('calls GET /api/sponsors/requests on mount', async () => {
    renderRequests();
    await waitFor(() =>
      expect(api.get).toHaveBeenCalledWith('/api/sponsors/requests', expect.any(Object))
    );
  });

  it('shows influencer name after load', async () => {
    renderRequests();
    await waitFor(() =>
      expect(screen.getByText('Priya Sharma')).toBeInTheDocument()
    );
  });

  it('shows influencer category', async () => {
    renderRequests();
    await waitFor(() =>
      expect(screen.getByText('Fashion')).toBeInTheDocument()
    );
  });

  it('shows influencer reach', async () => {
    renderRequests();
    await waitFor(() =>
      expect(screen.getByText(/120,000/)).toBeInTheDocument()
    );
  });

  it('shows campaign title for each request', async () => {
    renderRequests();
    await waitFor(() =>
      expect(screen.getByText('Summer Launch')).toBeInTheDocument()
    );
  });

  it('shows request message', async () => {
    renderRequests();
    await waitFor(() =>
      expect(screen.getByText(/I would love to collaborate/i)).toBeInTheDocument()
    );
  });

  it('shows proposed terms when present', async () => {
    renderRequests();
    await waitFor(() =>
      expect(screen.getByText(/3 posts for 15000/i)).toBeInTheDocument()
    );
  });

  it('shows status pill on each request', async () => {
    renderRequests();
    await waitFor(() => {
      expect(screen.getByText('pending')).toBeInTheDocument();
      expect(screen.getByText('accepted')).toBeInTheDocument();
    });
  });

  // ── Status filter tabs ────────────────────────────────────────────────────

  it('renders all 5 status filter tabs', async () => {
    renderRequests();
    await waitFor(() => {
      const tabs = screen.getAllByRole('button').filter(b => b.classList.contains('is-tab'));
      const tabTexts = tabs.map(t => t.textContent?.trim().toLowerCase());
      expect(tabTexts).toContain('all');
      expect(tabTexts.some(t => t.includes('pending'))).toBe(true);
      expect(tabTexts.some(t => t.includes('negotiation'))).toBe(true);
      expect(tabTexts.some(t => t.includes('accepted'))).toBe(true);
      expect(tabTexts.some(t => t.includes('rejected'))).toBe(true);
    });
  });

  it('calls API with status param when Pending tab clicked', async () => {
    renderRequests();
    await waitFor(() => screen.getByText('Priya Sharma'));
    const pendingTab = screen.getAllByRole('button').find(
      b => b.classList.contains('is-tab') && b.textContent?.trim().toLowerCase().startsWith('pending')
    );
    fireEvent.click(pendingTab);
    await waitFor(() =>
      expect(api.get).toHaveBeenCalledWith(
        '/api/sponsors/requests',
        expect.objectContaining({ params: { status: 'pending' } })
      )
    );
  });

  it('calls API with no status param when All tab clicked', async () => {
    renderRequests();
    await waitFor(() => screen.getByText('Priya Sharma'));
    const allTab = screen.getAllByRole('button').find(
      b => b.classList.contains('is-tab') && b.textContent?.trim().toLowerCase().startsWith('all')
    );
    fireEvent.click(allTab);
    await waitFor(() =>
      expect(api.get).toHaveBeenCalledWith(
        '/api/sponsors/requests',
        expect.objectContaining({ params: {} })
      )
    );
  });

  // ── Action buttons ────────────────────────────────────────────────────────

  it('shows Accept action button for pending requests', async () => {
    renderRequests();
    await waitFor(() => screen.getByText('Priya Sharma'));
    expect(getActionButton('Accept')).toBeTruthy();
  });

  it('shows Negotiate action button for pending requests', async () => {
    renderRequests();
    await waitFor(() => screen.getByText('Priya Sharma'));
    expect(getActionButton('Negotiate')).toBeTruthy();
  });

  it('shows Decline action button for pending requests', async () => {
    renderRequests();
    await waitFor(() => screen.getByText('Priya Sharma'));
    expect(getActionButton('Decline')).toBeTruthy();
  });

  it('does NOT show Accept action button for accepted requests', async () => {
    setupMocks([ACCEPTED_REQUEST]);
    render(<MemoryRouter><SponsorRequests /></MemoryRouter>);
    await waitFor(() => screen.getByText('Rahul Verma'));
    expect(getActionButton('Accept')).toBeUndefined();
  });

  it('calls POST with action=accept when Accept button clicked', async () => {
    renderRequests();
    await waitFor(() => screen.getByText('Priya Sharma'));
    fireEvent.click(getActionButton('Accept'));
    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith(
        '/api/sponsors/requests/1/respond',
        { action: 'accept' }
      )
    );
  });

  it('calls POST with action=reject when Decline button clicked', async () => {
    renderRequests();
    await waitFor(() => screen.getByText('Priya Sharma'));
    fireEvent.click(getActionButton('Decline'));
    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith(
        '/api/sponsors/requests/1/respond',
        { action: 'reject' }
      )
    );
  });

  // ── Negotiate flow ────────────────────────────────────────────────────────

  it('shows counter-offer textarea when Negotiate clicked', async () => {
    renderRequests();
    await waitFor(() => screen.getByText('Priya Sharma'));
    fireEvent.click(getActionButton('Negotiate'));
    await waitFor(() =>
      expect(document.querySelector('textarea')).toBeInTheDocument()
    );
  });

  it('hides Accept/Decline buttons while negotiate form is open', async () => {
    renderRequests();
    await waitFor(() => screen.getByText('Priya Sharma'));
    fireEvent.click(getActionButton('Negotiate'));
    await waitFor(() => document.querySelector('textarea'));
    expect(getActionButton('Accept')).toBeUndefined();
    expect(getActionButton('Decline')).toBeUndefined();
  });

  it('calls respond API with action=negotiate and counterTerms', async () => {
    const user = userEvent.setup();
    renderRequests();
    await waitFor(() => screen.getByText('Priya Sharma'));
    fireEvent.click(getActionButton('Negotiate'));
    const textarea = await waitFor(() => document.querySelector('textarea'));
    await user.type(textarea, '2 posts for 12000');
    fireEvent.click(screen.getAllByRole('button').find(
      b => !b.classList.contains('is-tab') && b.textContent?.includes('Send Counter-Offer')
    ));
    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith(
        '/api/sponsors/requests/1/respond',
        { action: 'negotiate', counterTerms: '2 posts for 12000' }
      )
    );
  });

  it('closes negotiate form when Cancel clicked', async () => {
    renderRequests();
    await waitFor(() => screen.getByText('Priya Sharma'));
    fireEvent.click(getActionButton('Negotiate'));
    await waitFor(() => document.querySelector('textarea'));
    const cancelBtn = screen.getAllByRole('button').find(
      b => !b.classList.contains('is-tab') && b.textContent?.trim() === 'Cancel'
    );
    fireEvent.click(cancelBtn);
    await waitFor(() => expect(getActionButton('Accept')).toBeTruthy());
  });

  // ── Negotiation status also shows actions ────────────────────────────────

  it('shows action buttons for negotiation-status requests', async () => {
    setupMocks([NEGOTIATION_REQUEST]);
    render(<MemoryRouter><SponsorRequests /></MemoryRouter>);
    await waitFor(() => screen.getByText('Ananya Singh'));
    expect(getActionButton('Accept')).toBeTruthy();
    expect(getActionButton('Negotiate')).toBeTruthy();
  });

  // ── Success / error feedback ──────────────────────────────────────────────

  it('shows success message after accepting a request', async () => {
    renderRequests();
    await waitFor(() => screen.getByText('Priya Sharma'));
    fireEvent.click(getActionButton('Accept'));
    await waitFor(() =>
      expect(screen.getByText(/successfully/i)).toBeInTheDocument()
    );
  });

  it('shows error message when API call fails', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [PENDING_REQUEST] });
    vi.mocked(api.post).mockRejectedValue({
      response: { data: { message: 'Server error' } },
    });
    render(<MemoryRouter><SponsorRequests /></MemoryRouter>);
    await waitFor(() => screen.getByText('Priya Sharma'));
    fireEvent.click(getActionButton('Accept'));
    await waitFor(() =>
      expect(screen.getByText(/Server error/i)).toBeInTheDocument()
    );
  });

  // ── Empty state ───────────────────────────────────────────────────────────

  it('shows empty state when no requests', async () => {
    setupMocks([]);
    render(<MemoryRouter><SponsorRequests /></MemoryRouter>);
    // empty state text is "No  requests yet." (double space when filter=all)
    await waitFor(() =>
      expect(screen.getByText(/requests yet/i)).toBeInTheDocument()
    );
  });

  it('shows loading spinner initially', () => {
    setupMocks();
    render(<MemoryRouter><SponsorRequests /></MemoryRouter>);
    expect(document.querySelector('.is-spinner')).toBeInTheDocument();
  });
});
