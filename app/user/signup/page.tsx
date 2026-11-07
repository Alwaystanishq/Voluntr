"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function UserSignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setPending(true);

    try {
      const res = await axios.post("/api/users", {
        name,
        email,
        password,
      });

      if (res.data.success) {
        router.push("/user/login");
      }
    } catch (error) {

      setError(axios.isAxiosError(error) ? error.response?.data?.message || "Could not create your account. Please try again." : "Could not create your account. Please try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <main id="main-content" className="auth-page">
      <div className="auth-card">
        <Link href="/" className="brand auth-brand">voluntr<span className="brand-dot">.</span></Link>
        <h1 className="heading-4">
          Make room for good
        </h1>

        <p className="text-center text-gray-600 mb-8">
          Create your volunteer account.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <p role="alert" className="workspace-error">{error}</p>}
          <input
            type="text"
            aria-label="Name" placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-black placeholder:text-gray-500 outline-none focus:border-orange-400"
            required
          />

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
            minLength={8}
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
            {pending ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Already have an account?{" "}
          <Link
            href="/user/login"
            className="text-link"
          >
            {pending ? "Signing in…" : "Log in"}
          </Link>
        </p>
      </div>
    </main>
  );
}
