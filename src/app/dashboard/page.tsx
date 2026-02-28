

import Link from "next/link";
import { redirect } from "next/navigation";

export default function DashboardPage() {
  // TEMP authentication check (will replace with real JWT later)
  const isLoggedIn = false; // change to true after login system is implemented

  if (!isLoggedIn) {
    redirect("/login");
  }
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      
      {/* Navbar */}
      <nav className="flex justify-between items-center px-10 py-4 bg-gray-900 border-b border-gray-800">
        <Link
          href="/"
          className="text-xl font-bold hover:text-blue-500 transition"
        >
          Smart Travel Planner
        </Link>

        <div className="flex gap-6 items-center">
          <Link
            href="/create-trip"
            className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            + Create Trip
          </Link>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="max-w-6xl mx-auto p-10">
        <h1 className="text-3xl font-bold mb-10">My Trips</h1>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
            <h3 className="text-lg font-semibold">Paris Trip</h3>
            <p className="text-gray-400">5 Days • Food & Culture</p>
          </div>

          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
            <h3 className="text-lg font-semibold">Tokyo Adventure</h3>
            <p className="text-gray-400">7 Days • Technology & Anime</p>
          </div>

          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
            <h3 className="text-lg font-semibold">New York Weekend</h3>
            <p className="text-gray-400">3 Days • City Exploration</p>
          </div>
        </div>
      </div>
    </main>
  );
}