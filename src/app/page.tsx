import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">

      {/* Navbar */}
      <nav className="flex justify-between items-center px-10 py-4 bg-white shadow-sm">
        <h2 className="text-xl font-bold">Smart Travel Planner</h2>

        <div className="flex gap-6 items-center">
          <Link
            href="/login"
            className="text-gray-700 hover:text-blue-600 transition"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-24 px-6">
        <h1 className="text-5xl font-bold mb-6">
          Smart Travel Planner
        </h1>

        <p className="text-lg text-gray-600 max-w-2xl mb-8">
          Plan smarter trips with AI-powered itinerary generation.
          Discover destinations, organize your travel days, and explore
          the world more efficiently.
        </p>

        <div className="flex gap-4">
          <Link
            href="/register"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Get Started
          </Link>

          <Link
            href="/login"
            className="border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-100 transition"
          >
            Login
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-10 text-center">

          <div className="p-6 shadow-md rounded-lg">
            <h3 className="text-xl font-semibold mb-4">
              AI Itinerary Generation
            </h3>
            <p className="text-gray-600">
              Automatically generate personalized travel plans based on
              your destination, duration, and preferences.
            </p>
          </div>

          <div className="p-6 shadow-md rounded-lg">
            <h3 className="text-xl font-semibold mb-4">
              Trip Management
            </h3>
            <p className="text-gray-600">
              Create, edit, and organize multiple trips with an intuitive
              dashboard experience.
            </p>
          </div>

          <div className="p-6 shadow-md rounded-lg">
            <h3 className="text-xl font-semibold mb-4">
              Interactive Maps
            </h3>
            <p className="text-gray-600">
              Visualize destinations and explore attractions using
              integrated maps and location insights.
            </p>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-10 text-gray-500 text-sm">
        © {new Date().getFullYear()} Smart Travel Planner. All rights reserved.
      </footer>

    </main>
  );
}
