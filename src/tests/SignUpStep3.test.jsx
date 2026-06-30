/**
 * Tests for src/signup/steps/SignUpStep3.jsx
 * Covers review display, submission, success/error handling.
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

  it('navigates to /signup-success on successful registration', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: { message: 'User registered successfully' } });
    renderStep3();
    fireEvent.click(screen.getByRole('button', { name: /Confirm/i }));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/signup-success'));
  });

  it('shows error message on registration failure', async () => {
    vi.mocked(api.post).mockRejectedValueOnce({
      response: { data: { message: 'User already exists' } },
    });
    renderStep3();
    fireEvent.click(screen.getByRole('button', { name: /Confirm/i }));
    await waitFor(() => expect(screen.getByText(/User already exists/i)).toBeInTheDocument());
  });

  it('does NOT navigate on registration failure', async () => {
    vi.mocked(api.post).mockRejectedValueOnce({
      response: { data: { message: 'fail' } },
    });
    renderStep3();
    fireEvent.click(screen.getByRole('button', { name: /Confirm/i }));
    await waitFor(() => expect(screen.getByText(/fail/i)).toBeInTheDocument());
    expect(mockNavigate).not.toHaveBeenCalledWith('/signup-success');
  });

  it('disables Confirm button while submitting', async () => {
    vi.mocked(api.post).mockImplementationOnce(() => new Promise(() => {})); // never resolves
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

  it('calls POST /api/auth/register', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: {} });
    renderStep3();
    fireEvent.click(screen.getByRole('button', { name: /Confirm/i }));
    await waitFor(() => expect(api.post).toHaveBeenCalledWith('/api/auth/register', expect.any(FormData)));
  });
});
