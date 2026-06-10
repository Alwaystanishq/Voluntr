import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-blue-50 text-black">
      <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-5 border-b border-orange-100 bg-white/80 backdrop-blur-md">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-orange-500 to-blue-600 bg-clip-text text-transparent">
          Voluntr
        </h1>

        <div className="flex gap-4">
          <Link href="/user/login">
            <button className="border border-gray-300 px-5 py-2 rounded-xl hover:bg-gray-50 transition">
              User Login
            </button>
          </Link>

          <Link href="/ngo/login">
            <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-5 py-2 rounded-xl shadow-md hover:scale-105 transition">
              NGO Login
            </button>
          </Link>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-6 py-24 text-center">
        <h1 className="text-6xl md:text-7xl font-extrabold leading-tight mb-8">
          Volunteer for causes
          <span className="block bg-gradient-to-r from-orange-500 to-blue-600 bg-clip-text text-transparent">
            that truly matter.
          </span>
        </h1>

        <p className="max-w-3xl mx-auto text-xl text-gray-600 leading-9 mb-10">
          Connect with NGOs, discover meaningful opportunities, participate in
          impactful events, and help build stronger communities together.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/explore">
            <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-2xl shadow-lg hover:scale-105 transition">
              Explore Events
            </button>
          </Link>

          <Link href="/ngo/signup">
            <button className="border border-blue-300 bg-blue-50 text-blue-700 px-8 py-4 rounded-2xl hover:bg-blue-100 transition">
              Organize Events
            </button>
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-3xl shadow-md border border-orange-100 text-center">
            <h2 className="text-5xl font-bold text-orange-500 mb-3">100+</h2>
            <p className="text-gray-600">Volunteers Connected</p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-md border border-orange-100 text-center">
            <h2 className="text-5xl font-bold text-blue-600 mb-3">50+</h2>
            <p className="text-gray-600">Community Events</p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-md border border-orange-100 text-center">
            <h2 className="text-5xl font-bold text-green-600 mb-3">20+</h2>
            <p className="text-gray-600">Partner NGOs</p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-24">
        <h2 className="text-4xl font-bold text-center mb-14">
          How Voluntr Works
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl shadow-md border border-orange-100">
            <div className="text-5xl mb-5">🔍</div>

            <h3 className="text-2xl font-semibold mb-4">
              Discover Opportunities
            </h3>

            <p className="text-gray-600 leading-7">
              Browse volunteer events created by NGOs and find causes that align
              with your interests.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-md border border-orange-100">
            <div className="text-5xl mb-5">🤝</div>

            <h3 className="text-2xl font-semibold mb-4">Join Events</h3>

            <p className="text-gray-600 leading-7">
              Register for events, contribute your skills, and collaborate with
              people making a difference.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-md border border-orange-100">
            <div className="text-5xl mb-5">🌍</div>

            <h3 className="text-2xl font-semibold mb-4">Create Impact</h3>

            <p className="text-gray-600 leading-7">
              Support meaningful initiatives and help NGOs achieve their mission
              through community action.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="bg-gradient-to-r from-orange-500 to-blue-600 rounded-3xl p-12 text-center text-white shadow-xl">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Make a Difference?
          </h2>

          <p className="text-lg mb-8 opacity-90">
            Join volunteers and organizations working together to create
            positive change.
          </p>

          <Link href="/explore">
            <button className="bg-white text-black px-8 py-4 rounded-2xl font-semibold hover:scale-105 transition">
              Get Started
            </button>
          </Link>
        </div>
      </section>
    </main>
  );
}
