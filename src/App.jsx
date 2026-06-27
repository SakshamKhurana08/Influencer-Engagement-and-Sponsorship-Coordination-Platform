import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import About from "./Components/About";
import DeviceDisplay from "./Components/DeviceDisplay";
import SignUp from "./Components/SignUp";
import SignUpStep1 from "./signup/steps/SignUpStep1";
import SignUpStep2 from "./signup/steps/SignUpStep2";
import SignUpStep3 from "./signup/steps/SignUpStep3";
import SignUpLayout from "./signup/SignUpLayout";
import { SignUpProvider } from "./signup/SignUpContext";
import "./Components/index.css";
import LoginForm from "./Components/LoginForm";
import CloudLayout from "./Components/CloudLayout";
import AdminDashboard from "./Components/AdminDashboard";
import InfluencerDashboard from "./Components/InfluencerDashboard";
import SignUpSuccess from "./signup/steps/SignUpSuccess";
import DashboardLayout from "./Components/SponsorDashboard/DashboardLayout";
import SponsorHome from "./Components/SponsorDashboard/SponsorHome";
import Campaigns from "./Components/SponsorDashboard/Campaigns";
import Settings from "./Components/SponsorDashboard/Settings";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <CloudLayout>
        <DeviceDisplay />
      </CloudLayout>
    ),
  },
  {
    path: "/about",
    element: (
      <CloudLayout>
        <About />
      </CloudLayout>
    ),
  },
  {
    path: "/login",
    element: (
      <CloudLayout>
        <LoginForm />
      </CloudLayout>
    ),
  },
  {
    path: "/register",
    element: <SignUp />,
  },
  {
    path: "/signup",
    element: (
      <CloudLayout>
        <SignUpProvider>
          <SignUpLayout />
        </SignUpProvider>
      </CloudLayout>
    ),
    children: [
      { index: true, element: <Navigate to="/signup/step1" replace /> },
      { path: "step1", element: <SignUpStep1 /> },
      { path: "step2", element: <SignUpStep2 /> },
      { path: "step3", element: <SignUpStep3 /> },
    ],
  },
  {
    path: "/admin-dashboard",
    element: (
      <CloudLayout>
        <AdminDashboard />
      </CloudLayout>
    ),
  },
  {
    path: "/influencer/dashboard",
    element: (
      <CloudLayout>
        <InfluencerDashboard />
      </CloudLayout>
    ),
  },
  {
    path: "/signup-success",
    element: (<CloudLayout><SignUpSuccess /></CloudLayout>),
  },
  {
    path: "/sponsor-dashboard",
    element: (
        <DashboardLayout />
    ),
    children: [
      { path: "home", element: (<CloudLayout><SponsorHome /></CloudLayout>) },
      { path: "campaign", element: (<CloudLayout><Campaigns /></CloudLayout> )},
      { path: "settings", element: (<CloudLayout><Settings /></CloudLayout> )},
    ],
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
