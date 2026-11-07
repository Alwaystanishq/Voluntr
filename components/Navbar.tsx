"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    menu.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") { setOpen(false); toggle.current?.focus(); }
      if (event.key === "Tab") {
        const items = [toggle.current, ...Array.from(menu.current?.querySelectorAll<HTMLAnchorElement>("a") ?? [])].filter((item): item is HTMLButtonElement | HTMLAnchorElement => !!item);
        const first = items[0], last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = previous; document.removeEventListener("keydown", onKey); };
  }, [open]);
  const dashboard = session?.user?.role === "ngo" ? "/dashboard" : "/volunteer/dashboard";
  return (
    <header className="site-header">
      <nav className="site-nav" aria-label="Main navigation">
        <Link href="/" className="brand" aria-label="Voluntr home"><span className="brand-mark" aria-hidden="true">v<span>✳</span></span>voluntr<span className="brand-dot">.</span></Link>
        <div className="nav-links desktop-links">
          <Link href="/explore" aria-current={pathname === "/explore" ? "page" : undefined}>Find opportunities</Link>
          {!session && <Link href="/ngo/signup" className="nav-secondary">For organizations</Link>}
          {session && <Link href={dashboard} aria-current={pathname === dashboard ? "page" : undefined}>Dashboard</Link>}
          {session?.user?.role === "ngo" && <Link href="/create-event" className="nav-secondary">Create event</Link>}
          {session && <Link href="/profile" aria-current={pathname === "/profile" ? "page" : undefined} className="nav-secondary">Profile</Link>}
        </div>
        <div className="nav-actions">
          {session ? <button className="button button-outline button-small" onClick={() => void signOut({ callbackUrl: "/" })}>Log out</button> : status !== "loading" ? <><Link href="/user/login" className="login-link">Log in</Link><Link href="/user/signup" className="button button-primary button-small">Get involved <span aria-hidden="true">↗</span></Link></> : <span className="text-sm text-gray-500">Loading…</span>}
        </div>
        <button ref={toggle} className={`menu-toggle ${open ? "is-open" : ""}`} aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)}><span /><span /></button>
      </nav>
      {open && <div ref={menu} id="mobile-navigation" className="mobile-menu">
        <p className="eyebrow">Make room for a little good</p>
        {[{ href: "/explore", label: "Find opportunities" }, ...(session ? [{ href: dashboard, label: "Your dashboard" }, { href: "/profile", label: "Your profile" }, ...(session.user?.role === "ngo" ? [{ href: "/create-event", label: "Create an event" }] : [])] : [{ href: "/ngo/signup", label: "For organizations" }, { href: "/user/login", label: "Log in" }, { href: "/user/signup", label: "Get involved" }])].map((link, index) => <Link key={link.href} href={link.href} aria-current={pathname === link.href ? "page" : undefined} style={{ animationDelay: `${Math.min(index * 60, 400)}ms` }} onClick={() => setOpen(false)}>{link.label}<span aria-hidden="true">↗</span></Link>)}
      </div>}
    </header>
  );
}
