
"use client";

import { useState } from "react";

export default function ProfilePage() {
  const [name, setName] = useState("John Doe");
  const [email, setEmail] = useState("john@example.com");

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();

    // TEMP: Later we will connect this to backend (Prisma + PostgreSQL)
    alert("Profile updated successfully!");
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-3xl mx-auto p-10">

        <h1 className="text-3xl font-bold mb-10">My Profile</h1>

        <div className="bg-gray-900 p-8 rounded-xl border border-gray-800 shadow-lg">
          <form onSubmit={handleUpdate} className="flex flex-col gap-6">

            <div>
              <label className="block mb-2 text-gray-400">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block mb-2 text-gray-400">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block mb-2 text-gray-400">Change Password</label>
              <input
                type="password"
                placeholder="Enter new password"
                className="w-full bg-gray-800 border border-gray-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition"
            >
              Update Profile
            </button>
          </form>
        </div>

        {/* Account Stats Section (Resume Booster) */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 text-center">
            <h3 className="text-xl font-semibold">12</h3>
            <p className="text-gray-400 mt-2">Trips Created</p>
          </div>

          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 text-center">
            <h3 className="text-xl font-semibold">5</h3>
            <p className="text-gray-400 mt-2">Countries Visited</p>
          </div>

          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 text-center">
            <h3 className="text-xl font-semibold">28</h3>
            <p className="text-gray-400 mt-2">Total Travel Days</p>
          </div>
        </div>

      </div>
    </main>
  );
}