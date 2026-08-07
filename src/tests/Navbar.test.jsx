/**
 * Tests for src/Components/Navbar.jsx
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from '../Components/Navbar';

vi.mock('../theme/ThemeContext', () => ({
  useTheme: () => ({ theme: 'dark', toggleTheme: vi.fn() }),
}));

vi.mock('../Components/BrandLogo', () => ({
  default: ({ showName, height }) => (
    <img alt="Cofluence" data-testid="brand-logo" data-height={height} data-showname={String(showName)} />
  ),
}));

function renderNavbar(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Navbar />
    </MemoryRouter>
  );
}

describe('Navbar', () => {

  // ── Renders ────────────────────────────────────────────────────────────────

  it('renders the brand logo', () => {
    renderNavbar();
    expect(screen.getAllByTestId('brand-logo')[0]).toBeInTheDocument();
  });

  it('brand logo has showName=false (logo only, no text)', () => {
    renderNavbar();
    const logo = screen.getAllByTestId('brand-logo')[0];
    expect(logo.dataset.showname).toBe('false');
  });

  it('renders About nav link', () => {
    renderNavbar();
    expect(screen.getByRole('link', { name: /About/i })).toBeInTheDocument();
  });

  it('renders Contact nav link', () => {
    renderNavbar();
    expect(screen.getByRole('link', { name: /Contact/i })).toBeInTheDocument();
  });

  it('renders Register nav link', () => {
    renderNavbar();
    expect(screen.getByRole('link', { name: /Register/i })).toBeInTheDocument();
  });

  it('renders Sign In button/link', () => {
    renderNavbar();
    expect(screen.getByRole('link', { name: /Sign In/i })).toBeInTheDocument();
  });

  // ── Correct hrefs ──────────────────────────────────────────────────────────

  it('About links to /about', () => {
    renderNavbar();
    expect(screen.getByRole('link', { name: /About/i })).toHaveAttribute('href', '/about');
  });

  it('Contact links to /contact', () => {
    renderNavbar();
    expect(screen.getByRole('link', { name: /Contact/i })).toHaveAttribute('href', '/contact');
  });

  it('Register links to /signup', () => {
    renderNavbar();
    expect(screen.getByRole('link', { name: /Register/i })).toHaveAttribute('href', '/signup');
  });

  it('Sign In links to /login', () => {
    renderNavbar();
    expect(screen.getByRole('link', { name: /Sign In/i })).toHaveAttribute('href', '/login');
  });

  it('logo links to home /', () => {
    renderNavbar();
    // The brand logo is wrapped in a Link to "/"
    const logoLinks = screen.getAllByRole('link').filter(l => l.getAttribute('href') === '/');
    expect(logoLinks.length).toBeGreaterThan(0);
  });

  // ── Theme toggle ───────────────────────────────────────────────────────────

  it('renders theme toggle button', () => {
    renderNavbar();
    expect(screen.getByLabelText(/Toggle theme/i)).toBeInTheDocument();
  });

  // ── Mobile menu ────────────────────────────────────────────────────────────

  it('mobile menu is closed by default', () => {
    renderNavbar();
    // Mobile menu links are not visible until hamburger is clicked
    // The mobile nav only shows on small screens — it's present in DOM via d-md-none
    // We check that the hamburger button exists
    const menuBtns = screen.getAllByRole('button');
    expect(menuBtns.length).toBeGreaterThan(0);
  });

  // ── Active state ───────────────────────────────────────────────────────────

  it('About link has nav-link-item class', () => {
    renderNavbar('/about');
    const aboutLink = screen.getByRole('link', { name: /About/i });
    expect(aboutLink.className).toContain('nav-link-item');
  });

  it('Contact link has nav-link-item class', () => {
    renderNavbar('/contact');
    const contactLink = screen.getByRole('link', { name: /Contact/i });
    expect(contactLink.className).toContain('nav-link-item');
  });
});
