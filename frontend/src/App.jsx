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
import ImportData from './pages/admin/ImportData';

import ProtectedRoute from './routes/ProtectedRoute';

//redirect user to their dashboard after login
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

          {/*routes accessed by every users*/}
          <Route path="/login" element={<LoginPage />} />

          {/*root redirect*/}
          <Route path="/" element={<RootRedirect />} />

          {/*layout wrapper for logged-in users*/}
          <Route element={<AppLayout />}>

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
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />

            <Route 
              path="/admin/workload"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <SchoolWorkloadPage />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/admin/queries"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AllQueriesPage />
                </ProtectedRoute>
              }
            />

            <Route 
              path="/admin/reports"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ReportsPage />                
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/admin/importdata"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
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
