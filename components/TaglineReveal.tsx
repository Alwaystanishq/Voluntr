"use client";

import { useEffect, useRef } from "react";

export default function TaglineReveal() {
  const section = useRef<HTMLElement>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -15% 0px", threshold: 1 });
    section.current?.querySelectorAll(".reveal-word").forEach(word => observer.observe(word));
    return () => observer.disconnect();
  }, []);
  return <section ref={section} className="tagline-section page-container" aria-labelledby="tagline-heading">
    <p className="eyebrow">A little time can mean a lot</p>
    <h2 id="tagline-heading" className="heading-2">{["Find a place to belong.", "Leave it a little better."].map(line => <span className="tagline-line" key={line}>{line.split(" ").map((word, index) => <span className="reveal-word" style={{ transitionDelay: `${index * 60}ms` }} key={index}>{word}{" "}</span>)}</span>)}</h2>
    <p className="body-3">Connect with a cause you care about, and the people making it happen.</p>
  </section>;
}
