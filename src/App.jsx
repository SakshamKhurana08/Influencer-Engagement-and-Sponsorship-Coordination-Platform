import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { ThemeProvider } from './theme/ThemeContext';
import { SignUpProvider } from './signup/SignUpContext';

import DeviceDisplay    from './Components/DeviceDisplay';
import About            from './Components/About';
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
  { path: '/admin-dashboard',   element: <AdminDashboard /> },
  { path: '/influencer/dashboard', element: <InfluencerDashboard /> },
  {
    path: '/sponsor-dashboard',
    element: <DashboardLayout />,
    children: [
      { path: 'home',     element: <SponsorHome /> },
      { path: 'campaign', element: <Campaigns /> },
      { path: 'settings', element: <Settings /> },
    ],
  },
]);

export default function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
