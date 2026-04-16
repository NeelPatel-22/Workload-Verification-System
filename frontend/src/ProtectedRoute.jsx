import { Navigate } from 'react-router-dom';
import { useAuth } from "./context/AuthContext";

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