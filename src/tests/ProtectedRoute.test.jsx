/**
 * Tests for src/Components/ProtectedRoute.jsx
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../Components/ProtectedRoute';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Build a JWT-like token with the given payload (not signature-verified). */
function makeToken(payload) {
  const header  = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body    = btoa(JSON.stringify(payload));
  return `${header}.${body}.fake-sig`;
}

function renderWithRouter(element, initialEntry = '/protected') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/protected" element={element} />
        <Route path="/login"              element={<div>Login Page</div>} />
        <Route path="/admin-dashboard"    element={<div>Admin Dashboard</div>} />
        <Route path="/sponsor-dashboard/home"  element={<div>Sponsor Home</div>} />
        <Route path="/influencer/dashboard"    element={<div>Influencer Dashboard</div>} />
      </Routes>
    </MemoryRouter>
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('ProtectedRoute', () => {

  beforeEach(() => {
    localStorage.clear();
  });

  // ── No token ────────────────────────────────────────────────────────────────

  it('redirects to /login when no token in localStorage', () => {
    renderWithRouter(
      <ProtectedRoute><div>Secret</div></ProtectedRoute>
    );
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Secret')).not.toBeInTheDocument();
  });

  // ── Expired token ───────────────────────────────────────────────────────────

  it('redirects to /login when token is expired', () => {
    const expired = makeToken({ role: 'sponsor', exp: Math.floor(Date.now() / 1000) - 3600 });
    localStorage.setItem('token', expired);
    renderWithRouter(
      <ProtectedRoute role="sponsor"><div>Secret</div></ProtectedRoute>
    );
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('clears localStorage when token is expired', () => {
    const expired = makeToken({ role: 'admin', exp: Math.floor(Date.now() / 1000) - 1 });
    localStorage.setItem('token', expired);
    localStorage.setItem('userRole', 'admin');
    renderWithRouter(<ProtectedRoute role="admin"><div>Secret</div></ProtectedRoute>);
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('userRole')).toBeNull();
  });

  // ── Malformed token ─────────────────────────────────────────────────────────

  it('redirects to /login for malformed token', () => {
    localStorage.setItem('token', 'not.a.valid.jwt.at.all');
    renderWithRouter(<ProtectedRoute><div>Secret</div></ProtectedRoute>);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('redirects to /login for completely garbage token', () => {
    localStorage.setItem('token', 'rubbish');
    renderWithRouter(<ProtectedRoute><div>Secret</div></ProtectedRoute>);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  // ── Valid token, no role requirement ────────────────────────────────────────

  it('renders children when valid token and no role required', () => {
    const valid = makeToken({ role: 'sponsor', exp: Math.floor(Date.now() / 1000) + 3600 });
    localStorage.setItem('token', valid);
    renderWithRouter(<ProtectedRoute><div>Protected Content</div></ProtectedRoute>);
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  // ── Correct role ─────────────────────────────────────────────────────────────

  it('renders children when role matches — admin', () => {
    const tok = makeToken({ role: 'admin', exp: Math.floor(Date.now() / 1000) + 3600 });
    localStorage.setItem('token', tok);
    renderWithRouter(
      <ProtectedRoute role="admin"><div>Admin Only</div></ProtectedRoute>
    );
    expect(screen.getByText('Admin Only')).toBeInTheDocument();
  });

  it('renders children when role matches — sponsor', () => {
    const tok = makeToken({ role: 'sponsor', exp: Math.floor(Date.now() / 1000) + 3600 });
    localStorage.setItem('token', tok);
    renderWithRouter(
      <ProtectedRoute role="sponsor"><div>Sponsor Only</div></ProtectedRoute>
    );
    expect(screen.getByText('Sponsor Only')).toBeInTheDocument();
  });

  it('renders children when role matches — influencer', () => {
    const tok = makeToken({ role: 'influencer', exp: Math.floor(Date.now() / 1000) + 3600 });
    localStorage.setItem('token', tok);
    renderWithRouter(
      <ProtectedRoute role="influencer"><div>Influencer Only</div></ProtectedRoute>
    );
    expect(screen.getByText('Influencer Only')).toBeInTheDocument();
  });

  // ── Wrong role redirects ─────────────────────────────────────────────────────

  it('redirects sponsor to sponsor home when trying admin route', () => {
    const tok = makeToken({ role: 'sponsor', exp: Math.floor(Date.now() / 1000) + 3600 });
    localStorage.setItem('token', tok);
    renderWithRouter(
      <ProtectedRoute role="admin"><div>Admin Only</div></ProtectedRoute>
    );
    expect(screen.queryByText('Admin Only')).not.toBeInTheDocument();
    expect(screen.getByText('Sponsor Home')).toBeInTheDocument();
  });

  it('redirects influencer to influencer dashboard when trying admin route', () => {
    const tok = makeToken({ role: 'influencer', exp: Math.floor(Date.now() / 1000) + 3600 });
    localStorage.setItem('token', tok);
    renderWithRouter(
      <ProtectedRoute role="admin"><div>Admin Only</div></ProtectedRoute>
    );
    expect(screen.getByText('Influencer Dashboard')).toBeInTheDocument();
  });

  it('redirects admin to admin dashboard when trying sponsor route', () => {
    const tok = makeToken({ role: 'admin', exp: Math.floor(Date.now() / 1000) + 3600 });
    localStorage.setItem('token', tok);
    renderWithRouter(
      <ProtectedRoute role="sponsor"><div>Sponsor Only</div></ProtectedRoute>
    );
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
  });

  // ── Non-expiring token (no exp claim) ────────────────────────────────────────

  it('treats token without exp as valid', () => {
    const tok = makeToken({ role: 'sponsor' }); // no exp
    localStorage.setItem('token', tok);
    renderWithRouter(
      <ProtectedRoute role="sponsor"><div>No Exp Content</div></ProtectedRoute>
    );
    expect(screen.getByText('No Exp Content')).toBeInTheDocument();
  });
});
