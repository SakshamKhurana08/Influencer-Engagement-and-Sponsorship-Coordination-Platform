import { Outlet } from 'react-router-dom';
import Sidebar from '../SponsorDashboard/Sidebar';

export default function InfluencerLayout() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <Sidebar />
      <main className="is-dash-main">
        <Outlet />
      </main>
    </div>
  );
}
