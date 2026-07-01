/**
 * Tests for src/signup/steps/SignUpSuccess.jsx
 * Matches actual component: CheckCircle icon + feature chips (Discover/Negotiate/Track)
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SignUpSuccess from '../signup/steps/SignUpSuccess';

function renderSuccess() {
  return render(<MemoryRouter><SignUpSuccess /></MemoryRouter>);
}

describe('SignUpSuccess', () => {

  it("renders the success heading You're in!", () => {
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

  it('renders creator account message', () => {
    renderSuccess();
    expect(screen.getByText(/Your account has been created/i)).toBeInTheDocument();
  });

  it('renders feature promise chips: Discover, Negotiate, Track', () => {
    renderSuccess();
    expect(screen.getByText('Discover')).toBeInTheDocument();
    expect(screen.getByText('Negotiate')).toBeInTheDocument();
    expect(screen.getByText('Track')).toBeInTheDocument();
  });

  it('renders feature descriptions', () => {
    renderSuccess();
    expect(screen.getByText(/Browse real brand campaigns/i)).toBeInTheDocument();
    expect(screen.getByText(/Counter-offer built-in/i)).toBeInTheDocument();
    expect(screen.getByText(/Live deal status updates/i)).toBeInTheDocument();
  });
});
