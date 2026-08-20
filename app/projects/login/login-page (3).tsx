"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              disabled={loading}
              onKeyDown={(event) => event.key === "Enter" && signIn()}
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={loading}
              onKeyDown={(event) => event.key === "Enter" && signIn()}
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
          </div>

          <div className="auth-switch">
            <span className="muted">Don&apos;t have an account?</span>{" "}
            <Link href="/signup" className="btn secondary">
              Create an Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
