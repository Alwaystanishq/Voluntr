"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthShell from "@/components/AuthShell";
import AuthPasswordField from "@/components/AuthPasswordField";

export default function NGOLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    setError("");
    setPending(true);
    try {
      const res = await signIn("credentials", { email, password, redirect: false });
      if (res?.ok) router.push("/dashboard");
      else setError("Email or password is incorrect. Please try again.");
    } catch {
      setError("We could not sign you in. Please try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <AuthShell organization>
      <form onSubmit={handleSubmit} className="auth-form">
        {error && <p role="alert" className="auth-error">{error}</p>}
        <fieldset disabled={pending}>
          <div className="auth-field">
            <label htmlFor="email">Work email address</label>
            <input id="email" name="email" type="email" autoComplete="email" autoCapitalize="none" spellCheck={false} placeholder="you@organization.org" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </div>
          <AuthPasswordField value={password} onChange={setPassword} />
          <button type="submit" disabled={pending} aria-busy={pending} className="button button-primary">
            {pending ? "Logging in…" : "Log in"}
          </button>
        </fieldset>
        <p className="auth-status" role="status">{pending ? "Checking your account…" : ""}</p>
      </form>
    </AuthShell>
  );
}
