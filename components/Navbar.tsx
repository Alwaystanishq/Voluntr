"use client";

import Link from "next/link";

import { signOut, useSession } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut({
      callbackUrl: "/",
    });
  };

  return (
    <nav className="w-full bg-white shadow-md border-b border-orange-100 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-blue-600 bg-clip-text text-transparent cursor-pointer">
            Voluntr
          </h1>
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/explore">
            <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2 rounded-xl">
              Explore
            </button>
          </Link>

          <Link href="/dashboard">
            <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-5 py-2 rounded-xl">
              Dashboard
            </button>
          </Link>

          {session && (
            <button
              onClick={handleLogout}
              className="bg-black text-white px-5 py-2 rounded-xl"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
