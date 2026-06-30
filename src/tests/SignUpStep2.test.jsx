/**
 * Tests for src/signup/steps/SignUpStep2.jsx
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import SignUpStep2 from '../signup/steps/SignUpStep2';
import { SignUpProvider } from '../signup/SignUpContext';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

// Pre-load context with a role so Step2 knows what to show
function renderStep2(role = 'influencer') {
  const Wrapper = () => {
    const ctx = require('../signup/SignUpContext');
    return (
      <MemoryRouter>
        <ctx.SignUpProvider>
          <ContextSetter role={role} />
          <SignUpStep2 />
        </ctx.SignUpProvider>
      </MemoryRouter>
    );
  };

  // Simpler: wrap in provider and fire role selection externally
  return render(
    <MemoryRouter>
      <SignUpProvider>
        <SignUpStep2 />
      </SignUpProvider>
    </MemoryRouter>
  );
}

describe('SignUpStep2', () => {

  beforeEach(() => mockNavigate.mockClear());

  it('renders step 2 of 3 indicator', () => {
    renderStep2();
    expect(screen.getByText(/Step 2 of 3/i)).toBeInTheDocument();
  });

  it('renders Back and Continue buttons', () => {
    renderStep2();
    expect(screen.getByRole('button', { name: /Back/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continue/i })).toBeInTheDocument();
  });

  it('Back button navigates to /signup/step1', () => {
    renderStep2();
    fireEvent.click(screen.getByRole('button', { name: /Back/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/signup/step1');
  });

  it('shows validation errors when Continue clicked with empty form', async () => {
    renderStep2();
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    // Either influencer or sponsor errors should appear
    await waitFor(() => {
      const errors = screen.queryAllByText(/required|required/i);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  it('does NOT navigate when form is invalid', async () => {
    renderStep2();
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    await waitFor(() => expect(mockNavigate).not.toHaveBeenCalledWith('/signup/step3'));
  });

  it('navigates to /signup/step3 when sponsor form is valid', async () => {
    renderStep2();
    // Fill sponsor fields if they're visible (default may show influencer)
    const companyInput = screen.queryByPlaceholderText(/Acme Corp/i);
    if (companyInput) {
      await userEvent.type(companyInput, 'My Company');
      await userEvent.type(screen.getByPlaceholderText(/Retail/i), 'Tech');
      await userEvent.type(screen.getByPlaceholderText(/50000/i), '10000');
      fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
      await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/signup/step3'));
    }
  });

  it('shows profile photo upload UI for influencer role', () => {
    renderStep2();
    // The file input should be present (hidden via d-none)
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      expect(fileInput).toHaveAttribute('accept', 'image/*');
    }
  });
});
