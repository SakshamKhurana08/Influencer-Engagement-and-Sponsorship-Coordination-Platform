/**
 * Tests for src/Components/ResetPassword.jsx
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ResetPassword from '../Components/ResetPassword';

vi.mock('../api/axiosInstance', () => ({
  default: {
    post: vi.fn(),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  },
}));
vi.mock('../Components/BrandLogo', () => ({ default: () => <div data-testid="brand-logo" /> }));
vi.mock('../theme/ThemeContext', () => ({ useTheme: () => ({ theme: 'dark', toggleTheme: () => {} }) }));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

import api from '../api/axiosInstance';

function renderReset(token = 'valid-token') {
  return render(
    <MemoryRouter initialEntries={[`/reset-password?token=${token}`]}>
      <ResetPassword />
    </MemoryRouter>
  );
}

describe('ResetPassword', () => {

  beforeEach(() => { vi.mocked(api.post).mockReset(); mockNavigate.mockClear(); });

  it('renders Set new password heading', () => {
    renderReset();
    expect(screen.getByText(/Set new password/i)).toBeInTheDocument();
  });

  it('renders password and confirm inputs', () => {
    renderReset();
    expect(document.querySelector('#reset-pw')).toBeInTheDocument();
    expect(document.querySelector('#reset-confirm')).toBeInTheDocument();
  });

  it('renders Update Password button', () => {
    renderReset();
    expect(screen.getByRole('button', { name: /Update Password/i })).toBeInTheDocument();
  });

  it('shows error when passwords do not match', async () => {
    const user = userEvent.setup();
    renderReset();
    await user.type(document.querySelector('#reset-pw'), 'password1');
    await user.type(document.querySelector('#reset-confirm'), 'password2');
    fireEvent.click(screen.getByRole('button', { name: /Update Password/i }));
    await waitFor(() => expect(screen.getByText(/do not match/i)).toBeInTheDocument());
    expect(api.post).not.toHaveBeenCalled();
  });

  it('shows error when password is too short', async () => {
    const user = userEvent.setup();
    renderReset();
    await user.type(document.querySelector('#reset-pw'), 'abc');
    await user.type(document.querySelector('#reset-confirm'), 'abc');
    fireEvent.click(screen.getByRole('button', { name: /Update Password/i }));
    await waitFor(() => {
      // Error appears in the error banner div, not the placeholder
      const msgs = screen.getAllByText(/at least 6/i);
      const errorBanner = msgs.find(el => el.closest('.rounded-3'));
      expect(errorBanner).toBeTruthy();
    });
    expect(api.post).not.toHaveBeenCalled();
  });

  it('calls POST /api/auth/reset-password with token and password', async () => {
    const user = userEvent.setup();
    vi.mocked(api.post).mockResolvedValueOnce({ data: { message: 'Password updated.' } });
    renderReset('my-token');
    await user.type(document.querySelector('#reset-pw'), 'newpass1');
    await user.type(document.querySelector('#reset-confirm'), 'newpass1');
    fireEvent.click(screen.getByRole('button', { name: /Update Password/i }));
    await waitFor(() => expect(api.post).toHaveBeenCalledWith(
      '/api/auth/reset-password',
      { token: 'my-token', password: 'newpass1' }
    ));
  });

  it('shows success state after update', async () => {
    const user = userEvent.setup();
    vi.mocked(api.post).mockResolvedValueOnce({ data: { message: 'Password updated.' } });
    renderReset();
    await user.type(document.querySelector('#reset-pw'), 'newpass1');
    await user.type(document.querySelector('#reset-confirm'), 'newpass1');
    fireEvent.click(screen.getByRole('button', { name: /Update Password/i }));
    await waitFor(() => expect(screen.getByText(/Password updated/i)).toBeInTheDocument());
  });

  it('shows API error message on failure', async () => {
    const user = userEvent.setup();
    vi.mocked(api.post).mockRejectedValueOnce({
      response: { data: { message: 'This link has expired or is invalid. Request a new one.' } },
    });
    renderReset('bad-token');
    await user.type(document.querySelector('#reset-pw'), 'newpass1');
    await user.type(document.querySelector('#reset-confirm'), 'newpass1');
    fireEvent.click(screen.getByRole('button', { name: /Update Password/i }));
    await waitFor(() => expect(screen.getByText(/expired or is invalid/i)).toBeInTheDocument());
  });

  it('shows Request new link on expired error', async () => {
    const user = userEvent.setup();
    vi.mocked(api.post).mockRejectedValueOnce({
      response: { data: { message: 'This link has expired or is invalid. Request a new one.' } },
    });
    renderReset('expired');
    await user.type(document.querySelector('#reset-pw'), 'newpass1');
    await user.type(document.querySelector('#reset-confirm'), 'newpass1');
    fireEvent.click(screen.getByRole('button', { name: /Update Password/i }));
    await waitFor(() => expect(screen.getByRole('link', { name: /Request a new link/i })).toBeInTheDocument());
  });
});
