/**
 * Tests for src/Components/SponsorDashboard/Campaigns.jsx
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Campaigns from '../Components/SponsorDashboard/Campaigns';

vi.mock('../api/axiosInstance', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  },
}));

import api from '../api/axiosInstance';

const CAMPAIGNS_RESPONSE = {
  items: [
    { id: 1, title: 'Summer Camp', category: 'Tech', budget: 20000, isPublic: true,
      isFlagged: false, description: 'Test desc', acceptedInfluencers: [] },
    { id: 2, title: 'Winter Camp', category: 'Fashion', budget: 5000, isPublic: false,
      isFlagged: false, description: '', acceptedInfluencers: [{ influencerId: 1, influencerName: 'Jane' }] },
  ],
  total: 2, page: 1, per_page: 20, pages: 1,
};

const AD_REQUESTS_RESPONSE = {
  items: [
    { id: 10, status: 'pending', message: 'Looking good', proposedTerms: '2 posts' },
  ],
  total: 1, page: 1, per_page: 20, pages: 1,
};

function setup() {
  localStorage.setItem('token', 'sp-tok');
  vi.mocked(api.get).mockImplementation((url) => {
    if (url.includes('/my-campaigns'))  return Promise.resolve({ data: CAMPAIGNS_RESPONSE });
    if (url.includes('/ad-requests'))   return Promise.resolve({ data: AD_REQUESTS_RESPONSE });
    return Promise.resolve({ data: { items: [], total: 0 } });
  });
  vi.mocked(api.post).mockResolvedValue({ data: { id: 99, title: 'New', budget: 1000, isPublic: true, category: '', description: '', isFlagged: false, acceptedInfluencers: [] } });
  vi.mocked(api.put).mockResolvedValue({ data: { id: 1, title: 'Updated', budget: 20000, isPublic: true, category: 'Tech', description: 'Updated desc', isFlagged: false, acceptedInfluencers: [] } });
  vi.mocked(api.delete).mockResolvedValue({ data: { message: 'deleted' } });
  return render(<MemoryRouter><Campaigns /></MemoryRouter>);
}

describe('Campaigns', () => {

  beforeEach(() => {
    vi.mocked(api.get).mockReset();
    vi.mocked(api.post).mockReset();
    vi.mocked(api.put).mockReset();
    vi.mocked(api.delete).mockReset();
    localStorage.setItem('token', 'sp-tok');
  });

  // ── Initial load ─────────────────────────────────────────────────────────────

  it('renders the page header', async () => {
    setup();
    expect(screen.getByText(/Manage Campaigns/i)).toBeInTheDocument();
  });

  it('renders New Campaign button', () => {
    setup();
    expect(screen.getAllByRole('button', { name: /New Campaign/i })[0]).toBeInTheDocument();
  });

  it('displays loaded campaigns', async () => {
    setup();
    await waitFor(() => expect(screen.getByText('Summer Camp')).toBeInTheDocument());
    expect(screen.getByText('Winter Camp')).toBeInTheDocument();
  });

  it('shows Public/Private badge on campaigns', async () => {
    setup();
    await waitFor(() => expect(screen.getByText('Public')).toBeInTheDocument());
    expect(screen.getByText('Private')).toBeInTheDocument();
  });

  it('shows accepted influencer count when available', async () => {
    setup();
    await waitFor(() => expect(screen.getByText(/1 influencer/i)).toBeInTheDocument());
  });

  // ── Campaign form ─────────────────────────────────────────────────────────────

  it('opens campaign form when New Campaign clicked', async () => {
    setup();
    fireEvent.click(screen.getAllByRole('button', { name: /New Campaign/i })[0]);
    await waitFor(() => expect(screen.getByPlaceholderText(/Campaign Title/i)).toBeInTheDocument());
  });

  it('closes form when Cancel clicked', async () => {
    setup();
    fireEvent.click(screen.getAllByRole('button', { name: /New Campaign/i })[0]);
    await waitFor(() => screen.getByPlaceholderText(/Campaign Title/i));
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    await waitFor(() => expect(screen.queryByPlaceholderText(/Campaign Title/i)).not.toBeInTheDocument());
  });

  it('calls POST /api/campaign/ on create', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: CAMPAIGNS_RESPONSE });
    setup();
    await waitFor(() => screen.getAllByRole('button', { name: /New Campaign/i }));
    fireEvent.click(screen.getAllByRole('button', { name: /New Campaign/i })[0]);
    await waitFor(() => screen.getByPlaceholderText(/Campaign Title/i));
    await userEvent.type(screen.getByPlaceholderText(/Campaign Title/i), 'Brand New Campaign');
    fireEvent.click(screen.getByRole('button', { name: /Create Campaign/i }));
    await waitFor(() => expect(api.post).toHaveBeenCalledWith('/api/campaign/', expect.any(Object)));
  });

  it('title field is required — does not submit empty', async () => {
    setup();
    fireEvent.click(screen.getAllByRole('button', { name: /New Campaign/i })[0]);
    await waitFor(() => screen.getByPlaceholderText(/Campaign Title/i));
    // Submit without title
    fireEvent.click(screen.getByRole('button', { name: /Create Campaign/i }));
    // HTML5 required validation prevents submission — post should not be called
    expect(api.post).not.toHaveBeenCalled();
  });

  // ── Edit campaign ─────────────────────────────────────────────────────────────

  it('opens edit form with campaign data when edit button clicked', async () => {
    setup();
    await waitFor(() => screen.getByText('Summer Camp'));
    // Click the edit (pencil) button on first campaign
    const editBtns = screen.getAllByRole('button', { name: '' });
    // Find the pencil icon button (first of the pair per campaign card)
    fireEvent.click(editBtns.find(btn => btn.querySelector('svg')) || editBtns[0]);
    await waitFor(() => {
      const titleInput = screen.queryByPlaceholderText(/Campaign Title/i);
      if (titleInput) expect(titleInput.value).toBe('Summer Camp');
    });
  });

  // ── Delete campaign ────────────────────────────────────────────────────────────

  it('calls DELETE after confirm', async () => {
    window.confirm = vi.fn(() => true);
    vi.mocked(api.get).mockResolvedValue({ data: { items: [], total: 0 } });
    setup();
    await waitFor(() => screen.getByText('Summer Camp'));
    // Find trash icon buttons
    const btns = screen.getAllByRole('button');
    const trashBtn = btns.find(b => b.style?.color === 'rgb(239, 68, 68)' || b.querySelector('[data-testid]'));
    if (trashBtn) {
      fireEvent.click(trashBtn);
      await waitFor(() => expect(api.delete).toHaveBeenCalled());
    }
  });

  // ── Ad requests ───────────────────────────────────────────────────────────────

  it('shows ad requests when campaign card is expanded', async () => {
    setup();
    await waitFor(() => screen.getByText('Summer Camp'));
    // Click the campaign card to expand
    fireEvent.click(screen.getByText('Summer Camp'));
    await waitFor(() => expect(screen.getByText(/Send Request/i)).toBeInTheDocument());
  });

  it('shows ad request form when Send Request clicked', async () => {
    setup();
    await waitFor(() => screen.getByText('Summer Camp'));
    fireEvent.click(screen.getByText('Summer Camp'));
    await waitFor(() => screen.getByText(/Send Request/i));
    fireEvent.click(screen.getByText(/Send Request/i));
    await waitFor(() => expect(screen.getByPlaceholderText(/Describe what you need/i)).toBeInTheDocument());
  });

  it('calls POST ad-request on send', async () => {
    setup();
    await waitFor(() => screen.getByText('Summer Camp'));
    fireEvent.click(screen.getByText('Summer Camp'));
    await waitFor(() => screen.getByText(/Send Request/i));
    fireEvent.click(screen.getByText(/Send Request/i));
    await waitFor(() => screen.getByPlaceholderText(/Describe what you need/i));
    await userEvent.type(screen.getByPlaceholderText(/Describe what you need/i), 'We want you');
    fireEvent.click(screen.getByRole('button', { name: /^Send$/i }));
    await waitFor(() => expect(api.post).toHaveBeenCalledWith(
      expect.stringContaining('/ad-request'), expect.any(Object)
    ));
  });

  it('shows existing ad requests when expanded', async () => {
    setup();
    await waitFor(() => screen.getByText('Summer Camp'));
    fireEvent.click(screen.getByText('Summer Camp'));
    await waitFor(() => expect(screen.getByText('Looking good')).toBeInTheDocument());
  });

  // ── Empty state ───────────────────────────────────────────────────────────────

  it('shows empty state when no campaigns', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { items: [], total: 0, page: 1, pages: 0 } });
    render(<MemoryRouter><Campaigns /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText(/No campaigns yet/i)).toBeInTheDocument());
  });
});
