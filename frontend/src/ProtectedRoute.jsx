import { Navigate } from 'react-router-dom';
import { useAuth } from "./context/AuthContext";

/**
 * Wraps a route to check if the current user is allowed in.
 * If not logged in, sends to /login.
 * If logged in but the wrong role (e.g. a staff member trying to access /admin/...),
 * redirects to their own default page instead of showing an error.
 */
export default function ProtectedRoute({ allowedRoles, children }) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(currentUser.role)) {
    const roleDefaults = {
      staff: '/staff/workload',
      hod: '/hod/dashboard',
      hos: '/admin/dashboard',
      operations: '/admin/dashboard',
    };

    return <Navigate to={roleDefaults[currentUser.role] || '/login'} replace />;
  }

  return children;
}