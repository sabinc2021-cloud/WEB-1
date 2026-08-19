"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "../../lib/supabase";

export default function Login() {
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [e, setE] = useState("");
  const [p, setP] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [m, setM] = useState("");
  const [loading, setLoading] = useState(false);

  const r = useRouter();

  function switchMode() {
    setIsCreatingAccount((current) => !current);
    setM("");
    setP("");
    setConfirmPassword("");
  }

  async function signIn() {
    setM("");

    if (!e.trim() || !p) {
      setM("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const s = db();
      const { error } = await s.auth.signInWithPassword({
        email: e.trim(),
        password: p,
      });

      if (error) {
        setM(error.message);
        return;
      }

      r.push("/dashboard");
    } catch (error) {
      setM(
        error instanceof Error
          ? error.message
          : "Unable to sign in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function createAccount() {
    setM("");

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !e.trim() ||
      !p ||
      !confirmPassword
    ) {
      setM("Please complete all fields.");
      return;
    }

    if (p !== confirmPassword) {
      setM("Passwords do not match.");
      return;
    }

    if (p.length < 6) {
      setM("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const s = db();

      const { error } = await s.auth.signUp({
        email: e.trim(),
        password: p,
        options: {
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
          },
        },
      });

      if (error) {
        setM(error.message);
        return;
      }

      setM(
        "Account created successfully. Check your email if email confirmation is enabled."
      );
      setP("");
      setConfirmPassword("");
    } catch (error) {
      setM(
        error instanceof Error
          ? error.message
          : "Unable to create your account. Please try again."
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

        <p className="muted">
          {isCreatingAccount
            ? "Create your account to get started."
            : "Last Planner System for construction teams."}
        </p>

        {m && <div className="msg">{m}</div>}

        <div className="form">
          {isCreatingAccount && (
            <>
              <div className="field">
                <label htmlFor="first-name">First Name</label>
                <input
                  id="first-name"
                  type="text"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  placeholder="First name"
                  autoComplete="given-name"
                  disabled={loading}
                />
              </div>

              <div className="field">
                <label htmlFor="last-name">Last Name</label>
                <input
                  id="last-name"
                  type="text"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  placeholder="Last name"
                  autoComplete="family-name"
                  disabled={loading}
                />
              </div>
            </>
          )}

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={e}
              onChange={(event) => setE(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={p}
              onChange={(event) => setP(event.target.value)}
              placeholder="Enter your password"
              autoComplete={
                isCreatingAccount ? "new-password" : "current-password"
              }
              disabled={loading}
            />
          </div>

          {isCreatingAccount && (
            <div className="field">
              <label htmlFor="confirm-password">Confirm Password</label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Enter your password again"
                autoComplete="new-password"
                disabled={loading}
              />
            </div>
          )}

          <div className="actions">
            {isCreatingAccount ? (
              <button
                type="button"
                className="btn"
                onClick={createAccount}
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            ) : (
              <button
                type="button"
                className="btn"
                onClick={signIn}
                disabled={loading}
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>
            )}
          </div>

          <div className="auth-switch">
            {isCreatingAccount ? (
              <>
                <span className="muted">Already have an account?</span>{" "}
                <button
                  type="button"
                  className="btn secondary"
                  onClick={switchMode}
                  disabled={loading}
                >
                  Sign In
                </button>
              </>
            ) : (
              <>
                <span className="muted">Don't have an account?</span>{" "}
                <button
                  type="button"
                  className="btn secondary"
                  onClick={switchMode}
                  disabled={loading}
                >
                  Create an Account
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
