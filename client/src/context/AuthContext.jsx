import { createContext, useState, useEffect } from 'react';
import { loginUser, logoutUser, registerPatient, getCurrentUser } from '../api/authApi';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while restoring session on load

  // Restore session on app mount (checks httpOnly cookie via /auth/me)
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const res = await getCurrentUser();
        setUser(res.data);
      } catch (err) {
        setUser(null); // no valid session — expected for logged-out users
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = async (credentials) => {
    const res = await loginUser(credentials);
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (data) => {
    const res = await registerPatient(data);
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  const value = {
    user,
    role: user?.role || null,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};