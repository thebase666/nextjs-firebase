"use client";

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { useEffect, useState } from "react";
import { auth, googleAuthProvider } from "@/firebase";

type AuthMode = "login" | "register";

export function EmailAuthPanel() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setInitialLoading(false);
    });

    return unsubscribe;
  }, []);

  const resetFormError = () => {
    setErrorMessage(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetFormError();
    setPending(true);

    try {
      if (mode === "register") {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
      setPassword("");
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Authentication failed. Please try again.");
      }
    } finally {
      setPending(false);
    }
  };

  const handleSignOut = async () => {
    resetFormError();
    setPending(true);
    try {
      await signOut(auth);
    } catch {
      setErrorMessage("Sign-out failed. Please try again.");
    } finally {
      setPending(false);
    }
  };

  const handleGoogleSignIn = async () => {
    resetFormError();
    setPending(true);

    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Google sign-in failed. Please try again.");
      }
    } finally {
      setPending(false);
    }
  };

  if (initialLoading) {
    return <p className="text-sm text-neutral-500">Checking authentication status...</p>;
  }

  if (user) {
    return (
      <div className="space-y-3 rounded-xl border border-neutral-200 p-5 shadow-sm">
        <p className="text-sm text-neutral-600">Currently signed in</p>
        <p className="font-medium">{user.email ?? "No email available"}</p>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={pending}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Processing..." : "Sign out"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-neutral-200 p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`rounded-md px-3 py-1.5 text-sm ${
            mode === "login" ? "bg-blue-600 text-white" : "bg-neutral-100 text-neutral-700"
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => setMode("register")}
          className={`rounded-md px-3 py-1.5 text-sm ${
            mode === "register" ? "bg-blue-600 text-white" : "bg-neutral-100 text-neutral-700"
          }`}
        >
          Register
        </button>
      </div>

      <form className="space-y-3" onSubmit={handleSubmit}>
        <div className="space-y-1">
          <label className="block text-sm text-neutral-600" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2"
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm text-neutral-600" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete={mode === "register" ? "new-password" : "current-password"}
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2"
            placeholder="At least 6 characters"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Processing..." : mode === "register" ? "Create account" : "Sign in with email"}
        </button>
      </form>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-neutral-200" />
        <span className="text-xs uppercase tracking-wide text-neutral-500">or</span>
        <div className="h-px flex-1 bg-neutral-200" />
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={pending}
        className="w-full rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Processing..." : "Continue with Google"}
      </button>

      {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}
    </div>
  );
}
