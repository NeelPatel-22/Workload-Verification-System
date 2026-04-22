import { createContext, useContext, useState } from 'react';

/**
 * AuthContext provides global authentication state across the app.
 * Exposes: currentUser, login(), logout()
 *
 * currentUser shape (set after successful login):
 * { id, username, name, role, department, staffId }
 *
 * User session is persisted in localStorage so the user stays logged in on page refresh.
 * Note: auth is currently localStorage-based (no JWT tokens); backend uses x-user header for identity.
 */
const AuthContext = createContext(null);

const STORAGE_KEY = 'wvs_current_user';

export function AuthProvider({ children }) {
  // Initialise from localStorage so session survives page refresh
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Sends credentials to the backend; on success, saves user to state and localStorage
  async function login(username, password) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
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

  // Clears session from both state and localStorage
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