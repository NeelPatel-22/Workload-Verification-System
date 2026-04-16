import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './ProtectedRoute';
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
import ImportData from './pages/admin/ImportData';

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

          <Route
            element={
              <ProtectedRoute allowedRoles={['staff', 'hod', 'hos', 'operations']}>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            {/* Staff routes */}
            <Route
              path="/staff/workload"
              element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <StaffWorkloadPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/queries"
              element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <StaffQueriesPage />
                </ProtectedRoute>
              }
            />

            {/* Head of Department routes */}
            <Route
              path="/hod/dashboard"
              element={
                <ProtectedRoute allowedRoles={['hod']}>
                  <HodDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hod/workload"
              element={
                <ProtectedRoute allowedRoles={['hod']}>
                  <DeptWorkloadPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hod/queries"
              element={
                <ProtectedRoute allowedRoles={['hod']}>
                  <ReviewQueriesPage />
                </ProtectedRoute>
              }
            />

            {/* Head of School / Operations routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['hos', 'operations']}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/workload"
              element={
                <ProtectedRoute allowedRoles={['hos', 'operations']}>
                  <SchoolWorkloadPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/queries"
              element={
                <ProtectedRoute allowedRoles={['hos', 'operations']}>
                  <AllQueriesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute allowedRoles={['hos', 'operations']}>
                  <ReportsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/importdata"
              element={
                <ProtectedRoute allowedRoles={['hos', 'operations']}>
                  <ImportData />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}