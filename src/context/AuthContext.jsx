import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(() => localStorage.getItem('crm_token'));
  const [isLoading, setIsLoading] = useState(true); // true until we've validated the token

  // ── Validate token on first mount ─────────────────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem('crm_token');
    if (!stored) {
      setIsLoading(false);
      return;
    }
    // Verify the stored token is still valid
    client
      .get('/auth/me')
      .then((res) => {
        setUser(res.user);
        setToken(stored);
      })
      .catch(() => {
        // Token invalid / expired — clear it
        localStorage.removeItem('crm_token');
        setToken(null);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // ── login: called after successful register or login API call ─────────────
  const login = useCallback((newToken, newUser) => {
    localStorage.setItem('crm_token', newToken);
    setToken(newToken);
    setUser(newUser);
  }, []);

  // ── updateUser: update user in context after profile edit ─────────────────
  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
  }, []);

  // ── logout: clear everything ───────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('crm_token');
    setToken(null);
    setUser(null);
  }, []);

  const value = { user, token, isLoading, login, logout, updateUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Convenience hook
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
