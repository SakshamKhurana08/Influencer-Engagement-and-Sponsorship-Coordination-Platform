/**
 * Tests for src/signup/steps/SignUpStep1.jsx
 * Tests all client-side validation and role selection UI.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import SignUpStep1 from '../signup/steps/SignUpStep1';
import { SignUpProvider } from '../signup/SignUpContext';

// Mock react-router navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderStep1() {
  return render(
    <MemoryRouter>
      <SignUpProvider>
        <SignUpStep1 />
      </SignUpProvider>
    </MemoryRouter>
  );
}

describe('SignUpStep1', () => {

  beforeEach(() => {
    mockNavigate.mockClear();
  });

  // ── Renders ────────────────────────────────────────────────────────────────

  it('renders the form with all required fields', () => {
    renderStep1();
    expect(screen.getByPlaceholderText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Min. 6 characters')).toBeInTheDocument();
    expect(screen.getByText('Creator')).toBeInTheDocument();
    expect(screen.getByText('Sponsor')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continue/i })).toBeInTheDocument();
  });

  it('renders step indicator', () => {
    renderStep1();
    expect(screen.getByText(/Step 1 of 3/i)).toBeInTheDocument();
  });

  // ── Validation — empty submit ──────────────────────────────────────────────

  it('shows all errors when form is submitted empty', async () => {
    renderStep1();
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    await waitFor(() => {
      expect(screen.getByText(/Name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Valid email required/i)).toBeInTheDocument();
      expect(screen.getByText(/Password is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Select a role/i)).toBeInTheDocument();
      expect(screen.getByText(/must agree/i)).toBeInTheDocument();
    });
  });

  it('does NOT navigate on empty submit', async () => {
    renderStep1();
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    await waitFor(() => expect(mockNavigate).not.toHaveBeenCalled());
  });

  // ── Name validation ─────────────────────────────────────────────────────────

  it('shows name error when name is whitespace only', async () => {
    renderStep1();
    await userEvent.type(screen.getByPlaceholderText(/Jane Smith/i), '   ');
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    await waitFor(() => expect(screen.getByText(/Name is required/i)).toBeInTheDocument());
  });

  // ── Email validation ─────────────────────────────────────────────────────────

  it('shows email error for invalid email format', async () => {
    renderStep1();
    // Type into the email field — use id selector
    const emailInput = document.querySelector('#email');
    if (emailInput) {
      await userEvent.type(emailInput, 'notanemail');
    } else {
      await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'notanemail');
    }
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    await waitFor(() => expect(screen.getByText(/Valid email required/i)).toBeInTheDocument());
  });

  it('accepts valid email format', async () => {
    renderStep1();
    await userEvent.type(screen.getByPlaceholderText('Jane Smith'), 'Test User');
    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'valid@email.com');
    await userEvent.type(screen.getByPlaceholderText('Min. 6 characters'), 'pass1234');
    fireEvent.click(screen.getByText('Creator'));
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    await waitFor(() => expect(screen.queryByText(/Valid email required/i)).not.toBeInTheDocument());
  });

  // ── Password validation ──────────────────────────────────────────────────────

  it('shows error for password shorter than 6 chars', async () => {
    renderStep1();
    await userEvent.type(screen.getByPlaceholderText('Min. 6 characters'), 'abc');
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    // Actual error: "Password must be at least 6 characters"
    await waitFor(() => expect(screen.getByText(/at least 6/i)).toBeInTheDocument());
  });

  it('accepts password of exactly 6 chars', async () => {
    renderStep1();
    await userEvent.type(screen.getByPlaceholderText('Jane Smith'), 'Test');
    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'a@b.com');
    await userEvent.type(screen.getByPlaceholderText('Min. 6 characters'), 'abc123');
    fireEvent.click(screen.getByText('Creator'));
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    await waitFor(() => expect(screen.queryByText(/at least 6/i)).not.toBeInTheDocument());
  });

  // ── Role selection ───────────────────────────────────────────────────────────

  it('shows role error when no role selected', async () => {
    renderStep1();
    await userEvent.type(screen.getByPlaceholderText(/Jane Smith/i), 'Test');
    await userEvent.type(screen.getByPlaceholderText(/you@example.com/i), 'a@b.com');
    await userEvent.type(screen.getByPlaceholderText(/Min. 6 characters/i), 'pass1234');
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    await waitFor(() => expect(screen.getByText(/Select a role/i)).toBeInTheDocument());
  });

  it('clears role error when role is selected', async () => {
    renderStep1();
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    await waitFor(() => expect(screen.getByText(/Select a role/i)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/Creator/i));
    await waitFor(() => expect(screen.queryByText(/Select a role/i)).not.toBeInTheDocument());
  });

  // ── Terms checkbox ───────────────────────────────────────────────────────────

  it('shows terms error when terms not accepted', async () => {
    renderStep1();
    await userEvent.type(screen.getByPlaceholderText(/Jane Smith/i), 'Test');
    await userEvent.type(screen.getByPlaceholderText(/you@example.com/i), 'a@b.com');
    await userEvent.type(screen.getByPlaceholderText(/Min. 6 characters/i), 'pass1234');
    fireEvent.click(screen.getByText(/Creator/i));
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    await waitFor(() => expect(screen.getByText(/must agree/i)).toBeInTheDocument());
  });

  // ── Successful submit ────────────────────────────────────────────────────────

  it('navigates to /signup/step2 when all fields valid', async () => {
    renderStep1();
    await userEvent.type(screen.getByPlaceholderText(/Jane Smith/i), 'Test User');
    await userEvent.type(screen.getByPlaceholderText(/you@example.com/i), 'test@email.com');
    await userEvent.type(screen.getByPlaceholderText(/Min. 6 characters/i), 'pass1234');
    fireEvent.click(screen.getByText(/Sponsor/i));
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/signup/step2'));
  });

  it('clears individual field errors when user starts typing', async () => {
    renderStep1();
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    await waitFor(() => expect(screen.getByText(/Name is required/i)).toBeInTheDocument());
    await userEvent.type(screen.getByPlaceholderText(/Jane Smith/i), 'J');
    await waitFor(() => expect(screen.queryByText(/Name is required/i)).not.toBeInTheDocument());
  });
});
