import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../services/api";

const TOKEN_KEY = "scholarhub-auth-token";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => window.localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setIsLoading(false);
        return;
      }

      if (user) {
        setIsLoading(false);
        return;
      }

      try {
        const currentUser = await api.me(token);
        setUser(currentUser);
      } catch (error) {
        window.localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, [token, user]);

  async function handleAuth(action) {
    const response = await action();
    window.localStorage.setItem(TOKEN_KEY, response.token);
    setToken(response.token);
    setUser(response.user);
    return response.user;
  }

  function logout() {
    window.localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isLoading,
        isAuthenticated: Boolean(token && user),
        login: (payload) => handleAuth(() => api.login(payload)),
        register: (payload) => api.register(payload),
        logout,
        refreshUser: async () => {
          if (!token) {
            return null;
          }

          const currentUser = await api.me(token);
          setUser(currentUser);
          return currentUser;
        },
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
