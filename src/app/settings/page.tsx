

"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // TEMP: Later connect to backend (Prisma + PostgreSQL)
    alert("Settings saved successfully!");
  };

  const handleDeleteAccount = () => {
    const confirmDelete = confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );

    if (confirmDelete) {
      // TEMP: Later connect to backend delete API
      alert("Account deleted (simulation).");
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-3xl mx-auto p-10">
        <h1 className="text-3xl font-bold mb-10">Settings</h1>

        {/* Preferences Section */}
        <div className="bg-gray-900 p-8 rounded-xl border border-gray-800 shadow-lg">
          <form onSubmit={handleSave} className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Email Notifications</h3>
                <p className="text-gray-400 text-sm">
                  Receive trip reminders and updates via email.
                </p>
              </div>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={() => setEmailNotifications(!emailNotifications)}
                className="w-5 h-5 accent-blue-600"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Push Notifications</h3>
                <p className="text-gray-400 text-sm">
                  Get instant alerts for upcoming trips.
                </p>
              </div>
              <input
                type="checkbox"
                checked={pushNotifications}
                onChange={() => setPushNotifications(!pushNotifications)}
                className="w-5 h-5 accent-blue-600"
              />
            </div>

            <button
              type="submit"
              className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition"
            >
              Save Preferences
            </button>
          </form>
        </div>

        {/* Delete account */}
        <div className="mt-12 bg-gray-900 p-8 rounded-xl border border-red-800 shadow-lg">
          <h2 className="text-xl font-bold text-red-500 mb-4">Account Deletion</h2>
          <p className="text-gray-400 mb-6">
            Permanently delete your account and all associated trips.
          </p>

          <button
            onClick={handleDeleteAccount}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition"
          >
            Delete Account
          </button>
        </div>
      </div>
    </main>
  );
}