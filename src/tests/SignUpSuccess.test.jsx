/**
 * Tests for src/signup/steps/SignUpSuccess.jsx
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SignUpSuccess from '../signup/steps/SignUpSuccess';

function renderSuccess() {
  return render(<MemoryRouter><SignUpSuccess /></MemoryRouter>);
}

describe('SignUpSuccess', () => {

  it("renders the success message", () => {
    renderSuccess();
    expect(screen.getByText(/You're in!/i)).toBeInTheDocument();
  });

  it('renders Sign In link', () => {
    renderSuccess();
    expect(screen.getByRole('link', { name: /Sign In/i })).toBeInTheDocument();
  });

  it('renders Home link', () => {
    renderSuccess();
    expect(screen.getByRole('link', { name: /Home/i })).toBeInTheDocument();
  });

  it('Sign In link points to /login', () => {
    renderSuccess();
    expect(screen.getByRole('link', { name: /Sign In/i })).toHaveAttribute('href', '/login');
  });

  it('Home link points to /', () => {
    renderSuccess();
    expect(screen.getByRole('link', { name: /Home/i })).toHaveAttribute('href', '/');
  });

  it('renders InSync brand', () => {
    renderSuccess();
    expect(screen.getByText(/InSync/i)).toBeInTheDocument();
  });

  it('shows feature promise chips', () => {
    renderSuccess();
    expect(screen.getByText(/Discover/i)).toBeInTheDocument();
    expect(screen.getByText(/Negotiate/i)).toBeInTheDocument();
    expect(screen.getByText(/Track/i)).toBeInTheDocument();
  });

  it('does NOT show any fake stats', () => {
    renderSuccess();
    expect(screen.queryByText(/12K/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/97%/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/3\.4K/i)).not.toBeInTheDocument();
  });
});
