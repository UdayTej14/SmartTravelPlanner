export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-10 py-4 bg-gray-900 border-b border-gray-800">
        <a
          href="/"
          className="text-xl font-bold hover:text-blue-500 transition"
        >
          Smart Travel Planner
        </a>

        <a
          href="/register"
          className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Register
        </a>
      </nav>
      <div className="flex flex-1 items-center justify-center">
        <div className="bg-gray-900 p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-800">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Login to Your Account
          </h2>

          <form className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Email"
              className="bg-gray-800 border border-gray-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="password"
              placeholder="Password"
              className="bg-gray-800 border border-gray-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              type="submit"
              className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition"
            >
              Login
            </button>
          </form>

          <p className="text-sm text-gray-400 mt-6 text-center">
            Don’t have an account?{" "}
            <a href="/register" className="text-blue-500 hover:underline">
              Register
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
