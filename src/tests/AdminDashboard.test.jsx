/**
 * Tests for src/Components/AdminDashboard.jsx
 *
 * Navigation is via URL search params (?tab=overview|campaigns|flagged|search).
 * The top inline tab bar was removed — use MemoryRouter initialEntries to set the tab.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminDashboard from '../Components/AdminDashboard';

// ── Mocks ─────────────────────────────────────────────────────────────────────
vi.mock('../Components/SponsorDashboard/Sidebar', () => ({ default: () => null }));
vi.mock('react-chartjs-2', () => ({
  Bar:     () => <div data-testid="bar-chart" />,
  Doughnut:() => <div data-testid="doughnut-chart" />,
}));

const mockStats   = { users:10, sponsors:4, influencers:5, campaigns:7, adRequests:12, flaggedUsers:1, flaggedCampaigns:2 };
const mockOngoing = [{ id:1, name:'Campaign Alpha', progress:'60%' }];
const mockFlagged = [{ id:2, name:'Bad Campaign',   company:'BadCo' }];
const mockSearch  = { users:[{ id:3, name:'John', email:'j@t.com', role:'sponsor' }], campaigns:[] };

function makeFetch() {
  return vi.fn((url) => {
    if (url.endsWith('/stats'))             return Promise.resolve({ ok:true, json:()=>Promise.resolve(mockStats) });
    if (url.endsWith('/ongoing-campaigns')) return Promise.resolve({ ok:true, json:()=>Promise.resolve(mockOngoing) });
    if (url.endsWith('/flagged'))           return Promise.resolve({ ok:true, json:()=>Promise.resolve(mockFlagged) });
    if (url.includes('/search'))            return Promise.resolve({ ok:true, json:()=>Promise.resolve(mockSearch) });
    if (url.endsWith('/flag'))              return Promise.resolve({ ok:true, json:()=>Promise.resolve({ message:'flagged' }) });
    if (url.endsWith('/remove'))            return Promise.resolve({ ok:true, json:()=>Promise.resolve({ message:'removed' }) });
    if (url.includes('/export/'))           return Promise.resolve({ ok:true, blob:()=>Promise.resolve(new Blob(['csv'], { type:'text/csv' })) });
    return Promise.resolve({ ok:true, json:()=>Promise.resolve({}) });
  });
}

global.fetch = makeFetch();

/** Render admin dashboard at a given tab via URL search param */
function renderAdmin(tab = 'overview') {
  localStorage.setItem('token', 'admin-tok');
  return render(
    <MemoryRouter initialEntries={[`/admin-dashboard?tab=${tab}`]}>
      <AdminDashboard />
    </MemoryRouter>
  );
}

