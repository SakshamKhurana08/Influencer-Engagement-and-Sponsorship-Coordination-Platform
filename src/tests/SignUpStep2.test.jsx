/**
 * Tests for src/signup/steps/SignUpStep2.jsx
 * Default role in context is undefined → component shows influencer form.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import SignUpStep2 from '../signup/steps/SignUpStep2';
import { SignUpProvider, useSignup } from '../signup/SignUpContext';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

/* Wrap with a role pre-setter so we can test both modes */
function InfluencerWrapper({ children }) {
  return (
    <MemoryRouter>
      <SignUpProvider>{children}</SignUpProvider>
    </MemoryRouter>
  );
}

function SponsorWrapper() {
  // Inner component that sets role then renders Step2
  const Inner = () => {
    const { updateFormData } = useSignup();
    // Set role on first render
    if (true) updateFormData({ role: 'sponsor' }); // always sets sponsor
    return <SignUpStep2 />;
  };
  return (
    <MemoryRouter>
      <SignUpProvider><Inner /></SignUpProvider>
    </MemoryRouter>
  );
}

function renderInfluencer() {
  return render(
    <InfluencerWrapper>
      <SignUpStep2 />
    </InfluencerWrapper>
  );
}

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

  it('shows validation errors on empty Continue (influencer mode)', async () => {
    renderInfluencer();
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    await waitFor(() => {
      expect(screen.getByText(/Category required/i)).toBeInTheDocument();
    });
  });

  it('does NOT navigate when form is invalid', async () => {
    renderInfluencer();
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    await waitFor(() => expect(mockNavigate).not.toHaveBeenCalledWith('/signup/step3'));
  });

  // ── Influencer fields ──────────────────────────────────────────────────────

  it('renders combobox for Content Category', () => {
    renderInfluencer();
    // ComboBox renders a plain input with placeholder
    expect(screen.getByPlaceholderText(/Select or type a category/i)).toBeInTheDocument();
  });

  it('renders combobox for Niche', () => {
    renderInfluencer();
    expect(screen.getByPlaceholderText(/Select or type a niche/i)).toBeInTheDocument();
  });

  it('renders Total Reach field', () => {
    renderInfluencer();
    expect(screen.getByPlaceholderText('50000')).toBeInTheDocument();
  });

  it('shows profile photo upload UI', () => {
    renderInfluencer();
    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveAttribute('accept', 'image/*');
  });

  it('clears category error when user types', async () => {
    renderInfluencer();
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    await waitFor(() => expect(screen.getByText(/Category required/i)).toBeInTheDocument());
    const categoryInput = screen.getByPlaceholderText(/Select or type a category/i);
    await userEvent.type(categoryInput, 'Fashion');
    await waitFor(() => expect(screen.queryByText(/Category required/i)).not.toBeInTheDocument());
  });

  it('navigates to step3 when influencer form is valid', async () => {
    renderInfluencer();
    await userEvent.type(screen.getByPlaceholderText(/Select or type a category/i), 'Fashion');
    // Pick from dropdown or confirm custom
    await userEvent.keyboard('{Escape}');
    await userEvent.type(screen.getByPlaceholderText(/Select or type a niche/i), 'Streetwear');
    await userEvent.keyboard('{Escape}');
    await userEvent.type(screen.getByPlaceholderText('50000'), '100000');
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/signup/step3'));
  });

  // ── Sponsor fields ─────────────────────────────────────────────────────────

  it('renders Company Name field in sponsor mode', () => {
    render(<SponsorWrapper />);
    expect(screen.getByPlaceholderText(/Acme Corp/i)).toBeInTheDocument();
  });

  it('renders Industry combobox in sponsor mode', () => {
    render(<SponsorWrapper />);
    expect(screen.getByPlaceholderText(/Select or type an industry/i)).toBeInTheDocument();
  });

  it('renders Campaign Budget field in sponsor mode', () => {
    render(<SponsorWrapper />);
    expect(screen.getByPlaceholderText('50000')).toBeInTheDocument();
  });

  it('navigates to step3 when sponsor form is valid', async () => {
    render(<SponsorWrapper />);
    await userEvent.type(screen.getByPlaceholderText(/Acme Corp/i), 'My Company');
    await userEvent.type(screen.getByPlaceholderText(/Select or type an industry/i), 'Tech');
    await userEvent.keyboard('{Escape}');
    await userEvent.type(screen.getByPlaceholderText('50000'), '50000');
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/signup/step3'));
  });
});
