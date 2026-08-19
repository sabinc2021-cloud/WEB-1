"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "../../lib/supabase";

export default function Login() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  function switchMode(nextMode: "signin" | "signup") {
    setMode(nextMode);
    setMessage("");
    setPassword("");
    setConfirmPassword("");
  }

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

  async function createAccount() {
    setMessage("");

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      setMessage("Please complete all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const supabase = db();

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
          },
        },
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      // If email confirmation is disabled, Supabase returns a session and
      // the user can continue directly to workspace setup.
      if (data.session) {
        router.push("/setup");
        return;
      }

      // If email confirmation is enabled, there is no authenticated session
      // yet, so stay here and tell the user what to do.
      setMessage(
        "Account created successfully. Check your email to confirm your account, then sign in."
      );
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to create your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  const isSignUp = mode === "signup";

  return (
    <div className="login">
      <div className="loginbox">
        <div className="eyebrow">Cloud Construction Platform</div>

        <h1>LPS Command Center</h1>

        <p className="muted">
          {isSignUp
            ? "Create your account to get started."
            : "Last Planner System for construction teams."}
        </p>

        {message && <div className="msg">{message}</div>}

        <div className="form">
          {isSignUp && (
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
              value={email}
              onChange={(event) => setEmail(event.target.value)}
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
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete={isSignUp ? "new-password" : "current-password"}
              disabled={loading}
            />
          </div>

          {isSignUp && (
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
            {isSignUp ? (
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
            {isSignUp ? (
              <>
                <span className="muted">Already have an account?</span>{" "}
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => switchMode("signin")}
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
                  onClick={() => switchMode("signup")}
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
