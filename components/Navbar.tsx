"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  return (
    <header className="site-header">
      <nav className="site-nav" aria-label="Main navigation">
        <Link href="/" className="brand" aria-label="Voluntr home"><span className="brand-mark" aria-hidden="true">v<span>✳</span></span>voluntr<span className="brand-dot">.</span></Link>
        <div className="nav-links">
          <Link href="/explore" aria-current={pathname === "/explore" ? "page" : undefined}>Find opportunities</Link>
          {!session && <Link href="/ngo/signup" className="nav-secondary">For organizations</Link>}
          {session && <Link href={session.user?.role === "ngo" ? "/dashboard" : "/volunteer/dashboard"}>Dashboard</Link>}
          {session?.user?.role === "ngo" && <Link href="/create-event" className="nav-secondary">Create event</Link>}
          {session && <Link href="/profile" className="nav-secondary">Profile</Link>}
        </div>
        <div className="nav-actions">
          {session ? <button className="button button-outline button-small" onClick={() => void signOut({ callbackUrl: "/" })}>Log out</button> : status !== "loading" ? <><Link href="/user/login" className="login-link">Log in</Link><Link href="/user/signup" className="button button-primary button-small">Get involved <span aria-hidden="true">↗</span></Link></> : <span className="text-sm text-gray-500">Loading…</span>}
        </div>
      </nav>
    </header>
  );
}
