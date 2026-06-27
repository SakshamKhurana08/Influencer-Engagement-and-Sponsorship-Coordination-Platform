/**
 * ProtectedRoute — wraps any route that requires authentication and/or a specific role.
 *
 * Usage in App.jsx:
 *   <ProtectedRoute role="admin">    → only admins can visit
 *   <ProtectedRoute role="sponsor">  → only sponsors
 *   <ProtectedRoute>                 → any logged-in user
 *
 * How it works:
 *   1. Reads the JWT from localStorage.
 *   2. Decodes the payload (no signature check — trust is enforced server-side).
 *   3. If no token or token expired → redirect to /login.
 *   4. If role mismatch → redirect to the user's own dashboard.
 */
import { Navigate } from 'react-router-dom';

/** Decode a JWT payload without verifying the signature. */
function decodeToken(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

/** Map a role to its default landing route. */
const ROLE_HOME = {
  admin: '/admin-dashboard',
  sponsor: '/sponsor-dashboard/home',
  influencer: '/influencer/dashboard',
};

export default function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem('token');

  // No token → go to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const payload = decodeToken(token);

  // Malformed or expired token → go to login
  if (!payload || (payload.exp && payload.exp * 1000 < Date.now())) {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    return <Navigate to="/login" replace />;
  }

  const userRole = payload.role;

  // Role mismatch → redirect to the user's own dashboard
  if (role && userRole !== role) {
    return <Navigate to={ROLE_HOME[userRole] || '/'} replace />;
  }

  return children;
}
