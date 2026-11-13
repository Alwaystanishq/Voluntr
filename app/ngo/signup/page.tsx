"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthShell from "@/components/AuthShell";
import AuthPasswordField from "@/components/AuthPasswordField";

export default function NGOSignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    setError("");
    setPending(true);
    try {
      const res = await axios.post("/api/organizations", { name, email, description, password });
      if (res.data.success) router.push("/ngo/login");
      else setError("Could not create your account. Please try again.");
    } catch (error) {
      setError(axios.isAxiosError(error) ? error.response?.data?.message || "Could not create your account. Please try again." : "Could not create your account. Please try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <AuthShell organization signup>
      <form onSubmit={handleSubmit} className="auth-form">
        {error && <p role="alert" className="auth-error">{error}</p>}
        <fieldset disabled={pending}>
          <div className="auth-field">
            <label htmlFor="name">Organization name</label>
            <input id="name" name="name" type="text" autoComplete="organization" placeholder="Your organization’s name" value={name} onChange={(event) => setName(event.target.value)} required />
          </div>
          <div className="auth-field">
            <label htmlFor="email">Work email address</label>
            <input id="email" name="email" type="email" autoComplete="email" autoCapitalize="none" spellCheck={false} placeholder="you@organization.org" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </div>
          <div className="auth-field">
            <label htmlFor="description">About your organization <span className="auth-optional">(optional)</span></label>
            <textarea id="description" name="description" rows={2} placeholder="Tell volunteers about the work you do." value={description} onChange={(event) => setDescription(event.target.value)} />
          </div>
          <AuthPasswordField value={password} onChange={setPassword} signup />
          <button type="submit" disabled={pending} aria-busy={pending} className="button button-primary">
            {pending ? "Creating account…" : "Create organization account"}
          </button>
        </fieldset>
        <p className="auth-status" role="status">{pending ? "Setting up your account…" : ""}</p>
      </form>
    </AuthShell>
  );
}
