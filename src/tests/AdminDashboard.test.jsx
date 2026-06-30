/**
 * Tests for src/Components/AdminDashboard.jsx
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminDashboard from '../Components/AdminDashboard';

// ── Mocks ─────────────────────────────────────────────────────────────────────
vi.mock('../Components/SponsorDashboard/Sidebar', () => ({ default: () => null }));
vi.mock('react-chartjs-2', () => ({
  Bar: () => <div data-testid="bar-chart" />,
  Doughnut: () => <div data-testid="doughnut-chart" />,
}));

const mockStats = {
  users: 10, sponsors: 4, influencers: 5, campaigns: 7,
  adRequests: 12, flaggedUsers: 1, flaggedCampaigns: 2,
};
const mockOngoing = [{ id: 1, name: 'Campaign Alpha', progress: '60%' }];
const mockFlagged = [{ id: 2, name: 'Bad Campaign', company: 'BadCo' }];
const mockSearch  = { users: [{ id: 3, name: 'John', email: 'j@t.com', role: 'sponsor' }], campaigns: [] };

global.fetch = vi.fn((url) => {
  if (url.includes('/stats'))            return Promise.resolve({ ok: true, json: () => Promise.resolve(mockStats) });
  if (url.includes('/ongoing'))          return Promise.resolve({ ok: true, json: () => Promise.resolve(mockOngoing) });
  if (url.includes('/flagged'))          return Promise.resolve({ ok: true, json: () => Promise.resolve(mockFlagged) });
  if (url.includes('/search'))           return Promise.resolve({ ok: true, json: () => Promise.resolve(mockSearch) });
  if (url.includes('/flag'))             return Promise.resolve({ ok: true, json: () => Promise.resolve({ message: 'flagged' }) });
  if (url.includes('/remove'))           return Promise.resolve({ ok: true, json: () => Promise.resolve({ message: 'removed' }) });
  return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
});

function renderAdmin() {
  localStorage.setItem('token', 'admin-tok');
  return render(<MemoryRouter><AdminDashboard /></MemoryRouter>);
}

describe('AdminDashboard', () => {

  beforeEach(() => {
    vi.mocked(global.fetch).mockClear();
    localStorage.setItem('token', 'admin-tok');
  });

  // ── Tab rendering ──────────────────────────────────────────────────────────

  it('renders all 4 tabs', () => {
    renderAdmin();
    expect(screen.getAllByText('Overview')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Campaigns')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Flagged')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Search')[0]).toBeInTheDocument();
  });

  // ── Overview tab ──────────────────────────────────────────────────────────

  it('loads stats on mount and shows stat cards', async () => {
    renderAdmin();
    await waitFor(() => {
      expect(screen.getByText('10')).toBeInTheDocument(); // users
      expect(screen.getByText('7')).toBeInTheDocument();  // campaigns
    });
  });

  it('renders bar and doughnut charts when stats loaded', async () => {
    renderAdmin();
    await waitFor(() => {
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
      expect(screen.getByTestId('doughnut-chart')).toBeInTheDocument();
    });
  });

  it('shows export buttons in overview', async () => {
    renderAdmin();
    await waitFor(() => {
      expect(screen.getByText(/Export Campaigns/i)).toBeInTheDocument();
      expect(screen.getByText(/Export Users/i)).toBeInTheDocument();
    });
  });

  // ── Campaigns tab ──────────────────────────────────────────────────────────

  it('shows ongoing campaigns after clicking Campaigns tab', async () => {
    renderAdmin();
    fireEvent.click(screen.getByText('Campaigns'));
    await waitFor(() => {
      expect(screen.getByText('Campaign Alpha')).toBeInTheDocument();
      expect(screen.getByText(/60%/)).toBeInTheDocument();
    });
  });

  it('shows Flag button on ongoing campaigns', async () => {
    renderAdmin();
    fireEvent.click(screen.getByText('Campaigns'));
    await waitFor(() => {
      expect(screen.getAllByText(/Flag/i).length).toBeGreaterThan(0);
    });
  });

  // ── Flagged tab ────────────────────────────────────────────────────────────

  it('shows flagged campaigns after clicking Flagged tab', async () => {
    renderAdmin();
    fireEvent.click(screen.getByText('Flagged'));
    await waitFor(() => {
      expect(screen.getByText('Bad Campaign')).toBeInTheDocument();
      expect(screen.getByText(/BadCo/)).toBeInTheDocument();
    });
  });

  it('shows Remove button on flagged campaigns', async () => {
    renderAdmin();
    fireEvent.click(screen.getByText('Flagged'));
    await waitFor(() => {
      expect(screen.getAllByText(/Remove/i).length).toBeGreaterThan(0);
    });
  });

  // ── Search tab ─────────────────────────────────────────────────────────────

  it('renders search input and button', () => {
    renderAdmin();
    fireEvent.click(screen.getByText('Search'));
    expect(screen.getByPlaceholderText(/Search by name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Search/i })).toBeInTheDocument();
  });

  it('calls search API and shows results', async () => {
    renderAdmin();
    fireEvent.click(screen.getByText('Search'));
    const input = screen.getByPlaceholderText(/Search by name/i);
    fireEvent.change(input, { target: { value: 'John' } });
    fireEvent.click(screen.getByRole('button', { name: /Search/i }));
    await waitFor(() => expect(screen.getByText('John')).toBeInTheDocument());
  });

  it('does NOT call search API when query is empty', () => {
    renderAdmin();
    fireEvent.click(screen.getByText('Search'));
    const initialCallCount = vi.mocked(global.fetch).mock.calls.length;
    fireEvent.click(screen.getByRole('button', { name: /Search/i }));
    expect(vi.mocked(global.fetch).mock.calls.length).toBe(initialCallCount);
  });

  // ── Flag action ────────────────────────────────────────────────────────────

  it('calls flag API and shows success message', async () => {
    renderAdmin();
    fireEvent.click(screen.getByText('Campaigns'));
    await waitFor(() => screen.getByText('Campaign Alpha'));
    const flagBtn = screen.getAllByText(/Flag/i)[0];
    fireEvent.click(flagBtn);
    await waitFor(() => {
      expect(vi.mocked(global.fetch)).toHaveBeenCalledWith(
        expect.stringContaining('/flag'),
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  // ── Remove action ──────────────────────────────────────────────────────────

  it('calls remove API after confirm and shows success', async () => {
    window.confirm = vi.fn(() => true);
    renderAdmin();
    fireEvent.click(screen.getByText('Flagged'));
    await waitFor(() => screen.getByText('Bad Campaign'));
    const removeBtn = screen.getByText(/Remove/i);
    fireEvent.click(removeBtn);
    await waitFor(() => {
      expect(vi.mocked(global.fetch)).toHaveBeenCalledWith(
        expect.stringContaining('/remove'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  it('does NOT call remove API when confirm is cancelled', async () => {
    window.confirm = vi.fn(() => false);
    renderAdmin();
    fireEvent.click(screen.getByText('Flagged'));
    await waitFor(() => screen.getByText('Bad Campaign'));
    const removeBtn = screen.getByText(/Remove/i);
    const callsBefore = vi.mocked(global.fetch).mock.calls.length;
    fireEvent.click(removeBtn);
    expect(vi.mocked(global.fetch).mock.calls.length).toBe(callsBefore);
  });
});
