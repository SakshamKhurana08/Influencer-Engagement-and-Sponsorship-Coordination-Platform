/**
 * Tests for src/signup/steps/SignUpStep3.jsx
 * Register now returns 202 (pending approval) instead of 201.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SignUpStep3 from '../signup/steps/SignUpStep3';
import { SignUpProvider } from '../signup/SignUpContext';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../api/axiosInstance', () => ({
  default: { post: vi.fn(), interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } } },
}));

import api from '../api/axiosInstance';

function renderStep3() {
  return render(
    <MemoryRouter>
      <SignUpProvider>
        <SignUpStep3 />
      </SignUpProvider>
    </MemoryRouter>
  );
}

describe('SignUpStep3', () => {

  beforeEach(() => {
    mockNavigate.mockClear();
    vi.mocked(api.post).mockReset();
  });

  it('renders Step 3 of 3 indicator', () => {
    renderStep3();
    expect(screen.getByText(/Step 3 of 3/i)).toBeInTheDocument();
  });

  it('renders Back and Confirm & Register buttons', () => {
    renderStep3();
    expect(screen.getByRole('button', { name: /Back/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Confirm/i })).toBeInTheDocument();
  });

  it('Back button navigates to /signup/step2', () => {
    renderStep3();
    fireEvent.click(screen.getByRole('button', { name: /Back/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/signup/step2');
  });

  // Backend returns 202 for pending approval — axios resolves 2xx without throwing
  it('navigates to /signup-success on 202 response (pending approval)', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({
      status: 202,
      data: { message: 'Registration submitted. Awaiting admin approval.' },
    });
    renderStep3();
    fireEvent.click(screen.getByRole('button', { name: /Confirm/i }));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/signup-success'));
  });

  it('navigates to /signup-success on 201 response (legacy)', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({
      status: 201,
      data: { message: 'User registered successfully' },
    });
    renderStep3();
    fireEvent.click(screen.getByRole('button', { name: /Confirm/i }));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/signup-success'));
  });

  it('shows error message on registration failure', async () => {
    vi.mocked(api.post).mockRejectedValueOnce({
      response: { status: 400, data: { message: 'User already exists' } },
    });
    renderStep3();
    fireEvent.click(screen.getByRole('button', { name: /Confirm/i }));
    await waitFor(() => expect(screen.getByText(/User already exists/i)).toBeInTheDocument());
  });

  it('does NOT navigate on registration failure', async () => {
    vi.mocked(api.post).mockRejectedValueOnce({
      response: { status: 500, data: { message: 'fail' } },
    });
    renderStep3();
    fireEvent.click(screen.getByRole('button', { name: /Confirm/i }));
    await waitFor(() => expect(screen.getByText(/fail/i)).toBeInTheDocument());
    expect(mockNavigate).not.toHaveBeenCalledWith('/signup-success');
  });

  it('disables Confirm button while submitting', async () => {
    vi.mocked(api.post).mockImplementationOnce(() => new Promise(() => {}));
    renderStep3();
    const btn = screen.getByRole('button', { name: /Confirm/i });
    fireEvent.click(btn);
    await waitFor(() => expect(btn).toBeDisabled());
  });

  it('re-enables button after failure', async () => {
    vi.mocked(api.post).mockRejectedValueOnce({ response: { data: { message: 'err' } } });
    renderStep3();
    const btn = screen.getByRole('button', { name: /Confirm/i });
    fireEvent.click(btn);
    await waitFor(() => expect(btn).not.toBeDisabled());
  });

  it('calls POST /api/auth/register with FormData', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ status: 202, data: {} });
    renderStep3();
    fireEvent.click(screen.getByRole('button', { name: /Confirm/i }));
    await waitFor(() => expect(api.post).toHaveBeenCalledWith('/api/auth/register', expect.any(FormData)));
  });

  it('shows fallback error message when response has no message', async () => {
    vi.mocked(api.post).mockRejectedValueOnce({ response: { data: {} } });
    renderStep3();
    fireEvent.click(screen.getByRole('button', { name: /Confirm/i }));
    await waitFor(() => expect(screen.getByText(/Registration failed/i)).toBeInTheDocument());
  });
});
