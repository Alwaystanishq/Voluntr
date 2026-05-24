import Link from "next/link";

export default function HomePage() {
  const sampleEvents = [
    {
      title: "Beach Cleanup Drive",
      description:
        "Join us in cleaning the local beach and protecting marine life.",
      date: "12 June 2026",
    },
    {
      title: "Food Distribution Camp",
      description: "Help distribute food packets to families in need.",
      date: "18 June 2026",
    },
    {
      title: "Tree Plantation Event",
      description: "Plant trees and make the environment greener together.",
      date: "25 June 2026",
    },
  ];

  return (
    <main className="h-screen overflow-hidden bg-gradient-to-b from-orange-50 via-white to-blue-50 text-black flex flex-col">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-orange-100 bg-white/70 backdrop-blur-sm">
        <h1 className="text-2xl font-extrabold bg-gradient-to-r from-orange-500 to-blue-600 bg-clip-text text-transparent">
          Voluntr
        </h1>

        <div className="flex gap-4">
          <Link href="/user/login">
            <button className="border px-4 py-2 rounded-lg hover:bg-gray-100 transition">
              User Login
            </button>
          </Link>

          <Link href="/ngo/login">
            <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg shadow-md hover:scale-105 transition">
              NGO Login
            </button>
          </Link>
        </div>
      </nav>

      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-10">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight max-w-5xl">
          Find, join, and organize volunteer events.
        </h1>

        <p className="max-w-2xl text-lg text-gray-700 mb-8 leading-8">
          Connect with organizations, participate in meaningful causes, and make
          real impact in your community.
        </p>

        <div className="flex gap-4 mb-12">
          <Link href="/explore">
            <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition">
              Explore Events
            </button>
          </Link>

          <Link href="/ngo/signup">
            <button className="border border-blue-300 bg-blue-50 text-blue-700 px-6 py-3 rounded-xl hover:bg-blue-100 transition">
              Organize Event
            </button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6 w-full max-w-6xl">
          {sampleEvents.map((event, index) => (
            <div
              key={index}
              className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-md border border-orange-100 hover:-translate-y-1 hover:shadow-xl transition"
            >
              <h3 className="text-xl font-semibold mb-3">{event.title}</h3>

              <p className="text-gray-600 mb-4 text-sm leading-6">
                {event.description}
              </p>

              <p className="text-sm text-gray-500 mb-6">{event.date}</p>

              <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 rounded-lg hover:opacity-90 transition">
                View Event
              </button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