describe('AdminDashboard', () => {

  beforeEach(() => {
    global.fetch = makeFetch();  // reset mock implementation for every test
    localStorage.setItem('token', 'admin-tok');
    window.confirm = vi.fn(() => true);
  });

  // ── Overview tab ──────────────────────────────────────────────────────────

  it('renders Platform Overview heading on overview tab', async () => {
    renderAdmin('overview');
    await waitFor(() => expect(screen.getByText(/Overview/i)).toBeInTheDocument());
  });

  it('loads stats and shows stat card values', async () => {
    renderAdmin('overview');
    await waitFor(() => {
      expect(screen.getByText('10')).toBeInTheDocument();  // Total Users
      expect(screen.getByText('7')).toBeInTheDocument();   // Campaigns
    });
  });

  it('shows stat labels', async () => {
    renderAdmin('overview');
    await waitFor(() => {
      expect(screen.getByText(/Total Users/i)).toBeInTheDocument();
      expect(screen.getByText(/Sponsors/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Campaigns/i).length).toBeGreaterThan(0);
      // 'Ad Requests' removed from stat cards in LC — replaced by 'Pending Approval'
      expect(screen.getByText(/Pending Approval/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Influencers/i).length).toBeGreaterThan(0);
    });
  });

  it('shows flagged sub-counts on stat cards', async () => {
    renderAdmin('overview');
    await waitFor(() => {
      expect(screen.getByText(/1 flagged/)).toBeInTheDocument();  // users
      expect(screen.getByText(/2 flagged/)).toBeInTheDocument();  // campaigns
    });
  });

  it('renders bar and doughnut charts when stats loaded', async () => {
    renderAdmin('overview');
    await waitFor(() => {
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
      expect(screen.getByTestId('doughnut-chart')).toBeInTheDocument();
    });
  });

  it('renders Export Campaigns button', async () => {
    renderAdmin('overview');
    await waitFor(() => expect(screen.getByText(/Export Campaigns/i)).toBeInTheDocument());
  });

  it('renders Export Users button', async () => {
    renderAdmin('overview');
    await waitFor(() => expect(screen.getByText(/Export Users/i)).toBeInTheDocument());
  });

  it('Export Campaigns triggers fetch with auth header', async () => {
    renderAdmin('overview');
    await waitFor(() => screen.getByText(/Export Campaigns/i));
    fireEvent.click(screen.getByText(/Export Campaigns/i));
    await waitFor(() => {
      expect(vi.mocked(global.fetch)).toHaveBeenCalledWith(
        expect.stringContaining('/export/campaigns'),
        expect.objectContaining({ headers: expect.objectContaining({ Authorization: expect.stringContaining('Bearer') }) })
      );
    });
  });

  it('Export Users triggers fetch with auth header', async () => {
    renderAdmin('overview');
    await waitFor(() => screen.getByText(/Export Users/i));
    fireEvent.click(screen.getByText(/Export Users/i));
    await waitFor(() => {
      expect(vi.mocked(global.fetch)).toHaveBeenCalledWith(
        expect.stringContaining('/export/users'),
        expect.objectContaining({ headers: expect.objectContaining({ Authorization: expect.stringContaining('Bearer') }) })
      );
    });
  });

  // ── Campaigns tab ──────────────────────────────────────────────────────────

  it('shows Ongoing Campaigns heading on campaigns tab', async () => {
    renderAdmin('campaigns');
    await waitFor(() => expect(screen.getByText(/Ongoing Campaigns/i)).toBeInTheDocument());
  });

  it('shows campaign name and progress on campaigns tab', async () => {
    renderAdmin('campaigns');
    await waitFor(() => {
      expect(screen.getByText('Campaign Alpha')).toBeInTheDocument();
      expect(screen.getByText(/60%/)).toBeInTheDocument();
    });
  });

  it('shows Flag button on ongoing campaigns', async () => {
    renderAdmin('campaigns');
    await waitFor(() => expect(screen.getAllByText(/Flag/i).length).toBeGreaterThan(0));
  });

  it('calls flag API when Flag button clicked', async () => {
    renderAdmin('campaigns');
    await waitFor(() => screen.getByText('Campaign Alpha'));
    fireEvent.click(screen.getAllByRole('button', { name: /Flag/i })[0]);
    await waitFor(() => {
      expect(vi.mocked(global.fetch)).toHaveBeenCalledWith(
        expect.stringContaining('/flag'),
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  it('shows empty state when no campaigns', async () => {
    vi.mocked(global.fetch).mockImplementation((url) => {
      if (url.endsWith('/ongoing-campaigns')) return Promise.resolve({ ok:true, json:()=>Promise.resolve([]) });
      if (url.endsWith('/stats'))             return Promise.resolve({ ok:true, json:()=>Promise.resolve(mockStats) });
      return Promise.resolve({ ok:true, json:()=>Promise.resolve({}) });
    });
    renderAdmin('campaigns');
    await waitFor(() => expect(screen.getByText(/No active campaigns/i)).toBeInTheDocument());
  });

  // ── Flagged tab ────────────────────────────────────────────────────────────

  it('shows Flagged Content heading on flagged tab', async () => {
    renderAdmin('flagged');
    await waitFor(() => expect(screen.getByText(/Flagged Content/i)).toBeInTheDocument());
  });

  it('shows flagged campaign name and company', async () => {
    renderAdmin('flagged');
    await waitFor(() => {
      expect(screen.getByText('Bad Campaign')).toBeInTheDocument();
      expect(screen.getByText(/BadCo/)).toBeInTheDocument();
    });
  });

  it('shows Remove button on flagged campaigns', async () => {
    renderAdmin('flagged');
    await waitFor(() => {
      const removeBtns = screen.getAllByRole('button').filter(b => b.textContent?.includes('Remove'));
      expect(removeBtns.length).toBeGreaterThan(0);
    });
  });

  it('calls remove API after confirm', async () => {
    renderAdmin('flagged');
    await waitFor(() => screen.getByText('Bad Campaign'));
    // Click Remove button — opens ConfirmDialog
    const removeBtns = screen.getAllByRole('button').filter(b => b.textContent?.includes('Remove'));
    fireEvent.click(removeBtns[0]);
    // ConfirmDialog shows 'Yes, Delete' — click it to confirm
    await waitFor(() => screen.getByText(/Yes, Delete/i));
    fireEvent.click(screen.getByText(/Yes, Delete/i));
    await waitFor(() => {
      expect(vi.mocked(global.fetch)).toHaveBeenCalledWith(
        expect.stringContaining('/remove'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  it('does NOT call remove API when confirm is cancelled', async () => {
    renderAdmin('flagged');
    await waitFor(() => screen.getByText('Bad Campaign'));
    const callsBefore = vi.mocked(global.fetch).mock.calls.length;
    const removeBtns = screen.getAllByRole('button').filter(b => b.textContent?.includes('Remove'));
    fireEvent.click(removeBtns[0]);
    // Dialog opens — click Cancel
    await waitFor(() => screen.getByRole('button', { name: /^Cancel$/i }));
    fireEvent.click(screen.getByRole('button', { name: /^Cancel$/i }));
    expect(vi.mocked(global.fetch).mock.calls.length).toBe(callsBefore);
  });

  it('shows all clear state when nothing flagged', async () => {
    vi.mocked(global.fetch).mockImplementation((url) => {
      if (url.endsWith('/flagged')) return Promise.resolve({ ok:true, json:()=>Promise.resolve([]) });
      return Promise.resolve({ ok:true, json:()=>Promise.resolve({}) });
    });
    renderAdmin('flagged');
    await waitFor(() => expect(screen.getByText(/Nothing flagged/i)).toBeInTheDocument());
  });

  // ── Search tab ─────────────────────────────────────────────────────────────

  it('renders search input on search tab', () => {
    renderAdmin('search');
    expect(screen.getByPlaceholderText(/Search by name or title/i)).toBeInTheDocument();
  });

  it('renders Search button on search tab', () => {
    renderAdmin('search');
    expect(screen.getByRole('button', { name: /Search/i })).toBeInTheDocument();
  });

  it('calls search API and shows user results', async () => {
    renderAdmin('search');
    const input = screen.getByPlaceholderText(/Search by name or title/i);
    fireEvent.change(input, { target: { value: 'John' } });
    fireEvent.click(screen.getByRole('button', { name: /Search/i }));
    await waitFor(() => {
      expect(screen.getByText('John')).toBeInTheDocument();
      expect(screen.getByText('j@t.com')).toBeInTheDocument();
    });
  });

  it('does NOT call search API when query is empty', () => {
    renderAdmin('search');
    const callsBefore = vi.mocked(global.fetch).mock.calls.length;
    fireEvent.click(screen.getByRole('button', { name: /Search/i }));
    expect(vi.mocked(global.fetch).mock.calls.length).toBe(callsBefore);
  });

  it('shows no results message when search returns empty', async () => {
    vi.mocked(global.fetch).mockImplementation((url) => {
      if (url.includes('/search')) return Promise.resolve({ ok:true, json:()=>Promise.resolve({ users:[], campaigns:[] }) });
      return Promise.resolve({ ok:true, json:()=>Promise.resolve({}) });
    });
    renderAdmin('search');
    const input = screen.getByPlaceholderText(/Search by name or title/i);
    fireEvent.change(input, { target: { value: 'nobody' } });
    fireEvent.click(screen.getByRole('button', { name: /Search/i }));
    await waitFor(() => expect(screen.getByText(/No results for/i)).toBeInTheDocument());
  });

  it('supports Enter key to trigger search', async () => {
    renderAdmin('search');
    const input = screen.getByPlaceholderText(/Search by name or title/i);
    fireEvent.change(input, { target: { value: 'John' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    await waitFor(() => {
      expect(vi.mocked(global.fetch)).toHaveBeenCalledWith(
        expect.stringContaining('/search?query=John'),
        expect.any(Object)
      );
    });
  });
});
