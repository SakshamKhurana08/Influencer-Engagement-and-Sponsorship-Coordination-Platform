import { createBrowserRouter, RouterProvider, Navigate, Link } from 'react-router-dom';
import { ThemeProvider } from './theme/ThemeContext';
import { SignUpProvider } from './signup/SignUpContext';
import ProtectedRoute from './Components/ProtectedRoute';

import DeviceDisplay    from './Components/DeviceDisplay';
import About            from './Components/About';
import Contact          from './Components/Contact';
import LoginForm        from './Components/LoginForm';
import SignUpLayout     from './signup/SignUpLayout';
import SignUpStep1      from './signup/steps/SignUpStep1';
import SignUpStep2      from './signup/steps/SignUpStep2';
import SignUpStep3      from './signup/steps/SignUpStep3';
import SignUpSuccess    from './signup/steps/SignUpSuccess';
import AdminDashboard   from './Components/AdminDashboard';
import InfluencerDashboard from './Components/InfluencerDashboard';
import DashboardLayout  from './Components/SponsorDashboard/DashboardLayout';
import SponsorHome      from './Components/SponsorDashboard/SponsorHome';
import Campaigns        from './Components/SponsorDashboard/Campaigns';
import Settings         from './Components/SponsorDashboard/Settings';

const router = createBrowserRouter([
  { path: '/',                  element: <DeviceDisplay /> },
  { path: '/about',             element: <About /> },
  { path: '/contact',           element: <Contact /> },
  { path: '/login',             element: <LoginForm /> },
  {
    path: '/signup',
    element: (
      <SignUpProvider>
        <SignUpLayout />
      </SignUpProvider>
    ),
    children: [
      { index: true,    element: <Navigate to="/signup/step1" replace /> },
      { path: 'step1',  element: <SignUpStep1 /> },
      { path: 'step2',  element: <SignUpStep2 /> },
      { path: 'step3',  element: <SignUpStep3 /> },
    ],
  },
  { path: '/signup-success',    element: <SignUpSuccess /> },
  {
    path: '/admin-dashboard',
    element: (
      <ProtectedRoute role="admin">
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/influencer/dashboard',
    element: (
      <ProtectedRoute role="influencer">
        <InfluencerDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/sponsor-dashboard',
    element: (
      <ProtectedRoute role="sponsor">
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'home',     element: <SponsorHome /> },
      { path: 'campaign', element: <Campaigns /> },
      { path: 'settings', element: <Settings /> },
    ],
  },
  {
    path: '*',
    element: (
      <div className="is-page d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', padding: 24, textAlign: 'center' }}>
        <div className="is-page-orb-c" aria-hidden="true" />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p className="display-brand is-gradient-text" style={{ fontSize: '5rem', fontWeight: 900, lineHeight: 1 }}>404</p>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 28, fontSize: '1rem' }}>This page doesn't exist.</p>
          <Link to="/" className="is-btn is-btn-brand text-decoration-none">Go Home</Link>
        </div>
      </div>
    ),
  },
]);

export default function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
