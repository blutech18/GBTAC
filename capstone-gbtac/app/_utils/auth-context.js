"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

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
    const unsub = onAuthStateChanged(auth, async (u) => {
      setLoading(true);

      if (!u) {
        setUser(null);
        setRole(null);
        setIsAllowed(false);
        setLoading(false);
        return;
      }

      const email = (u.email || "").toLowerCase();

      try {
        const ref = doc(db, "allowedUsers", email);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          await signOut(auth);
          setUser(null);
          setRole(null);
          setIsAllowed(false);
          setLoading(false);
          return;
        }

        const data = snap.data();
        if (data.active !== true) {
          await signOut(auth);
          setUser(null);
          setRole(null);
          setIsAllowed(false);
          setLoading(false);
          return;
        }

        setUser(u);
        setRole(data.role || "user");
        setIsAllowed(true);
        setLoading(false);
      } catch (err) {
        await signOut(auth);
        setUser(null);
        setRole(null);
        setIsAllowed(false);
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, role, isAllowed }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
