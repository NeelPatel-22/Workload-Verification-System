import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './layouts/AppLayout';
import LoginPage from './pages/LoginPage';
import StaffWorkloadPage from './pages/staff/WorkloadPage';
import StaffQueriesPage from './pages/staff/QueriesPage';
import HodDashboardPage from './pages/hod/DashboardPage';
import DeptWorkloadPage from './pages/hod/DeptWorkloadPage';
import ReviewQueriesPage from './pages/hod/ReviewQueriesPage';
import AdminDashboardPage from './pages/admin/DashboardPage';
import SchoolWorkloadPage from './pages/admin/SchoolWorkloadPage';
import AllQueriesPage from './pages/admin/AllQueriesPage';
import ReportsPage from './pages/admin/ReportsPage';

function RootRedirect() {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  const roleDefaults = {
    staff: '/staff/workload',
    hod: '/hod/dashboard',
    hos: '/admin/dashboard',
    operations: '/admin/dashboard',
  };
  return <Navigate to={roleDefaults[currentUser.role] || '/login'} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<RootRedirect />} />

          <Route element={<AppLayout />}>
            {/* Staff routes */}
            <Route path="/staff/workload" element={<StaffWorkloadPage />} />
            <Route path="/staff/queries" element={<StaffQueriesPage />} />

            {/* Head of Department routes */}
            <Route path="/hod/dashboard" element={<HodDashboardPage />} />
            <Route path="/hod/workload" element={<DeptWorkloadPage />} />
            <Route path="/hod/queries" element={<ReviewQueriesPage />} />

            {/* Head of School / Operations routes */}
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/workload" element={<SchoolWorkloadPage />} />
            <Route path="/admin/queries" element={<AllQueriesPage />} />
            <Route path="/admin/reports" element={<ReportsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
