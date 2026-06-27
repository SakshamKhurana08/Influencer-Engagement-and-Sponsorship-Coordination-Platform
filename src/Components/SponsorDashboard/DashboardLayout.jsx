import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

export default function DashboardLayout() {
  return (
    <div className="is-page d-flex" style={{ minHeight: '100vh', overflowX: 'hidden' }}>
      <div className="is-page-orb-c" />
      <Sidebar />
      <main
        style={{
          marginLeft: 240,
          background: 'var(--bg-app)',
          minHeight: '100vh',
          width: 'calc(100% - 240px)',
          overflowY: 'auto',
          overflowX: 'hidden',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}
