import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ProtectedRoute from '../ProtectedRoute';

function renderWithAuth(user, allowedRoles) {
  return render(
    <MemoryRouter initialEntries={['/protected']}>
      <AuthContext.Provider value={{ currentUser: user }}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/staff/workload" element={<div>Staff Home</div>} />
          <Route path="/hod/dashboard" element={<div>HoD Home</div>} />
          <Route path="/admin/dashboard" element={<div>Admin Home</div>} />
          <Route
            path="/protected"
            element={
              <ProtectedRoute allowedRoles={allowedRoles}>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthContext.Provider>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  it('redirects to /login when no user is logged in', () => {
    renderWithAuth(null, ['staff']);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('redirects a staff user to their home when role is not allowed', () => {
    renderWithAuth({ role: 'staff' }, ['hod']);
    expect(screen.getByText('Staff Home')).toBeInTheDocument();
  });

  it('redirects a hod user to their home when role is not allowed', () => {
    renderWithAuth({ role: 'hod' }, ['staff']);
    expect(screen.getByText('HoD Home')).toBeInTheDocument();
  });

  it('redirects a hos user to admin home when role is not allowed', () => {
    renderWithAuth({ role: 'hos' }, ['staff']);
    expect(screen.getByText('Admin Home')).toBeInTheDocument();
  });

  it('renders children when user role is allowed', () => {
    renderWithAuth({ role: 'staff' }, ['staff']);
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('renders children when multiple roles are allowed and user matches one', () => {
    renderWithAuth({ role: 'hod' }, ['hod', 'hos', 'operations']);
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
