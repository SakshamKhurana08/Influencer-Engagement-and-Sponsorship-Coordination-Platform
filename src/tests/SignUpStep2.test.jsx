/**
 * Tests for src/signup/steps/SignUpStep2.jsx
 *
 * The component renders two different forms depending on formData.role:
 *   - role === 'influencer' → Creator Details form (category, niche, reach, photo)
 *   - anything else         → Brand Details / sponsor form (company, industry, budget)
 *
 * Wrappers below pre-seed the context with the correct role via useEffect
 * so the role is set once after mount without causing re-render loops.
 */
import { describe, it, expect, vi, beforeEach, useEffect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useEffect as reactUseEffect } from 'react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import SignUpStep2 from '../signup/steps/SignUpStep2';
import { SignUpProvider, useSignup } from '../signup/SignUpContext';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

// ── Wrapper helpers ───────────────────────────────────────────────────────────

/** Renders Step2 with role='influencer' seeded once after mount. */
function InfluencerWrapper() {
  const Inner = () => {
    const { updateFormData } = useSignup();
    reactUseEffect(() => { updateFormData({ role: 'influencer' }); }, []); // eslint-disable-line
    return <SignUpStep2 />;
  };
  return (
    <MemoryRouter>
      <SignUpProvider><Inner /></SignUpProvider>
    </MemoryRouter>
  );
}

/** Renders Step2 with role='sponsor' seeded once after mount. */
function SponsorWrapper() {
  const Inner = () => {
    const { updateFormData } = useSignup();
    reactUseEffect(() => { updateFormData({ role: 'sponsor' }); }, []); // eslint-disable-line
    return <SignUpStep2 />;
  };
  return (
    <MemoryRouter>
      <SignUpProvider><Inner /></SignUpProvider>
    </MemoryRouter>
  );
}

function renderInfluencer() { return render(<InfluencerWrapper />); }
function renderSponsor()    { return render(<SponsorWrapper />); }

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('SignUpStep2', () => {

  beforeEach(() => mockNavigate.mockClear());

  // ── Common ─────────────────────────────────────────────────────────────────

  it('renders step 2 of 3 indicator', () => {
    renderInfluencer();
    expect(screen.getByText(/Step 2 of 3/i)).toBeInTheDocument();
  });

  it('renders Back and Continue buttons', () => {
    renderInfluencer();
    expect(screen.getByRole('button', { name: /Back/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continue/i })).toBeInTheDocument();
  });

  it('Back button navigates to /signup/step1', () => {
    renderInfluencer();
    fireEvent.click(screen.getByRole('button', { name: /Back/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/signup/step1');
  });

  it('does NOT navigate when form is invalid', async () => {
    renderInfluencer();
    // Wait for influencer form to appear after useEffect seeds role
    await waitFor(() =>
      expect(screen.getByPlaceholderText(/Select or type a category/i)).toBeInTheDocument()
    );
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    await waitFor(() => expect(mockNavigate).not.toHaveBeenCalledWith('/signup/step3'));
  });

  // ── Influencer fields ──────────────────────────────────────────────────────

  it('shows validation errors on empty Continue (influencer mode)', async () => {
    renderInfluencer();
    await waitFor(() =>
      expect(screen.getByPlaceholderText(/Select or type a category/i)).toBeInTheDocument()
    );
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    await waitFor(() => {
      expect(screen.getByText(/Category required/i)).toBeInTheDocument();
    });
  });

  it('renders combobox for Content Category', async () => {
    renderInfluencer();
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Select or type a category/i)).toBeInTheDocument();
    });
  });

  it('renders combobox for Niche', async () => {
    renderInfluencer();
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Select or type a niche/i)).toBeInTheDocument();
    });
  });

  it('renders Total Reach field', async () => {
    renderInfluencer();
    await waitFor(() => {
      expect(screen.getByPlaceholderText('50000')).toBeInTheDocument();
    });
  });

  it('shows profile photo upload UI', async () => {
    renderInfluencer();
    await waitFor(() => {
      const fileInput = document.querySelector('input[type="file"]');
      expect(fileInput).toBeInTheDocument();
      expect(fileInput).toHaveAttribute('accept', 'image/*');
    });
  });

  it('clears category error when user types', async () => {
    const user = userEvent.setup();
    renderInfluencer();
    await waitFor(() =>
      expect(screen.getByPlaceholderText(/Select or type a category/i)).toBeInTheDocument()
    );
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    await waitFor(() => expect(screen.getByText(/Category required/i)).toBeInTheDocument());
    await user.type(screen.getByPlaceholderText(/Select or type a category/i), 'Fashion');
    await waitFor(() => expect(screen.queryByText(/Category required/i)).not.toBeInTheDocument());
  });

  it('navigates to step3 when influencer form is valid', async () => {
    const user = userEvent.setup();
    renderInfluencer();
    await waitFor(() =>
      expect(screen.getByPlaceholderText(/Select or type a category/i)).toBeInTheDocument()
    );
    await user.type(screen.getByPlaceholderText(/Select or type a category/i), 'Fashion');
    await user.keyboard('{Escape}');
    await user.type(screen.getByPlaceholderText(/Select or type a niche/i), 'Streetwear');
    await user.keyboard('{Escape}');
    await user.type(screen.getByPlaceholderText('50000'), '100000');
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/signup/step3'));
  });

  // ── Sponsor fields ─────────────────────────────────────────────────────────

  it('renders Company Name field in sponsor mode', async () => {
    renderSponsor();
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Acme Corp/i)).toBeInTheDocument();
    });
  });

  it('renders Industry combobox in sponsor mode', async () => {
    renderSponsor();
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Select or type an industry/i)).toBeInTheDocument();
    });
  });

  it('renders Campaign Budget field in sponsor mode', async () => {
    renderSponsor();
    await waitFor(() => {
      expect(screen.getByPlaceholderText('50000')).toBeInTheDocument();
    });
  });

  it('shows validation errors on empty Continue (sponsor mode)', async () => {
    renderSponsor();
    await waitFor(() =>
      expect(screen.getByPlaceholderText(/Acme Corp/i)).toBeInTheDocument()
    );
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    await waitFor(() => {
      expect(screen.getByText(/Company name required/i)).toBeInTheDocument();
    });
  });

  it('navigates to step3 when sponsor form is valid', async () => {
    const user = userEvent.setup();
    renderSponsor();
    await waitFor(() =>
      expect(screen.getByPlaceholderText(/Acme Corp/i)).toBeInTheDocument()
    );
    await user.type(screen.getByPlaceholderText(/Acme Corp/i), 'My Company');
    await user.type(screen.getByPlaceholderText(/Select or type an industry/i), 'Tech');
    await user.keyboard('{Escape}');
    await user.type(screen.getByPlaceholderText('50000'), '50000');
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/signup/step3'));
  });
});
