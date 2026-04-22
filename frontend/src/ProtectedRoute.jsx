import { Navigate } from 'react-router-dom';
import { useAuth } from "./context/AuthContext";

/**
 * Route guard component that enforces role-based access control (RBAC).
 *
 * Props:
 * - allowedRoles: string[] — list of roles permitted to access this route
 * - children: ReactNode — the page component to render if access is granted
 *
 * Behaviour:
 * - Not logged in → redirect to /login
 * - Logged in but wrong role → redirect to the user's own default page
 *   (prevents staff from manually navigating to /admin/... routes, for example)
 * - Correct role → render children
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