"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NGOLoginPage() {
  const router = useRouter();

  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
    <main id="main-content" className="auth-page">
      <div className="auth-card">
        <Link href="/" className="brand auth-brand">voluntr<span className="brand-dot">.</span></Link>
        <h1 className="heading-4">
          Your community starts here
        </h1>

        <p className="text-center text-gray-600 mb-8">
          Login to manage your events and volunteers.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <p role="alert" className="workspace-error">{error}</p>}
          <input
            type="email"
            aria-label="Email" placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-black placeholder:text-gray-500 outline-none focus:border-orange-400"
            required
          />

          <input
            type="password"
            aria-label="Password" placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-black placeholder:text-gray-500 outline-none focus:border-orange-400"
            required
          />

          <button
            type="submit"
            disabled={pending} aria-busy={pending}
            className="button button-primary"
          >
            {pending ? "Signing in…" : "Log in"}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Don&apos;t have an account?{" "}
          <Link
            href="/ngo/signup"
            className="text-link"
          >
            {pending ? "Creating account…" : "Create account"}
          </Link>
        </p>
      </div>
    </main>
  );
}
