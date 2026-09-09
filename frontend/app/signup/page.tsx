"use client";

import { FormEvent, useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";

export const API_URL =
  process.env.NODE_ENV === "development" ? "http://localhost:5000" : "";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  //const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  async function handleSignup(e: FormEvent) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      // 1. Create Firebase Auth user
      const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // 2. Get ID token
      const token = await credential.user.getIdToken();

      // 3. Ask backend to create Firestore user profile
      const response = await fetch(`${API_URL}/api/register`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();

        throw new Error(data.message || "Unable to create user profile");
      }

      // 4. Go to dashboard
      window.location.href = "/dashboard";
    } catch (err) {
      console.error(err);

      setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto mt-20 max-w-md p-6">
      <h1 className="mb-6 text-3xl font-bold">Create Account</h1>

      {error && (
        <div className="mb-4 rounded bg-red-100 p-3 text-red-700">{error}</div>
      )}

      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label className="mb-1 block">Email</label>

          <input
            required
            type="email"
            className="w-full rounded border p-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block">Password</label>

          <input
            required
            type="password"
            minLength={6}
            className="w-full rounded border p-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-blue-600 p-2 text-white disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>
      </form>

      <p className="mt-4 text-sm">
        Already have an account?{" "}
        <a href="/login" className="text-blue-600 underline">
          Sign in
        </a>
      </p>
    </main>
  );
}
