import Link from "next/link";

export default function NotFound() {
  return <main id="main-content" className="auth-page"><div className="auth-card">
    <Link href="/" className="brand auth-brand">voluntr.</Link>
    <p className="eyebrow">404 · Page not found</p>
    <h1 className="heading-4">Let’s find your way back.</h1>
    <p className="body-3 mb-8 text-center">This page may have moved. There are still plenty of ways to make a difference.</p>
    <Link href="/explore" className="button button-primary w-full">Find an opportunity</Link>
  </div></main>;
}
