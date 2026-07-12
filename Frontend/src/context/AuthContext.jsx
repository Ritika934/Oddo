import { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../api/auth.api';
import { TOKEN_KEY, USER_KEY } from '../utils/constants';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem(USER_KEY);
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  }, [user]);

  // Real login — expects backend running at VITE_API_URL.
  const login = async ({ email, password }) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await authApi.login({ email, password });
      const token = data?.token;
      const loggedInUser = data?.user
        ? { ...data.user, name: data.user.full_name || data.user.name }
        : null;

      if (!token || !loggedInUser) {
        throw new Error(data?.message || 'Invalid login response from server.');
      }

      localStorage.setItem(TOKEN_KEY, token);
      setUser(loggedInUser);
      return loggedInUser;
    } catch (err) {
      const message = err?.response?.data?.message || err.message || 'Unable to reach the server. Try demo mode below.';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Demo login — lets the UI be reviewed before the backend is wired up (Phase 14).
  const loginAsDemo = (role, name = 'Demo User') => {
    const demoUser = { id: 'demo-' + role, name, email: `${role}@transitops.demo`, role };
    localStorage.setItem(TOKEN_KEY, 'demo-token');
    setUser(demoUser);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, loginAsDemo, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
