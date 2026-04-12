"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";

const AuthContext = createContext({
  user: null,
  loading: true,
  role: null,
  isAllowed: false,
  logout: async () => {},
  refreshSession: async () => {},
  refreshSlidingSession: async () => {},
});

/**
 * AuthContextProvider
 *
 * Provides authenticated session state and auth-related helpers to the rest
 * of the application. It loads the current session on app startup, exposes
 * logout functionality, and supports both standard session refresh and sliding-session renewal.
 *
 * @param {React.ReactNode} children - Components rendered inside the auth context provider
 *
 * Notes:
 * - Session truth is determined by the backend cookie session, not Firebase alone.
 * - refreshSession loads the current user profile from the backend and updates local auth state.
 * - refreshSlidingSession renews the existing backend session using a fresh Firebase ID token.
 *
 * @returns The auth context provider wrapping the application
 *
 * @author Anna Isabelle Yabut
 */

export function AuthContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [isAllowed, setIsAllowed] = useState(false);
  const [loading, setLoading] = useState(true);

  /**
   * refreshSession
   *
   * Fetches the current authenticated session from the backend and updates
   * the shared auth state with the returned user and role data.
   *
   * @returns {Promise<boolean>} True when the session is valid, otherwise false
   *
   * Notes:
   * - Clears local auth state when the backend session is missing or invalid.
   * - Uses credentials: "include" so the session cookie is sent with the request.
   */
  const refreshSession = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        credentials: "include",
      });

      if (!res.ok) {
        setUser(null);
        setRole(null);
        setIsAllowed(false);
        return false;
      }

      const data = await res.json();

      setUser({ email: data.email, uid: data.uid });
      setRole(data.role || "user");
      setIsAllowed(true);
      return true;
    } catch {
      setUser(null);
      setRole(null);
      setIsAllowed(false);
      return false;
    }
  };

  /**
   * refreshSlidingSession
   *
   * Renews the backend session before it expires by sending a fresh Firebase
   * ID token to the backend refresh endpoint.
   *
   * @returns {Promise<boolean>} True when the session refresh succeeds, otherwise false
   *
   * Notes:
   * - Returns false immediately when there is no current Firebase user.
   * - Clears local auth state when the refresh request fails or the backend rejects the token.
   * - This is intended for background session extension during active use, not initial session loading.
   */
  const refreshSlidingSession = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return false;

      const idToken = await currentUser.getIdToken(true);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-session`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!res.ok) {
        setUser(null);
        setRole(null);
        setIsAllowed(false);
        return false;
      }

      return true;
    } catch {
      setUser(null);
      setRole(null);
      setIsAllowed(false);
      return false;
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        await refreshSession();
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  /**
   * logout
   *
   * Ends the current authenticated session on both the backend and Firebase,
   * then clears the local auth state stored in context.
   *
   * @returns {Promise<void>} Resolves after logout cleanup completes
   *
   * Notes:
   * - The backend logout request is attempted first so the session cookie is invalidated even if Firebase sign-out succeeds separately.
   * - Backend logout failures are intentionally ignored so client-side sign-out still proceeds.
   */
  const logout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {}

    await signOut(auth);

    setUser(null);
    setRole(null);
    setIsAllowed(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        role,
        isAllowed,
        logout,
        refreshSession,
        refreshSlidingSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth
 *
 * Returns the shared authentication context so components can read auth state
 * and call auth helper functions.
 *
 * @returns The current auth context value
 *
 * Notes:
 * - Must be used within AuthContextProvider.
 */
export function useAuth() {
  return useContext(AuthContext);
}