/**
 * Tests for the Influencer portal pages:
 *   - InfluencerDashboard (overview / index)
 *   - InfluencerCampaigns
 *   - InfluencerDeals
 *   - InfluencerSettings
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../Components/SponsorDashboard/Sidebar', () => ({ default: () => null }));
vi.mock('../api/axiosInstance', () => ({
  default: {
    get:  vi.fn(),
    put:  vi.fn(),
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
  influencer: { id:1, category:'Tech', niche:'AI', reach:50000, profileImageUrl:null },
  user:       { id:2, name:'Test Influencer', email:'inf@t.com', role:'influencer' },
};
const CAMPAIGNS = {
  items: [
    { id:10, title:'Open Camp 1', category:'Tech', budget:10000, isPublic:true, isAcceptedByUser:false, description:'Test' },
    { id:11, title:'Open Camp 2', category:'Fashion', budget:5000, isPublic:true, isAcceptedByUser:true, description:'' },
  ],
};
const AD_REQUESTS = [
  { id:1, status:'pending',  message:'Work with us', proposedTerms:'3 posts', Campaign:{ id:10, title:'Open Camp 1', Sponsor:{ companyName:'SponsyCo', id:1 } } },
  { id:2, status:'accepted', message:'Accepted deal', proposedTerms:'', Campaign:{ id:11, title:'Camp 2',    Sponsor:{ companyName:'OtherSponsor', id:2 } } },
];

function setupApiMocks() {
  vi.mocked(api.get).mockImplementation((url) => {
    if (url.includes('/profile'))        return Promise.resolve({ data: PROFILE });
    if (url.includes('/open-campaigns')) return Promise.resolve({ data: CAMPAIGNS });
    if (url.includes('/ad-requests'))    return Promise.resolve({ data: AD_REQUESTS });
    return Promise.resolve({ data: {} });
  });
  vi.mocked(api.put).mockResolvedValue({ data: PROFILE });
  vi.mocked(api.post).mockResolvedValue({ data: { message: 'ok' } });
}

// ─────────────────────────────────────────────────────────────────────────────
// Overview (InfluencerDashboard / index)
// ─────────────────────────────────────────────────────────────────────────────
import InfluencerDashboard from '../Components/InfluencerDashboard';

function renderOverview() {
  localStorage.setItem('token', 'inf-tok');
  setupApiMocks();
  return render(<MemoryRouter><InfluencerDashboard /></MemoryRouter>);
}

describe('InfluencerDashboard — Overview', () => {

  beforeEach(() => { mockNavigate.mockClear(); vi.mocked(api.get).mockReset(); localStorage.setItem('token','inf-tok'); });

  it('redirects to /login when no token', () => {
    localStorage.removeItem('token');
    render(<MemoryRouter><InfluencerDashboard /></MemoryRouter>);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('shows welcome heading with influencer name', async () => {
    renderOverview();
    await waitFor(() => expect(screen.getByText(/Test Influencer/i)).toBeInTheDocument());
  });

  it('shows stat cards for campaigns joined and accepted deals', async () => {
    renderOverview();
    await waitFor(() => expect(screen.getByText(/Campaigns Joined/i)).toBeInTheDocument());
    expect(screen.getByText(/Accepted Deals/i)).toBeInTheDocument();
  });

  it('shows reach stat', async () => {
    renderOverview();
    // reach appears in stat card and profile strip
    await waitFor(() => expect(screen.getAllByText(/50,000/).length).toBeGreaterThan(0));
  });

  it('shows category and niche in profile strip', async () => {
    renderOverview();
    await waitFor(() => expect(screen.getAllByText('Tech')[0]).toBeInTheDocument());
    expect(screen.getByText('AI')).toBeInTheDocument();
  });

  it('renders Browse Campaigns quick action', async () => {
    renderOverview();
    await waitFor(() => expect(screen.getByText(/Browse Campaigns/i)).toBeInTheDocument());
  });

  it('renders My Deals quick action', async () => {
    renderOverview();
    await waitFor(() => expect(screen.getByText(/My Deals/i)).toBeInTheDocument());
  });

  it('renders Profile & Settings quick action', async () => {
    renderOverview();
    await waitFor(() => expect(screen.getByText(/Profile.*Settings/i)).toBeInTheDocument());
  });

  it('Browse Campaigns links to /influencer/campaigns', async () => {
    renderOverview();
    await waitFor(() => screen.getByText(/Browse Campaigns/i));
    const links = screen.getAllByRole('link');
    expect(links.some(l => l.getAttribute('href') === '/influencer/campaigns')).toBe(true);
  });

  it('My Deals links to /influencer/deals', async () => {
    renderOverview();
    await waitFor(() => screen.getByText(/My Deals/i));
    const links = screen.getAllByRole('link');
    expect(links.some(l => l.getAttribute('href') === '/influencer/deals')).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Campaigns page
// ─────────────────────────────────────────────────────────────────────────────
import InfluencerCampaigns from '../Components/InfluencerDashboard/InfluencerCampaigns';

function renderCampaigns() {
  localStorage.setItem('token','inf-tok');
  setupApiMocks();
  return render(<MemoryRouter><InfluencerCampaigns /></MemoryRouter>);
}

describe('InfluencerCampaigns', () => {

  beforeEach(() => { vi.mocked(api.get).mockReset(); vi.mocked(api.post).mockReset(); localStorage.setItem('token','inf-tok'); });

  it('renders Browse Campaigns heading', async () => {
    renderCampaigns();
    await waitFor(() => expect(screen.getByText(/Browse/i)).toBeInTheDocument());
  });

  it('displays campaign cards after load', async () => {
    renderCampaigns();
    await waitFor(() => expect(screen.getByText('Open Camp 1')).toBeInTheDocument());
    expect(screen.getByText('Open Camp 2')).toBeInTheDocument();
  });

  it('shows Join Campaign button for non-accepted campaigns', async () => {
    renderCampaigns();
    // Join Campaign button is inside expanded card — expand the first card first
    await waitFor(() => screen.getByText('Open Camp 1'));
    fireEvent.click(screen.getByText('Open Camp 1'));
    await waitFor(() => expect(screen.getAllByText(/Join Campaign/i).length).toBeGreaterThan(0));
  });

  it('shows Joined badge for accepted campaigns', async () => {
    renderCampaigns();
    await waitFor(() => expect(screen.getAllByText(/Joined/i).length).toBeGreaterThan(0));
  });

  it('calls accept API when Join clicked', async () => {
    renderCampaigns();
    await waitFor(() => screen.getByText('Open Camp 1'));
    fireEvent.click(screen.getByText('Open Camp 1'));
    await waitFor(() => screen.getAllByText(/Join Campaign/i));
    fireEvent.click(screen.getAllByText(/Join Campaign/i)[0]);
    await waitFor(() => expect(api.post).toHaveBeenCalledWith(expect.stringContaining('/accept'), {}));
  });

  it('renders filter inputs', async () => {
    renderCampaigns();
    expect(screen.getByPlaceholderText(/Fashion/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/10000/i)).toBeInTheDocument();
  });

  it('calls API with category filter on Filter click', async () => {
    renderCampaigns();
    await userEvent.type(screen.getByPlaceholderText(/Fashion/i), 'Tech');
    fireEvent.click(screen.getByRole('button', { name: /Filter/i }));
    await waitFor(() => {
      const lastCall = vi.mocked(api.get).mock.calls.at(-1);
      expect(lastCall?.[1]?.params?.category).toBe('Tech');
    });
  });

  it('shows empty state when no campaigns returned', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { items: [] } });
    render(<MemoryRouter><InfluencerCampaigns /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText(/No campaigns found/i)).toBeInTheDocument());
  });

  it('clears filters when Clear clicked', async () => {
    renderCampaigns();
    await userEvent.type(screen.getByPlaceholderText(/Fashion/i), 'Tech');
    fireEvent.click(screen.getByRole('button', { name: /Clear/i }));
    await waitFor(() => expect(screen.getByPlaceholderText(/Fashion/i).value).toBe(''));
  });

  // ── Express Interest (TASK-701) ─────────────────────────────────────────────

  it('shows Express Interest button on each campaign card when expanded', async () => {
    renderCampaigns();
    await waitFor(() => screen.getByText('Open Camp 1'));
    // expand the first card
    fireEvent.click(screen.getByText('Open Camp 1'));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Express Interest/i })).toBeInTheDocument()
    );
  });

  it('shows express interest form when Express Interest button clicked', async () => {
    renderCampaigns();
    await waitFor(() => screen.getByText('Open Camp 1'));
    fireEvent.click(screen.getByText('Open Camp 1'));
    await waitFor(() => screen.getByRole('button', { name: /Express Interest/i }));
    fireEvent.click(screen.getByRole('button', { name: /Express Interest/i }));
    // message textarea must appear — terms is optional so just check message
    await waitFor(() =>
      expect(screen.getByPlaceholderText(/Introduce yourself/i)).toBeInTheDocument()
    );
  });

  it('calls express-interest API with message and proposedTerms on submit', async () => {
    const user = userEvent.setup();
    renderCampaigns();
    await waitFor(() => screen.getByText('Open Camp 1'));
    fireEvent.click(screen.getByText('Open Camp 1'));
    await waitFor(() => screen.getByRole('button', { name: /Express Interest/i }));
    fireEvent.click(screen.getByRole('button', { name: /Express Interest/i }));
    await waitFor(() => screen.getByPlaceholderText(/Introduce yourself/i));
    await user.type(screen.getByPlaceholderText(/Introduce yourself/i), 'I love your brand!');
    fireEvent.click(screen.getByRole('button', { name: /Send to Sponsor/i }));
    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith(
        expect.stringContaining('/express-interest'),
        expect.objectContaining({ message: 'I love your brand!' })
      )
    );
  });

  it('shows success message after express interest submitted', async () => {
    const user = userEvent.setup();
    renderCampaigns();
    await waitFor(() => screen.getByText('Open Camp 1'));
    fireEvent.click(screen.getByText('Open Camp 1'));
    await waitFor(() => screen.getByRole('button', { name: /Express Interest/i }));
    fireEvent.click(screen.getByRole('button', { name: /Express Interest/i }));
    await waitFor(() => screen.getByPlaceholderText(/Introduce yourself/i));
    await user.type(screen.getByPlaceholderText(/Introduce yourself/i), 'I love your brand!');
    fireEvent.click(screen.getByRole('button', { name: /Send to Sponsor/i }));
    await waitFor(() =>
      expect(screen.getByText(/interest has been sent/i)).toBeInTheDocument()
    );
  });

  it('shows error when express interest submitted without a message', async () => {
    renderCampaigns();
    await waitFor(() => screen.getByText('Open Camp 1'));
    fireEvent.click(screen.getByText('Open Camp 1'));
    await waitFor(() => screen.getByRole('button', { name: /Express Interest/i }));
    fireEvent.click(screen.getByRole('button', { name: /Express Interest/i }));
    await waitFor(() => screen.getByPlaceholderText(/Introduce yourself/i));
    // submit without typing anything
    fireEvent.click(screen.getByRole('button', { name: /Send to Sponsor/i }));
    await waitFor(() =>
      expect(screen.getByText(/please write a message/i)).toBeInTheDocument()
    );
    expect(api.post).not.toHaveBeenCalledWith(
      expect.stringContaining('/express-interest'),
      expect.anything()
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Deals page
// ─────────────────────────────────────────────────────────────────────────────
import InfluencerDeals from '../Components/InfluencerDashboard/InfluencerDeals';

function renderDeals() {
  localStorage.setItem('token','inf-tok');
  setupApiMocks();
  return render(<MemoryRouter><InfluencerDeals /></MemoryRouter>);
}

describe('InfluencerDeals', () => {

  beforeEach(() => { vi.mocked(api.get).mockReset(); vi.mocked(api.post).mockReset(); localStorage.setItem('token','inf-tok'); });

  it('renders My Deals heading', async () => {
    renderDeals();
    // LC renamed heading to "Sponsor Offers"
    await waitFor(() => expect(screen.getByText(/Offers/i)).toBeInTheDocument());
  });

  it('shows ad requests after load', async () => {
    renderDeals();
    await waitFor(() => expect(screen.getByText('SponsyCo')).toBeInTheDocument());
  });

  it('shows status filter tabs: all, pending, accepted, rejected, negotiation', async () => {
    renderDeals();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^all$/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /pending/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /accepted/i })).toBeInTheDocument();
    });
  });

  it('shows Accept, Negotiate, Decline buttons for pending requests', async () => {
    renderDeals();
    await waitFor(() => expect(screen.getByText('SponsyCo')).toBeInTheDocument());
    // Action buttons — filter out tab buttons
    const acceptBtn = screen.getAllByRole('button').find(
      b => !b.classList.contains('is-tab') && /^Accept$/i.test(b.textContent?.trim())
    );
    const negotiateBtn = screen.getAllByRole('button').find(
      b => !b.classList.contains('is-tab') && /Negotiate/i.test(b.textContent)
    );
    const declineBtn = screen.getAllByRole('button').find(
      b => !b.classList.contains('is-tab') && /Decline/i.test(b.textContent)
    );
    expect(acceptBtn).toBeTruthy();
    expect(negotiateBtn).toBeTruthy();
    expect(declineBtn).toBeTruthy();
  });

  it('calls accept API when Accept clicked', async () => {
    renderDeals();
    await waitFor(() => screen.getByText(/^Accept$/i));
    fireEvent.click(screen.getByText(/^Accept$/i));
    await waitFor(() => expect(api.post).toHaveBeenCalledWith(expect.stringContaining('/accept'), {}));
  });

  it('calls reject API when Decline clicked', async () => {
    renderDeals();
    await waitFor(() => screen.getByText('SponsyCo'));
    const declineBtn = screen.getAllByRole('button').find(
      b => !b.classList.contains('is-tab') && /Decline/i.test(b.textContent)
    );
    fireEvent.click(declineBtn);
    await waitFor(() => expect(api.post).toHaveBeenCalledWith(expect.stringContaining('/reject'), {}));
  });

  it('shows negotiate counter-offer textarea when Negotiate clicked', async () => {
    renderDeals();
    await waitFor(() => screen.getByText(/Negotiate/i));
    fireEvent.click(screen.getByText(/Negotiate/i));
    await waitFor(() => expect(screen.getByPlaceholderText(/revised terms/i)).toBeInTheDocument());
  });

  it('sends counter-offer via negotiate API', async () => {
    renderDeals();
    await waitFor(() => screen.getByText(/Negotiate/i));
    fireEvent.click(screen.getByText(/Negotiate/i));
    await waitFor(() => screen.getByPlaceholderText(/revised terms/i));
    await userEvent.type(screen.getByPlaceholderText(/revised terms/i), '2 posts for ₹8000');
    fireEvent.click(screen.getByRole('button', { name: /^Send$/i }));
    await waitFor(() => expect(api.post).toHaveBeenCalledWith(
      expect.stringContaining('/negotiate'),
      { counterTerms: '2 posts for ₹8000' }
    ));
  });

  it('filters to pending only when Pending tab clicked', async () => {
    renderDeals();
    await waitFor(() => screen.getByText('SponsyCo'));
    fireEvent.click(screen.getByRole('button', { name: /pending/i }));
    await waitFor(() => expect(screen.getByText('SponsyCo')).toBeInTheDocument());
    expect(screen.queryByText('OtherSponsor')).not.toBeInTheDocument();
  });

  it('shows empty state when no deals', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] });
    render(<MemoryRouter><InfluencerDeals /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText(/deals yet/i)).toBeInTheDocument());
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Settings page
// ─────────────────────────────────────────────────────────────────────────────
import InfluencerSettings from '../Components/InfluencerDashboard/InfluencerSettings';

function renderSettings() {
  localStorage.setItem('token','inf-tok');
  setupApiMocks();
  return render(<MemoryRouter><InfluencerSettings /></MemoryRouter>);
}

describe('InfluencerSettings', () => {

  beforeEach(() => {
    mockNavigate.mockClear();
    vi.mocked(api.get).mockReset();
    vi.mocked(api.put).mockReset();
    vi.mocked(api.post).mockReset();
    localStorage.setItem('token','inf-tok');
  });

  it('redirects to /login when no token', () => {
    localStorage.removeItem('token');
    render(<MemoryRouter><InfluencerSettings /></MemoryRouter>);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('renders Settings heading', async () => {
    renderSettings();
    // Heading is "Profile & Settings" — gradient span on "Settings"
    await waitFor(() =>
      expect(screen.getByText('Settings', { selector: '.is-gradient-text' })).toBeInTheDocument()
    );
  });

  it('shows user name and category after load', async () => {
    setupApiMocks();
    render(<MemoryRouter><InfluencerSettings /></MemoryRouter>);
    // Name appears in avatar card and form — use getAllByText
    await waitFor(() => expect(screen.getAllByText('Test Influencer').length).toBeGreaterThan(0));
    expect(screen.getAllByText('Tech').length).toBeGreaterThan(0);
  });

  it('shows email as read-only', async () => {
    renderSettings();
    await waitFor(() => expect(screen.getByText('inf@t.com')).toBeInTheDocument());
    expect(screen.getByText(/Read-only/i)).toBeInTheDocument();
  });

  it('renders Edit button', async () => {
    renderSettings();
    await waitFor(() => expect(screen.getByRole('button', { name: /Edit/i })).toBeInTheDocument());
  });

  it('shows input fields in edit mode', async () => {
    renderSettings();
    await waitFor(() => screen.getByRole('button', { name: /Edit/i }));
    fireEvent.click(screen.getByRole('button', { name: /Edit/i }));
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Influencer')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Tech')).toBeInTheDocument();
    });
  });

  it('calls PUT /api/influencer/profile on save', async () => {
    vi.mocked(api.put).mockResolvedValue({ data: PROFILE });
    renderSettings();
    await waitFor(() => screen.getByRole('button', { name: /Edit/i }));
    fireEvent.click(screen.getByRole('button', { name: /Edit/i }));
    await waitFor(() => screen.getByRole('button', { name: /Save Changes/i }));
    fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));
    await waitFor(() => expect(api.put).toHaveBeenCalledWith('/api/influencer/profile', expect.any(Object)));
  });

  it('shows success message after profile save', async () => {
    vi.mocked(api.put).mockResolvedValue({ data: PROFILE });
    renderSettings();
    await waitFor(() => screen.getByRole('button', { name: /Edit/i }));
    fireEvent.click(screen.getByRole('button', { name: /Edit/i }));
    await waitFor(() => screen.getByRole('button', { name: /Save Changes/i }));
    fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));
    await waitFor(() => expect(screen.getByText(/Profile updated/i)).toBeInTheDocument());
  });

  it('shows error when update fails', async () => {
    setupApiMocks();
    vi.mocked(api.put).mockRejectedValue(new Error('fail'));
    render(<MemoryRouter><InfluencerSettings /></MemoryRouter>);
    await waitFor(() => screen.getByRole('button', { name: /Edit/i }));
    fireEvent.click(screen.getByRole('button', { name: /Edit/i }));
    await waitFor(() => screen.getByRole('button', { name: /Save Changes/i }));
    fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));
    await waitFor(() => expect(screen.getByText(/Update failed/i)).toBeInTheDocument());
  });

  it('has a file input for profile photo', async () => {
    setupApiMocks();
    render(<MemoryRouter><InfluencerSettings /></MemoryRouter>);
    await waitFor(() =>
      expect(screen.getByText('Settings', { selector: '.is-gradient-text' })).toBeInTheDocument()
    );
    expect(document.querySelector('input[type="file"]')).toBeInTheDocument();
  });
});
