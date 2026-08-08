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

  it('renders the pending approval heading', () => {
    renderSuccess();
    expect(screen.getByText(/Application Submitted/i)).toBeInTheDocument();
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

  it('renders Cofluence brand logo', () => {
    renderSuccess();
    expect(screen.getByAltText(/Cofluence/i)).toBeInTheDocument();
  });

  it('renders pending approval message', () => {
    renderSuccess();
    expect(screen.getByText(/pending admin approval/i)).toBeInTheDocument();
  });

  it('renders the three next-step tiles: Review, Approval, Access', () => {
    renderSuccess();
    expect(screen.getByText('Review')).toBeInTheDocument();
    expect(screen.getByText('Approval')).toBeInTheDocument();
    expect(screen.getByText('Access')).toBeInTheDocument();
  });

  it('renders tile descriptions', () => {
    renderSuccess();
    expect(screen.getByText(/Admin reviews your details/i)).toBeInTheDocument();
    expect(screen.getByText(/Account activated on approval/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign in and start exploring/i)).toBeInTheDocument();
  });
});
