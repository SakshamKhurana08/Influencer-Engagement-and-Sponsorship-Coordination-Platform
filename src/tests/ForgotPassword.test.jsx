/**
 * Tests for src/Components/ForgotPassword.jsx
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ForgotPassword from '../Components/ForgotPassword';

vi.mock('../api/axiosInstance', () => ({
  default: {
    post: vi.fn(),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  },
}));
vi.mock('../Components/BrandLogo', () => ({ default: () => <div data-testid="brand-logo" /> }));
vi.mock('../theme/ThemeContext', () => ({ useTheme: () => ({ theme: 'dark', toggleTheme: () => {} }) }));

import api from '../api/axiosInstance';

function renderForgot() {
  return render(<MemoryRouter><ForgotPassword /></MemoryRouter>);
}

describe('ForgotPassword', () => {

  beforeEach(() => { vi.mocked(api.post).mockReset(); });

  it('renders Forgot password heading', () => {
    renderForgot();
    expect(screen.getByText(/Forgot password/i)).toBeInTheDocument();
  });

  it('renders email input', () => {
    renderForgot();
    expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument();
  });

  it('renders Send Reset Link button', () => {
    renderForgot();
    expect(screen.getByRole('button', { name: /Send Reset Link/i })).toBeInTheDocument();
  });

  it('renders Back to Login link', () => {
    renderForgot();
    expect(screen.getByRole('link', { name: /Back to Login/i })).toBeInTheDocument();
  });

  it('calls POST /api/auth/forgot-password on submit', async () => {
    const user = userEvent.setup();
    vi.mocked(api.post).mockResolvedValueOnce({ data: { message: 'ok' } });
    renderForgot();
    await user.type(screen.getByPlaceholderText(/you@example.com/i), 'test@test.com');
    fireEvent.click(screen.getByRole('button', { name: /Send Reset Link/i }));
    await waitFor(() => expect(api.post).toHaveBeenCalledWith(
      '/api/auth/forgot-password', { email: 'test@test.com' }
    ));
  });

  it('shows success state after submit regardless of API result', async () => {
    const user = userEvent.setup();
    vi.mocked(api.post).mockResolvedValueOnce({ data: {} });
    renderForgot();
    await user.type(screen.getByPlaceholderText(/you@example.com/i), 'test@test.com');
    fireEvent.click(screen.getByRole('button', { name: /Send Reset Link/i }));
    await waitFor(() => expect(screen.getByText(/Check your inbox/i)).toBeInTheDocument());
  });

  it('shows success state even when API throws', async () => {
    const user = userEvent.setup();
    vi.mocked(api.post).mockRejectedValueOnce(new Error('fail'));
    renderForgot();
    await user.type(screen.getByPlaceholderText(/you@example.com/i), 'test@test.com');
    fireEvent.click(screen.getByRole('button', { name: /Send Reset Link/i }));
    await waitFor(() => expect(screen.getByText(/Check your inbox/i)).toBeInTheDocument());
  });

  it('success message does not reveal whether email exists', async () => {
    const user = userEvent.setup();
    vi.mocked(api.post).mockResolvedValueOnce({ data: {} });
    renderForgot();
    await user.type(screen.getByPlaceholderText(/you@example.com/i), 'nobody@test.com');
    fireEvent.click(screen.getByRole('button', { name: /Send Reset Link/i }));
    await waitFor(() => screen.getByText(/Check your inbox/i));
    // Must NOT say "email not found" or anything revealing
    expect(screen.queryByText(/not found/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/doesn't exist/i)).not.toBeInTheDocument();
  });
});
