import { createContext, useContext, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * AuthContext manages login state for the whole app.
 * After a successful login, the user object is stored in localStorage so the session
 * survives a page refresh. The backend currently identifies users via an x-user header
 * for protected routes.
 */
export const AuthContext = createContext(null);

const STORAGE_KEY = 'wvs_current_user';

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  async function login(username, password) {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return {
          success: false,
          message: data.message || 'Login failed',
        };
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
      setCurrentUser(data.user);

      return {
        success: true,
        user: data.user,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Unable to connect to server',
      };
    }
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setCurrentUser(null);
  }

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}