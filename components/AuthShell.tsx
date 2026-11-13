import Link from "next/link";
import type { ReactNode } from "react";

export default function AuthShell({
  organization = false,
  signup = false,
  children,
}: {
  organization?: boolean;
  signup?: boolean;
  children: ReactNode;
}) {
  const accountPath = organization ? "ngo" : "user";
  const action = signup ? "signup" : "login";

  return (
    <main id="main-content" className={`auth-page${organization && signup ? " auth-page--ngo-signup" : ""}`}>
      <header className="auth-header">
        <Link href="/" className="brand">voluntr<span className="brand-dot">.</span></Link>
        <Link href="/explore" className="auth-back">Browse opportunities <span aria-hidden="true">↗</span></Link>
      </header>

      <div className="auth-layout">
        <aside className="auth-story">
          <p className="auth-story-label">{organization ? "A community with a purpose" : "Volunteering starts with you"}</p>
          <div>
            <p className="auth-statement">
              {organization ? <>Bring people<br />together<br /><span>for good.</span></> : <>A little time.<br />A lasting<br /><span>difference.</span></>}
            </p>
            <p className="auth-story-copy">
              {organization
                ? "Bring your community together. Create events and connect with people ready to lend a hand."
                : "Find a cause you care about and people to share it with. There’s a place for you here."}
            </p>
          </div>
          <div className="auth-story-footer">
            <span>{organization ? "For the people bringing us together." : "For the people who show up."}</span>
            <span aria-hidden="true">voluntr.</span>
          </div>
        </aside>

        <section className="auth-panel" aria-labelledby="auth-title">
          <div className="auth-card">
            <nav className="auth-account-switch" aria-label="Account type">
              <Link href={`/user/${action}`} aria-current={!organization ? "page" : undefined}>Volunteer</Link>
              <Link href={`/ngo/${action}`} aria-current={organization ? "page" : undefined}>Organization</Link>
            </nav>
            <div className="auth-intro">
              <p className="auth-kicker">{organization ? "Organization account" : "Volunteer account"}</p>
              <h1 id="auth-title">{signup ? (organization ? "Bring your team aboard" : "Make room for good") : "Welcome back"}</h1>
              <p>{signup
                ? (organization ? "Create an account to organize events and welcome volunteers." : "Create an account to find and join volunteer opportunities.")
                : (organization ? "Log in to manage your events and volunteers." : "Log in to see your saved opportunities and upcoming events.")}</p>
            </div>

            {children}

            <p className="auth-alternate">
              {signup ? "Already have an account?" : "New to Voluntr?"}{" "}
              <Link href={`/${accountPath}/${signup ? "login" : "signup"}`}>
                {signup ? "Log in" : "Create an account"}
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
