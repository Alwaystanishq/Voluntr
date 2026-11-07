"use client";

import axios from "axios";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import OrganizationProfileEditor from "@/components/OrganizationProfileEditor";
import type { OrganizationProfile } from "@/types/organization";
import type { EventDetails } from "@/types/event";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [error, setError] = useState("");
  useEffect(() => { if (status === "unauthenticated") router.replace("/user/login"); }, [status, router]);

  const [profile, setProfile] = useState<(OrganizationProfile & { enrolledEvents?: EventDetails[] }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id || !session?.user?.role) return;

    const fetchProfile = async () => {
      try {
        const endpoint =
          session.user.role === "ngo"
            ? `/api/organizations/${session.user.id}`
            : `/api/users/${session.user.id}`;

        const res = await axios.get(endpoint);

        if (session.user.role === "ngo") {
          setProfile(res.data.organization);
        } else {
          setProfile({
            ...res.data.user,
            enrolledEvents: res.data.enrolledEvents,
          });
        }
      } catch (error) {
        console.log(error);
        setError("Could not load your profile. Please refresh and try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [session]);

  if (loading) return <><Navbar /><main className="workspace page-container"><p className="eyebrow">YOUR VOLUNTR ACCOUNT</p><div role="status" className="workspace-loading"><span className="sr-only">Loading your profile…</span><div className="loading-card" /></div></main></>;

  if (error || !profile) return <><Navbar /><main className="workspace page-container"><div role="alert" className="workspace-error">{error || "Profile not found."}<button onClick={() => window.location.reload()} className="text-link mt-4 block">Try again ↗</button></div></main></>;

  const isOrganization = session?.user?.role === "ngo";
  const events = (isOrganization ? profile.events : profile.enrolledEvents) || [];

  return <>
    <Navbar />
    <main className="workspace page-container">
      <div className="workspace-heading"><div><p className="eyebrow">YOUR SPACE TO MAKE A DIFFERENCE</p><h1>My profile<span>.</span></h1><p>Your details, your community, your next chapter.</p></div><Link href={isOrganization ? "/dashboard" : "/volunteer/dashboard"} className="button button-outline">Back to dashboard ↗</Link></div>
      <div className="profile-layout">
        <aside className="profile-summary">
          <div className="profile-avatar" aria-hidden="true">{profile.name?.trim().charAt(0).toUpperCase() || "V"}</div>
          <span className="account-label">{isOrganization ? "Organization" : "Volunteer"}</span>
          <h2>{profile.name}</h2><p className="profile-email">{profile.email}</p>
          <div className="profile-count"><strong>{events.length}</strong><span>{isOrganization ? "Events created" : "Event enrollments"}</span></div>
          <p className="profile-note">A little time.<br />A lasting difference.</p>
          <Link href={isOrganization ? "/create-event" : "/explore"} className="button button-primary">{isOrganization ? "Create an event" : "Find opportunities"} ↗</Link>
        </aside>
        <div className="profile-content">
          <section className="workspace-panel"><div className="panel-heading"><div><p className="eyebrow">THE ESSENTIALS</p><h2>Account details</h2></div><span aria-hidden="true" className="panel-symbol">✳</span></div><dl className="account-details"><div><dt>{isOrganization ? "Organization name" : "Full name"}</dt><dd>{profile.name}</dd></div><div><dt>Email address</dt><dd>{profile.email}</dd></div>{isOrganization && <div className="account-description"><dt>About your organization</dt><dd>{profile.description || "Add your story in the organization profile below."}</dd></div>}</dl></section>
          {isOrganization && <div className="workspace-panel profile-editor"><OrganizationProfileEditor key={profile._id} initial={profile} onSaved={(updated) => setProfile((previous) => previous ? { ...previous, ...updated } : updated)} /></div>}
          <section className="workspace-panel"><div className="panel-heading"><div><p className="eyebrow">PART OF YOUR STORY</p><h2>{isOrganization ? "Created events" : "Your enrollments"} <span className="count-badge">{events.length}</span></h2></div></div>
            {events.length === 0 ? <div className="workspace-empty"><span aria-hidden="true">↟</span><h3>{isOrganization ? "Your first event starts here." : "Your next chapter is waiting."}</h3><p>{isOrganization ? "Bring your community together around a cause that matters." : "Find a cause you care about and turn a little time into something meaningful."}</p><Link href={isOrganization ? "/create-event" : "/explore"} className="button button-primary">{isOrganization ? "Create an event" : "Explore opportunities"} ↗</Link></div> : <div className="profile-event-list">{events.map(event => <Link key={event._id} href={`/explore/${event._id}`} className="profile-event"><div><h3>{event.title}</h3><p>{event.description}</p></div><span aria-hidden="true">↗</span></Link>)}</div>}
          </section>
        </div>
      </div>
    </main>
  </>;
}
