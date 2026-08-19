 "use client";import{useState}from"react";import{useRouter}from"next/navigation";import{db}from"../../lib/supabase";export default function Login(){const[e,setE]=useState("");const[p,setP]=useState("");const[m,setM]=useState("");const r=useRouter();async function go(up:boolean){const s=db();const x=up?await s.auth.signUp({email:e,password:p}):await s.auth.signInWithPassword({email:e,password:p});if(x.error)setM(x.error.message);else if(!up)r.push("/dashboard");else setM("Account created. Check your email if confirmation is enabled.")}return <div className="login"><div className="loginbox"><div className="eyebrow">Cloud Construction Platform</div><h1>LPS Command Center</h1><p className="muted">Last Planner System for construction teams.</p>{m&&<div className="msg">{m}</div>}<div className="form"><div className="field"><label>Email</label><input value={e} onChange={x=>setE(x.target.value)}/></div><div className="field"><label>Password</label><input type="password" value={p} onChange={x=>setP(x.target.value)}/></div><div className="actions"><button className="btn" onClick={()=>go(false)}>Sign In</button><button className="btn secondary" onClick={()=>go(true)}>Create Account</button></div></div></div></div>}"use client";
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
    setIsCreatingAccount(!isCreatingAccount);
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
                <label>First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(x) => setFirstName(x.target.value)}
                  placeholder="First name"
                  autoComplete="given-name"
                  disabled={loading}
                />
              </div>

              <div className="field">
                <label>Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(x) => setLastName(x.target.value)}
                  placeholder="Last name"
                  autoComplete="family-name"
                  disabled={loading}
                />
              </div>
            </>
          )}

          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={e}
              onChange={(x) => setE(x.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={p}
              onChange={(x) => setP(x.target.value)}
              placeholder="Enter your password"
              autoComplete={
                isCreatingAccount ? "new-password" : "current-password"
              }
              disabled={loading}
            />
          </div>

          {isCreatingAccount && (
            <div className="field">
              <label>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(x) => setConfirmPassword(x.target.value)}
                placeholder="Enter your password again"
                autoComplete="new-password"
                disabled={loading}
              />
            </div>
          )}

          <div className="actions">
            {isCreatingAccount ? (
              <button
                className="btn"
                onClick={createAccount}
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            ) : (
              <button className="btn" onClick={signIn} disabled={loading}>
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
