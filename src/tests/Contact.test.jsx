/**
 * Tests for src/Components/Contact.jsx
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Contact from '../Components/Contact';

vi.mock('../Components/Navbar', () => ({ default: () => <nav data-testid="navbar" /> }));
vi.mock('../theme/ThemeContext', () => ({
  useTheme: () => ({ theme: 'dark', toggleTheme: () => {} }),
}));
vi.mock('../Components/BrandLogo', () => ({
  default: ({ showName }) => <img alt="Cofluence" data-testid="brand-logo" />,
}));

function renderContact() {
  return render(<MemoryRouter><Contact /></MemoryRouter>);
}

describe('Contact', () => {

  // ── Layout ─────────────────────────────────────────────────────────────────

  it('renders the page heading', () => {
    renderContact();
    expect(screen.getByText(/We'd love to/i)).toBeInTheDocument();
  });

  it('renders "hear from you" gradient text', () => {
    renderContact();
    expect(screen.getByText(/hear from you/i)).toBeInTheDocument();
  });

  it('renders Back to Home link pointing to /', () => {
    renderContact();
    const link = screen.getByRole('link', { name: /Home/i });
    expect(link).toHaveAttribute('href', '/');
  });

  it('renders the Navbar', () => {
    renderContact();
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
  });

  // ── Contact info cards ─────────────────────────────────────────────────────

  it('renders Email contact info', () => {
    renderContact();
    expect(screen.getByText(/support@cofluence\.dev/i)).toBeInTheDocument();
  });

  it('Email is a mailto: link', () => {
    renderContact();
    const link = screen.getByRole('link', { name: /support@cofluence\.dev/i });
    expect(link).toHaveAttribute('href', 'mailto:support@cofluence.dev');
  });

  it('renders Location info', () => {
    renderContact();
    expect(screen.getByText(/New Delhi/i)).toBeInTheDocument();
  });

  it('renders Response Time info', () => {
    renderContact();
    expect(screen.getByText(/24 hours/i)).toBeInTheDocument();
  });

  // ── Form fields ────────────────────────────────────────────────────────────

  it('renders Full Name input', () => {
    renderContact();
    expect(screen.getByPlaceholderText('Jane Smith')).toBeInTheDocument();
  });

  it('renders Email input', () => {
    renderContact();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
  });

  it('renders Subject input', () => {
    renderContact();
    expect(screen.getByPlaceholderText(/Campaign enquiry/i)).toBeInTheDocument();
  });

  it('renders Message textarea', () => {
    renderContact();
    expect(screen.getByPlaceholderText(/Describe your question/i)).toBeInTheDocument();
  });

  it('renders Send Message button', () => {
    renderContact();
    expect(screen.getByRole('button', { name: /Send Message/i })).toBeInTheDocument();
  });

  // ── Validation ─────────────────────────────────────────────────────────────

  it('shows error banner when required fields missing on submit', async () => {
    renderContact();
    fireEvent.click(screen.getByRole('button', { name: /Send Message/i }));
    await waitFor(() => {
      expect(screen.getByText(/Please fill in your name/i)).toBeInTheDocument();
    });
  });

  it('does not show success when fields are empty', async () => {
    renderContact();
    fireEvent.click(screen.getByRole('button', { name: /Send Message/i }));
    await waitFor(() => {
      expect(screen.queryByText(/Message sent/i)).not.toBeInTheDocument();
    });
  });

  it('shows error when only name is filled', async () => {
    renderContact();
    await userEvent.type(screen.getByPlaceholderText('Jane Smith'), 'John');
    fireEvent.click(screen.getByRole('button', { name: /Send Message/i }));
    await waitFor(() => expect(screen.getByText(/Please fill in your name/i)).toBeInTheDocument());
  });

  // ── Successful submission ──────────────────────────────────────────────────

  it('shows success banner after filling all required fields and submitting', async () => {
    renderContact();
    fireEvent.change(screen.getByPlaceholderText('Jane Smith'), { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'jane@test.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Describe your question/i), { target: { value: 'Hello there' } });
    fireEvent.click(screen.getByRole('button', { name: /Send Message/i }));
    await waitFor(() => expect(screen.getByText(/Message sent/i)).toBeInTheDocument(), { timeout: 3000 });
  });

  it('clears form after successful submission', async () => {
    renderContact();
    const nameInput = screen.getByPlaceholderText('Jane Smith');
    fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'jane@test.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Describe your question/i), { target: { value: 'Hello' } });
    fireEvent.click(screen.getByRole('button', { name: /Send Message/i }));
    await waitFor(() => expect(nameInput.value).toBe(''), { timeout: 3000 });
  });

  it('disables Send button while sending', async () => {
    renderContact();
    fireEvent.change(screen.getByPlaceholderText('Jane Smith'), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'jane@test.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Describe your question/i), { target: { value: 'Hi' } });
    fireEvent.click(screen.getByRole('button', { name: /Send Message/i }));
    // Immediately after click, button should show Sending… and be disabled
    expect(screen.getByRole('button', { name: /Sending/i })).toBeDisabled();
    // Wait for it to resolve
    await waitFor(() => expect(screen.getByText(/Message sent/i)).toBeInTheDocument(), { timeout: 3000 });
  });

  // ── Subject is optional ────────────────────────────────────────────────────

  it('submits successfully without subject', async () => {
    renderContact();
    fireEvent.change(screen.getByPlaceholderText('Jane Smith'), { target: { value: 'No Subject User' } });
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'ns@test.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Describe your question/i), { target: { value: 'No subject needed' } });
    fireEvent.click(screen.getByRole('button', { name: /Send Message/i }));
    await waitFor(() => expect(screen.getByText(/Message sent/i)).toBeInTheDocument(), { timeout: 3000 });
  });
});
