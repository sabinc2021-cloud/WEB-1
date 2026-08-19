"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "../../lib/supabase";

export default function CreateAccount() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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

      /*
       * Supabase behaves differently depending on whether email confirmation
       * is enabled:
       *
       * - With confirmation disabled, a session is returned immediately.
       *   The user can go straight to workspace setup.
       *
       * - With confirmation enabled, there is no session yet. The user must
       *   confirm the email before they can access the authenticated setup.
       */
      if (data.session) {
        router.push("/setup");
        return;
      }

      setMessage(
        "Your account was created. Check your email to confirm your account, then return to Sign In."
      );
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

  return (
    <div className="login">
      <div className="loginbox">
        <div className="eyebrow">Cloud Construction Platform</div>
        <h1>Create an Account</h1>
        <p className="muted">
          Create your LPS Command Center account to get started.
        </p>

        {message && <div className="msg">{message}</div>}

        <div className="form">
          <div className="field">
            <label htmlFor="first-name">First Name</label>
            <input
              id="first-name"
              type="text"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
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
              autoComplete="family-name"
              disabled={loading}
            />
          </div>

          <div className="field">
            <label htmlFor="create-email">Email</label>
            <input
              id="create-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div className="field">
            <label htmlFor="create-password">Password</label>
            <input
              id="create-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              disabled={loading}
            />
          </div>

          <div className="field">
            <label htmlFor="confirm-password">Confirm Password</label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              disabled={loading}
            />
          </div>

          <div className="actions">
            <button
              type="button"
              className="btn"
              onClick={createAccount}
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

            <button
              type="button"
              className="btn secondary"
              onClick={() => router.push("/login")}
              disabled={loading}
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
