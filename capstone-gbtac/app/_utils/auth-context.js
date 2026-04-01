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

export function AuthContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [isAllowed, setIsAllowed] = useState(false);
  const [loading, setLoading] = useState(true);

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

export function useAuth() {
  return useContext(AuthContext);
}