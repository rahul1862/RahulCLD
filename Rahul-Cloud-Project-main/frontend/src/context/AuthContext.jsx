import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { authService, getToken, setToken as persistToken } from "../services/api";

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => getToken());
  const [user, setUser] = useState(null);
  // Only "loading" if we start with a token we still need to validate on refresh.
  const [loading, setLoading] = useState(() => !!getToken());

  const apply = useCallback((nextToken, nextUser = null) => {
    persistToken(nextToken);
    setTokenState(nextToken);
    setUser(nextUser);
  }, []);

  const login = useCallback(
    async (email, password) => {
      const { token: t, user: u } = await authService.login(email, password);
      apply(t, u);
      return u;
    },
    [apply]
  );

  const register = useCallback(
    async (email, password) => {
      const { token: t, user: u } = await authService.register(email, password);
      apply(t, u);
      return u;
    },
    [apply]
  );

  const logout = useCallback(() => apply(null, null), [apply]);

  // On first mount, if a token was persisted, confirm it's still valid.
  useEffect(() => {
    let active = true;
    if (!getToken()) {
      setLoading(false);
      return;
    }
    authService
      .me()
      .then((data) => active && setUser(data.user))
      .catch(() => active && apply(null, null)) // invalid/expired token — clear it
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [apply]);

  // The axios interceptor emits this on any 401 — reflect the logout in state.
  useEffect(() => {
    const onUnauthorized = () => {
      setTokenState(null);
      setUser(null);
    };
    window.addEventListener("auth:unauthorized", onUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", onUnauthorized);
  }, []);

  return (
    <Ctx.Provider value={{ token, user, loading, isAuthenticated: !!token, login, register, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
