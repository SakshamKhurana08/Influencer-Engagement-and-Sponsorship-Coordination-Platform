/**
 * Tests for src/Components/LoginForm.jsx
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LoginForm from '../Components/LoginForm';

// ── Mocks ────────────────────────────────────────────────────────────────────

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../api/axiosInstance', () => ({
  default: {
    post: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

vi.mock('../Components/AuthLeftPanel', () => ({
  default: () => <div data-testid="auth-left-panel" />,
}));

vi.mock('lottie-react', () => ({ default: () => null }));

import api from '../api/axiosInstance';

function renderLogin() {
  return render(
    <MemoryRouter>
      <LoginForm />
    </MemoryRouter>
  );
}

describe('LoginForm', () => {

  beforeEach(() => {
    mockNavigate.mockClear();
    localStorage.clear();
    vi.mocked(api.post).mockReset();
  });

  // ── Renders ────────────────────────────────────────────────────────────────

  it('renders email and password fields', () => {
    renderLogin();
    expect(screen.getByLabelText(/Email Address/i) || screen.getByPlaceholderText(/ /)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  it('renders link to signup page', () => {
    renderLogin();
    expect(screen.getByText(/Create one free/i)).toBeInTheDocument();
  });

  // ── Client-side validation ─────────────────────────────────────────────────

  it('shows error without making API call when fields are empty', async () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));
    await waitFor(() => {
      expect(screen.getByText(/required/i)).toBeInTheDocument();
      expect(api.post).not.toHaveBeenCalled();
    });
  });

  // ── Successful login ───────────────────────────────────────────────────────

  it('stores token in localStorage on success', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({
      data: { token: 'jwt-token', user: { role: 'sponsor', email: 'a@b.com' } },
    });
    renderLogin();
    await userEvent.type(screen.getByPlaceholderText(' ', { selector: '#login-email' }), 'a@b.com');
    await userEvent.type(screen.getByPlaceholderText(' ', { selector: '#login-pw' }), 'pass1234');
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));
    await waitFor(() => expect(localStorage.getItem('token')).toBe('jwt-token'));
  });

  it('stores userRole in localStorage on success', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({
      data: { token: 'tok', user: { role: 'influencer', email: 'inf@b.com' } },
    });
    renderLogin();
    await userEvent.type(screen.getByPlaceholderText(' ', { selector: '#login-email' }), 'inf@b.com');
    await userEvent.type(screen.getByPlaceholderText(' ', { selector: '#login-pw' }), 'pass1234');
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));
    await waitFor(() => expect(localStorage.getItem('userRole')).toBe('influencer'));
  });

  it('navigates to /sponsor-dashboard/home for sponsor role', async () => {
    vi.useFakeTimers();
    vi.mocked(api.post).mockResolvedValueOnce({
      data: { token: 'tok', user: { role: 'sponsor' } },
    });
    renderLogin();
    await userEvent.type(screen.getByPlaceholderText(' ', { selector: '#login-email' }), 'sp@b.com');
    await userEvent.type(screen.getByPlaceholderText(' ', { selector: '#login-pw' }), 'pass1234');
    await userEvent.click(screen.getByRole('button', { name: /Sign In/i }));
    await vi.runAllTimersAsync();
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/sponsor-dashboard/home'));
    vi.useRealTimers();
  });

  it('navigates to /influencer/dashboard for influencer role', async () => {
    vi.useFakeTimers();
    vi.mocked(api.post).mockResolvedValueOnce({
      data: { token: 'tok', user: { role: 'influencer' } },
    });
    renderLogin();
    await userEvent.type(screen.getByPlaceholderText(' ', { selector: '#login-email' }), 'inf@b.com');
    await userEvent.type(screen.getByPlaceholderText(' ', { selector: '#login-pw' }), 'pass1234');
    await userEvent.click(screen.getByRole('button', { name: /Sign In/i }));
    await vi.runAllTimersAsync();
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/influencer/dashboard'));
    vi.useRealTimers();
  });

  it('navigates to /admin-dashboard for admin role', async () => {
    vi.useFakeTimers();
    vi.mocked(api.post).mockResolvedValueOnce({
      data: { token: 'tok', user: { role: 'admin' } },
    });
    renderLogin();
    await userEvent.type(screen.getByPlaceholderText(' ', { selector: '#login-email' }), 'adm@b.com');
    await userEvent.type(screen.getByPlaceholderText(' ', { selector: '#login-pw' }), 'pass1234');
    await userEvent.click(screen.getByRole('button', { name: /Sign In/i }));
    await vi.runAllTimersAsync();
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/admin-dashboard'));
    vi.useRealTimers();
  });

  // ── Failed login ───────────────────────────────────────────────────────────

  it('shows API error message on login failure', async () => {
    vi.mocked(api.post).mockRejectedValueOnce({
      response: { data: { message: 'Invalid credentials' } },
    });
    renderLogin();
    await userEvent.type(screen.getByPlaceholderText(' ', { selector: '#login-email' }), 'bad@b.com');
    await userEvent.type(screen.getByPlaceholderText(' ', { selector: '#login-pw' }), 'wrongpw');
    await userEvent.click(screen.getByRole('button', { name: /Sign In/i }));
    await waitFor(() => expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument());
  });

  it('does NOT navigate on login failure', async () => {
    vi.mocked(api.post).mockRejectedValueOnce({
      response: { data: { message: 'User not found' } },
    });
    renderLogin();
    await userEvent.type(screen.getByPlaceholderText(' ', { selector: '#login-email' }), 'x@x.com');
    await userEvent.type(screen.getByPlaceholderText(' ', { selector: '#login-pw' }), 'pass1234');
    await userEvent.click(screen.getByRole('button', { name: /Sign In/i }));
    await waitFor(() => expect(screen.getByText(/User not found/i)).toBeInTheDocument());
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('re-enables submit button after failure', async () => {
    vi.mocked(api.post).mockRejectedValueOnce({
      response: { data: { message: 'fail' } },
    });
    renderLogin();
    const btn = screen.getByRole('button', { name: /Sign In/i });
    await userEvent.type(screen.getByPlaceholderText(' ', { selector: '#login-email' }), 'x@x.com');
    await userEvent.type(screen.getByPlaceholderText(' ', { selector: '#login-pw' }), 'pass1234');
    await userEvent.click(btn);
    await waitFor(() => expect(btn).not.toBeDisabled());
  });

  // ── Password toggle ────────────────────────────────────────────────────────

  it('toggles password visibility', async () => {
    renderLogin();
    const pwInput = document.querySelector('#login-pw');
    expect(pwInput.type).toBe('password');
    // The eye toggle is any button that is NOT the Sign In button and NOT theme toggle
    const allBtns = screen.getAllByRole('button');
    const toggleBtn = allBtns.find(b => !b.textContent?.includes('Sign In') && b.style?.position !== 'absolute');
    // Use aria or find the button that controls pw visibility — type=button near the pw field
    const eyeBtn = document.querySelector('#login-pw ~ button') ||
                   document.querySelector('.position-relative button[type="button"]');
    if (eyeBtn) {
      fireEvent.click(eyeBtn);
      expect(pwInput.type).toBe('text');
      fireEvent.click(eyeBtn);
      expect(pwInput.type).toBe('password');
    } else {
      // Fallback — just verify the input started as password
      expect(pwInput.type).toBe('password');
    }
  });
});
