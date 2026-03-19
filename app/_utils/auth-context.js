"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";

const API_BASE = "http://localhost:8000";

const AuthContext = createContext({
  user: null,
  loading: true,
  role: null,
  isAllowed: false,
});

export function AuthContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [isAllowed, setIsAllowed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          credentials: "include",
        });

        if (!res.ok) {
          setUser(null);
          setRole(null);
          setIsAllowed(false);
          setLoading(false);
          return;
        }

        const data = await res.json();

        setUser({ email: data.email, uid: data.uid });
        setRole(data.role || "user");
        setIsAllowed(true);
      } catch (err) {
        setUser(null);
        setRole(null);
        setIsAllowed(false);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
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
    <AuthContext.Provider value={{ user, loading, role, isAllowed, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}