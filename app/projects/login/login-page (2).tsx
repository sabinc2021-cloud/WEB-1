"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "../../lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function signIn() {
    setMessage("");

    if (!email.trim() || !password) {
      setMessage("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const supabase = db();

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      router.push("/dashboard");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to sign in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login">
      <div className="loginbox">
        <div className="eyebrow">Cloud Construction Platform</div>
        <h1>LPS Command Center</h1>
        <p className="muted">Last Planner System for construction teams.</p>

        {message && <div className="msg">{message}</div>}

        <div className="form">
          <div className="field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div className="field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          <div className="actions">
            <button
              type="button"
              className="btn"
              onClick={signIn}
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>

            <button
              type="button"
              className="btn secondary"
              onClick={() => router.push("/create-account")}
              disabled={loading}
            >
              Create an Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
