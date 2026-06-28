import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

/**
 * Sponsor dashboard shell — fixed sidebar + fluid main content.
 * The sidebar is position:fixed so .is-dash-main's margin-left handles the offset.
 * We do NOT use d-flex on the page wrapper; is-dash-main stretches to fill the rest.
 */
export default function DashboardLayout() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-app)',
      position: 'relative',
      isolation: 'isolate',
      /* overflow must NOT be hidden — main content needs to scroll */
    }}>
      {/* Ambient orbs */}
      <div style={{ position:'fixed', width:700, height:700, top:'-200px', left:'-200px', background:'radial-gradient(circle,rgba(91,88,235,0.18) 0%,transparent 68%)', filter:'blur(120px)', pointerEvents:'none', zIndex:0 }} aria-hidden="true" />
      <div style={{ position:'fixed', width:600, height:600, bottom:'-180px', right:'-180px', background:'radial-gradient(circle,rgba(187,99,255,0.13) 0%,transparent 68%)', filter:'blur(120px)', pointerEvents:'none', zIndex:0 }} aria-hidden="true" />

      <Sidebar />

      <main className="is-dash-main" style={{ position:'relative', zIndex:1 }}>
        <Outlet />
      </main>
    </div>
  );
}
