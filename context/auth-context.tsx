"use client";

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
  type UserCredential,
} from "firebase/auth";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { auth, googleAuthProvider } from "@/firebase";

type AuthContextValue = {
  user: User | null;
  initialLoading: boolean;
  loginWithEmailAndPassword: (
    email: string,
    password: string,
  ) => Promise<UserCredential>;
  registerWithEmailAndPassword: (
    email: string,
    password: string,
  ) => Promise<UserCredential>;
  googleSignIn: () => Promise<UserCredential>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setInitialLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const loginWithEmailAndPassword = (email: string, password: string) => {
      return signInWithEmailAndPassword(auth, email.trim(), password);
    };

    const registerWithEmailAndPassword = (email: string, password: string) => {
      return createUserWithEmailAndPassword(auth, email.trim(), password);
    };

    const googleSignIn = () => {
      return signInWithPopup(auth, googleAuthProvider);
    };

    const logout = async () => {
      await signOut(auth);
    };

    return {
      user,
      initialLoading,
      loginWithEmailAndPassword,
      registerWithEmailAndPassword,
      googleSignIn,
      logout,
    };
  }, [initialLoading, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}
