"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NGOLoginPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const res = await signIn("credentials", {
      email: formData.email,
      password: formData.password,
      redirect: false,
    });

    if (res?.ok) {
      router.push("/explore");
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 via-white to-blue-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-orange-100">
        <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-orange-500 to-blue-600 bg-clip-text text-transparent">
          NGO Login
        </h1>

        <p className="text-center text-gray-600 mb-8">
          Login to manage your events and volunteers.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-orange-400 placeholder:text-black"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-orange-400 placeholder:text-black"
            required
          />

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-semibold hover:scale-[1.02] transition"
          >
            Login
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/ngo/signup" className="text-orange-500 font-semibold">
            Sign Up
          </Link>
        </p>
      </div>
    </main>
  );
}
