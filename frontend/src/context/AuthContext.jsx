import { createContext, useContext, useState } from 'react';
import { MOCK_USERS } from '../mock/mockData';

const AuthContext = createContext(null);

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

  function login(username, password) {
    const user = MOCK_USERS.find(
      (u) => u.username === username && u.password === password
    );
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      setCurrentUser(user);
      return { success: true, user };
    }
    return { success: false };
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
