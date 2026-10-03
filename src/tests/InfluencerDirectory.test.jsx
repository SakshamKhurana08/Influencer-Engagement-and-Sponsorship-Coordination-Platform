/**
 * Tests for src/Components/SponsorDashboard/InfluencerDirectory.jsx
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import InfluencerDirectory from '../Components/SponsorDashboard/InfluencerDirectory';

vi.mock('../api/axiosInstance', () => ({
  default: {
    get:  vi.fn(),
    post: vi.fn(),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  },
}));

import api from '../api/axiosInstance';

// ── Mock data ─────────────────────────────────────────────────────────────────

const INFLUENCERS = {
  items: [
    { id: 1, name: 'Priya Sharma',  category: 'Fashion', niche: 'Streetwear', reach: 120000, profileImageUrl: null },
    { id: 2, name: 'Rahul Verma',   category: 'Tech',    niche: 'Gadgets',    reach: 80000,  profileImageUrl: null },
    { id: 3, name: 'Ananya Singh',  category: 'Lifestyle',niche: 'Wellness',  reach: 55000,  profileImageUrl: null },
  ],
  total: 3, page: 1, pages: 1, per_page: 20,
};

const CAMPAIGNS = {
  items: [
    { id: 10, title: 'Summer Launch', budget: 50000 },
    { id: 11, title: 'Tech Review',   budget: 30000 },
  ],
};

function setupMocks(influencers = INFLUENCERS, campaigns = CAMPAIGNS) {
  vi.mocked(api.get).mockImplementation(url => {
    if (url.includes('/sponsors/influencers')) return Promise.resolve({ data: influencers });
    if (url.includes('/campaign/my-campaigns')) return Promise.resolve({ data: campaigns });
    return Promise.resolve({ data: {} });
  });
  vi.mocked(api.post).mockResolvedValue({ data: { message: 'ok' } });
}

function renderDir() {
  localStorage.setItem('token', 'sp-tok');
  setupMocks();
  return render(<MemoryRouter><InfluencerDirectory /></MemoryRouter>);
}

describe('InfluencerDirectory', () => {

  beforeEach(() => {
    vi.mocked(api.get).mockReset();
    vi.mocked(api.post).mockReset();
    localStorage.setItem('token', 'sp-tok');
  });

  // ── Rendering ─────────────────────────────────────────────────────────────

  it('renders Find Influencers heading', async () => {
    renderDir();
    await waitFor(() =>
      expect(screen.getByText('Influencers', { selector: '.is-gradient-text' })).toBeInTheDocument()
    );
  });

  it('calls GET /api/sponsors/influencers on mount', async () => {
    renderDir();
    await waitFor(() =>
      expect(api.get).toHaveBeenCalledWith('/api/sponsors/influencers', expect.any(Object))
    );
  });

  it('calls GET /api/campaign/my-campaigns on mount', async () => {
    renderDir();
    await waitFor(() =>
      expect(api.get).toHaveBeenCalledWith('/api/campaign/my-campaigns', expect.any(Object))
    );
  });

  it('shows influencer names after load', async () => {
    renderDir();
    await waitFor(() => expect(screen.getByText('Priya Sharma')).toBeInTheDocument());
    expect(screen.getByText('Rahul Verma')).toBeInTheDocument();
    expect(screen.getByText('Ananya Singh')).toBeInTheDocument();
  });

  it('shows category and niche pills', async () => {
    renderDir();
    await waitFor(() => expect(screen.getByText('Fashion')).toBeInTheDocument());
    expect(screen.getByText('Streetwear')).toBeInTheDocument();
  });

  it('shows reach for each influencer', async () => {
    renderDir();
    await waitFor(() => expect(screen.getByText(/120,000/)).toBeInTheDocument());
    expect(screen.getByText(/80,000/)).toBeInTheDocument();
  });

  it('shows total results count', async () => {
    renderDir();
    await waitFor(() =>
      expect(screen.getByText(/3 influencer/i)).toBeInTheDocument()
    );
  });

  it('shows loading spinner initially', () => {
    setupMocks();
    render(<MemoryRouter><InfluencerDirectory /></MemoryRouter>);
    expect(document.querySelector('.is-spinner')).toBeInTheDocument();
  });

  it('shows empty state when no influencers found', async () => {
    setupMocks({ items: [], total: 0, page: 1, pages: 1 });
    render(<MemoryRouter><InfluencerDirectory /></MemoryRouter>);
    await waitFor(() =>
      expect(screen.getByText(/No influencers found/i)).toBeInTheDocument()
    );
  });

  // ── Filters ───────────────────────────────────────────────────────────────

  it('renders search, category, minReach, maxReach filter inputs', async () => {
    renderDir();
    expect(screen.getByPlaceholderText(/e\.g\. Priya/i) || screen.getByPlaceholderText(/Priya/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Fashion/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/10000/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/500000/)).toBeInTheDocument();
  });

  it('calls API with category param on Filter click', async () => {
    renderDir();
    await waitFor(() => screen.getByText('Priya Sharma'));
    await userEvent.type(screen.getByPlaceholderText(/Fashion/i), 'Tech');
    fireEvent.click(screen.getByRole('button', { name: /Filter/i }));
    await waitFor(() => {
      const calls = vi.mocked(api.get).mock.calls.filter(c => c[0].includes('/sponsors/influencers'));
      const lastCall = calls.at(-1);
      expect(lastCall[1].params.category).toBe('Tech');
    });
  });

  it('calls API with search param on Filter click', async () => {
    renderDir();
    await waitFor(() => screen.getByText('Priya Sharma'));
    // find the search input by placeholder
    const searchInput = screen.getByPlaceholderText(/Priya/i);
    await userEvent.type(searchInput, 'Rahul');
    fireEvent.click(screen.getByRole('button', { name: /Filter/i }));
    await waitFor(() => {
      const calls = vi.mocked(api.get).mock.calls.filter(c => c[0].includes('/sponsors/influencers'));
      const lastCall = calls.at(-1);
      expect(lastCall[1].params.search).toBe('Rahul');
    });
  });

  it('clears all filters when Clear clicked', async () => {
    renderDir();
    await waitFor(() => screen.getByText('Priya Sharma'));
    await userEvent.type(screen.getByPlaceholderText(/Fashion/i), 'Tech');
    fireEvent.click(screen.getByRole('button', { name: /Clear/i }));
    await waitFor(() =>
      expect(screen.getByPlaceholderText(/Fashion/i).value).toBe('')
    );
  });

  it('triggers search on Enter key in search input', async () => {
    renderDir();
    await waitFor(() => screen.getByText('Priya Sharma'));
    const searchInput = screen.getByPlaceholderText(/Priya/i);
    await userEvent.type(searchInput, 'Ananya{Enter}');
    await waitFor(() => {
      const calls = vi.mocked(api.get).mock.calls.filter(c => c[0].includes('/sponsors/influencers'));
      expect(calls.length).toBeGreaterThan(1);
    });
  });

  // ── Card expand ───────────────────────────────────────────────────────────

  it('expands card to show details when clicked', async () => {
    renderDir();
    await waitFor(() => screen.getByText('Priya Sharma'));
    fireEvent.click(screen.getByText('Priya Sharma'));
    await waitFor(() =>
      expect(screen.getByText('Send Ad Request')).toBeInTheDocument()
    );
  });

  it('collapses card when clicked again', async () => {
    renderDir();
    await waitFor(() => screen.getByText('Priya Sharma'));
    fireEvent.click(screen.getByText('Priya Sharma'));
    await waitFor(() => screen.getByText('Send Ad Request'));
    fireEvent.click(screen.getByText('Priya Sharma'));
    await waitFor(() =>
      expect(screen.queryByText('Send Ad Request')).not.toBeInTheDocument()
    );
  });

  // ── Send Request flow ─────────────────────────────────────────────────────

  it('shows request form when Send Request button clicked', async () => {
    renderDir();
    await waitFor(() => screen.getByText('Priya Sharma'));
    // Click the header Send Request button (not the expand toggle)
    const sendBtns = screen.getAllByRole('button', { name: /Send Request/i });
    fireEvent.click(sendBtns[0]);
    await waitFor(() =>
      expect(screen.getByPlaceholderText(/Introduce your campaign/i)).toBeInTheDocument()
    );
  });

  it('shows campaign dropdown in request form', async () => {
    renderDir();
    await waitFor(() => screen.getByText('Priya Sharma'));
    fireEvent.click(screen.getAllByRole('button', { name: /Send Request/i })[0]);
    await waitFor(() =>
      expect(screen.getByText('Summer Launch')).toBeInTheDocument()
    );
  });

  it('calls POST /api/campaign/<id>/ad-request with influencerId on submit', async () => {
    const user = userEvent.setup();
    renderDir();
    await waitFor(() => screen.getByText('Priya Sharma'));
    fireEvent.click(screen.getAllByRole('button', { name: /Send Request/i })[0]);
    await waitFor(() => screen.getByPlaceholderText(/Introduce your campaign/i));

    // Select campaign
    const select = screen.getByRole('combobox');
    await user.selectOptions(select, '10');

    // Type message
    await user.type(screen.getByPlaceholderText(/Introduce your campaign/i), 'Great fit for our brand!');

    // Submit
    // After form opens: 3 header buttons + 1 form submit = 4 total. Last = form submit.
    // The form submit is the brand button inside the request form container (has textarea sibling)
    await waitFor(() => document.querySelector('textarea'));
    const formContainer = document.querySelector('textarea').closest('.rounded-3');
    const formSubmitBtn = formContainer?.querySelector('.is-btn.is-btn-brand');
    fireEvent.click(formSubmitBtn);

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith(
        '/api/campaign/10/ad-request',
        expect.objectContaining({
          influencerId: 1,
          message: 'Great fit for our brand!',
        })
      )
    );
  });

  it('shows success message after request sent', async () => {
    const user = userEvent.setup();
    renderDir();
    await waitFor(() => screen.getByText('Priya Sharma'));
    fireEvent.click(screen.getAllByRole('button', { name: /Send Request/i })[0]);
    await waitFor(() => screen.getByPlaceholderText(/Introduce your campaign/i));
    const select = screen.getByRole('combobox');
    await user.selectOptions(select, '10');
    await user.type(screen.getByPlaceholderText(/Introduce your campaign/i), 'Hello!');
    // The form submit is the brand button inside the request form container (has textarea sibling)
    await waitFor(() => document.querySelector('textarea'));
    const formContainer = document.querySelector('textarea').closest('.rounded-3');
    const formSubmitBtn = formContainer?.querySelector('.is-btn.is-btn-brand');
    fireEvent.click(formSubmitBtn);
    await waitFor(() =>
      expect(screen.getByText(/sent successfully/i)).toBeInTheDocument()
    );
  });

  it('shows error when submitting without a message', async () => {
    renderDir();
    await waitFor(() => screen.getByText('Priya Sharma'));
    fireEvent.click(screen.getAllByRole('button', { name: /Send Request/i })[0]);
    await waitFor(() => screen.getByPlaceholderText(/Introduce your campaign/i));
    // The form submit is the brand button inside the request form container (has textarea sibling)
    await waitFor(() => document.querySelector('textarea'));
    const formContainer = document.querySelector('textarea').closest('.rounded-3');
    const formSubmitBtn = formContainer?.querySelector('.is-btn.is-btn-brand');
    fireEvent.click(formSubmitBtn);
    await waitFor(() =>
      expect(screen.getByText(/please write a message/i)).toBeInTheDocument()
    );
    expect(api.post).not.toHaveBeenCalled();
  });

  it('shows error when submitting without selecting a campaign', async () => {
    // Return campaigns with no items so no campaign is pre-selected
    setupMocks(INFLUENCERS, { items: [] });
    render(<MemoryRouter><InfluencerDirectory /></MemoryRouter>);
    await waitFor(() => screen.getByText('Priya Sharma'));
    fireEvent.click(screen.getAllByRole('button', { name: /Send Request/i })[0]);
    await waitFor(() =>
      expect(screen.getByText(/No campaigns yet/i)).toBeInTheDocument()
    );
  });

  it('shows error message on API failure', async () => {
    vi.mocked(api.get).mockImplementation(url => {
      if (url.includes('/sponsors/influencers')) return Promise.resolve({ data: INFLUENCERS });
      if (url.includes('/campaign/my-campaigns')) return Promise.resolve({ data: CAMPAIGNS });
      return Promise.resolve({ data: {} });
    });
    vi.mocked(api.post).mockRejectedValue({ response: { data: { message: 'Request failed' } } });
    render(<MemoryRouter><InfluencerDirectory /></MemoryRouter>);
    await waitFor(() => screen.getByText('Priya Sharma'));
    const user = userEvent.setup();
    fireEvent.click(screen.getAllByRole('button', { name: /Send Request/i })[0]);
    await waitFor(() => screen.getByPlaceholderText(/Introduce your campaign/i));
    const select = screen.getByRole('combobox');
    await user.selectOptions(select, '10');
    await user.type(screen.getByPlaceholderText(/Introduce your campaign/i), 'Hi!');
    // The form submit is the brand button inside the request form container (has textarea sibling)
    await waitFor(() => document.querySelector('textarea'));
    const formContainer = document.querySelector('textarea').closest('.rounded-3');
    const formSubmitBtn = formContainer?.querySelector('.is-btn.is-btn-brand');
    fireEvent.click(formSubmitBtn);
    await waitFor(() =>
      expect(screen.getByText(/Request failed/i)).toBeInTheDocument()
    );
  });

  // ── Pagination ────────────────────────────────────────────────────────────

  it('shows pagination controls when multiple pages exist', async () => {
    setupMocks({ items: INFLUENCERS.items, total: 30, page: 1, pages: 2 });
    render(<MemoryRouter><InfluencerDirectory /></MemoryRouter>);
    await waitFor(() =>
      expect(screen.getByText(/Page 1 of 2/i)).toBeInTheDocument()
    );
    expect(screen.getByRole('button', { name: /Next/i })).toBeInTheDocument();
  });

  it('does NOT show pagination when only one page', async () => {
    renderDir();
    await waitFor(() => screen.getByText('Priya Sharma'));
    expect(screen.queryByText(/Page 1 of/i)).not.toBeInTheDocument();
  });

  it('calls API with page=2 when Next clicked', async () => {
    setupMocks({ items: INFLUENCERS.items, total: 30, page: 1, pages: 2 });
    render(<MemoryRouter><InfluencerDirectory /></MemoryRouter>);
    await waitFor(() => screen.getByRole('button', { name: /Next/i }));
    fireEvent.click(screen.getByRole('button', { name: /Next/i }));
    await waitFor(() => {
      const calls = vi.mocked(api.get).mock.calls.filter(c => c[0].includes('/sponsors/influencers'));
      const lastCall = calls.at(-1);
      expect(lastCall[1].params.page).toBe(2);
    });
  });
});
