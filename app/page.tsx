import Link from "next/link";
import Navbar from "@/components/Navbar";

const causes = [
  { name: "Environment", icon: "↟", description: "A little care. A greener planet.", color: "green" },
  { name: "Education", icon: "✎", description: "Open doors through learning.", color: "yellow" },
  { name: "Community", icon: "♡", description: "Show up for your neighborhood.", color: "pink" },
  { name: "Animal Welfare", icon: "♧", description: "Be a voice for every living thing.", color: "blue" },
];

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="home-page">
        <section className="hero page-container">
          <div className="hero-copy">
            <p className="eyebrow"><span className="status-dot" /> SMALL ACTIONS. REAL CHANGE.</p>
            <h1>Your time.<br />Their tomorrow.<br /><span>A better world.</span></h1>
            <p className="hero-description">Good things happen when we show up. Find meaningful volunteer opportunities and make a difference, right where you belong.</p>
            <div className="hero-actions"><Link href="/explore" className="button button-primary">Find your opportunity <span aria-hidden="true">↗</span></Link><a href="#how-it-works" className="text-link">See how it works <span aria-hidden="true">↓</span></a></div>
            <div className="hero-note"><span className="mini-symbols" aria-hidden="true"><i>✳</i><i>♡</i><i>↟</i></span><span>A little of your time.<br /><strong>A world of possibility.</strong></span></div>
          </div>
          <div className="hero-art" role="img" aria-label="Illustration of a thriving green neighborhood with trees, homes and a community garden">
            <div className="art-topline"><span>GROW TOGETHER</span><span>↗</span></div>
            <svg viewBox="0 0 520 430" fill="none" aria-hidden="true">
              <circle cx="390" cy="92" r="49" fill="#EBC86F" />
              <path d="M0 310Q115 190 245 290Q390 195 520 280V430H0Z" fill="#A9BB87" />
              <path d="M0 360Q160 250 320 335Q430 280 520 330V430H0Z" fill="#769564" />
              <path d="M250 430Q340 347 271 284" stroke="#F0E4C6" strokeWidth="45" />
              <path d="M98 310V160M414 316V188" stroke="#355A3E" strokeWidth="12" strokeLinecap="round" />
              <path d="M98 255C-5 230 29 132 98 108C158 140 191 221 98 255Z" fill="#426C4B" />
              <path d="M414 269C338 245 351 179 414 139C485 177 496 249 414 269Z" fill="#315A40" />
              <path d="M187 283V204H304V283" fill="#F7EDD5" /><path d="M171 205L245 145L320 205Z" fill="#CA7957" />
              <path d="M233 283V240H258V283" fill="#45674C" /><path d="M204 220H223V241H204Z M270 220H289V241H270Z" fill="#E1B867" />
              <path d="M49 372L138 347L181 370L92 397Z" fill="#D9B188" /><path d="M62 369L135 351M75 379L148 360" stroke="#8B6549" strokeWidth="3" />
              <path d="M87 368V340M119 358V332M148 368V344" stroke="#325F40" strokeWidth="4" /><path d="M87 352Q59 332 72 327Q88 329 87 352 M119 344Q142 319 146 331Q141 345 119 344 M148 359Q169 333 172 347Q167 360 148 359" fill="#325F40" />
              <circle cx="343" cy="293" r="12" fill="#80583E" /><path d="M328 313Q343 303 357 313L363 348H325Z" fill="#EBC86F" /><path d="M334 348L329 378M352 348L359 378" stroke="#344C38" strokeWidth="8" strokeLinecap="round" /><path d="M329 319L312 339M356 319L372 303" stroke="#80583E" strokeWidth="7" strokeLinecap="round" />
              <circle cx="199" cy="328" r="11" fill="#B77550" /><path d="M184 348Q199 338 211 348L216 376H182Z" fill="#F5EBD3" /><path d="M190 376L185 404M207 376L213 404" stroke="#344C38" strokeWidth="7" strokeLinecap="round" /><path d="M188 351L171 363" stroke="#B77550" strokeWidth="6" strokeLinecap="round" />
              <path d="M306 106L311 92L316 106L330 111L316 116L311 130L306 116L292 111Z" fill="#426C4B" />
              <path d="M145 84Q158 69 173 84M182 105Q195 90 208 105" stroke="#426C4B" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <div className="art-caption"><span className="art-heart">♡</span><div><strong>It starts with showing up.</strong><span>Find your people. Make your impact.</span></div></div>
            <div className="floating-label"><span aria-hidden="true">✳</span> A little help goes a long way</div>
          </div>
        </section>
        <section className="belief-strip"><div className="page-container"><p>More connection.<br /><strong>More possibility.</strong></p><span>Local causes, lasting impact</span><span>Organizations with a purpose</span><span>A community that cares</span></div></section>
        <section className="causes-section page-container">
          <div className="section-heading"><div><p className="eyebrow">FIND WHAT MOVES YOU</p><h2>There’s a cause for everyone.</h2></div><Link href="/explore" className="text-link">Explore all opportunities <span aria-hidden="true">↗</span></Link></div>
          <div className="cause-grid">{causes.map(cause => <Link key={cause.name} href={`/explore?category=${encodeURIComponent(cause.name)}`} className={`cause-card cause-${cause.color}`}><span className="cause-icon" aria-hidden="true">{cause.icon}</span><h3>{cause.name}</h3><p>{cause.description}</p><span className="cause-arrow" aria-hidden="true">↗</span></Link>)}</div>
        </section>
        <section id="how-it-works" className="how-section page-container"><div className="section-heading"><div><p className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</p><h2>Doing good. Made simple.</h2></div><p>You bring the heart.<br />We help you find where to start.</p></div><div className="steps-grid">{[{ title: "Find your cause", text: "Explore events by interest, location, and the time you have to give." }, { title: "Make a connection", text: "Get to know the organization and register for an opportunity that fits." }, { title: "Show up. Make a difference.", text: "Put your skills to work, meet good people, and be part of something bigger." }].map((step, index) => <div className="step" key={step.title}><span className="step-number">0{index + 1}</span><h3>{step.title}</h3><p>{step.text}</p></div>)}</div></section>
        <section className="join-banner page-container"><div><p className="eyebrow">BETTER, TOGETHER</p><h2>Big change starts<br />with a small “I’m in.”</h2><p>Your next meaningful moment could be just around the corner.</p><Link href="/user/signup" className="button button-cream">Count me in <span aria-hidden="true">↗</span></Link></div><span className="banner-flower" aria-hidden="true">✳</span></section>
      </main>
      <footer className="site-footer page-container"><Link href="/" className="brand">voluntr.</Link><p>A little time. A lasting difference.</p><Link href="/ngo/login">Organization login ↗</Link></footer>
    </>
  );
}
