// src/pages/pos/login.jsx

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Header from "../../partials/Header";
import Banner from "../../partials/Banner";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";


function LoginPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const trimmedEmailOrUsername = emailOrUsername.trim();
    const trimmedPassword = password.trim();

    console.log("Attempting login with:", trimmedEmailOrUsername, trimmedPassword);

    if (!trimmedEmailOrUsername || !trimmedPassword) {
      Swal.fire("Warning", "Please enter both username/email and password", "warning");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailOrUsername: trimmedEmailOrUsername,
          password: trimmedPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.warn("Login failed:", data.message);
        Swal.fire("Error", data.message || "Login failed", "error");
        setLoading(false);
        return;
      }

      console.log("Login successful:", data.user);


      // After successful login
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.user.username);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("userId", data.user._id);

      Swal.fire("Success", `Welcome back ${data.user.username}`, "success");

      // Redirect based on role
      if (data.user.role.toLowerCase() === "cashier") {
        navigate("/sales/scan-items");  // <-- redirect cashiers straight to POS
      } else {
        navigate("/dashboard");  // other roles go to the dashboard
      }

    } catch (err) {
      console.error("Server error:", err);
      Swal.fire("Error", "Server error. Try again later.", "error");
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="flex h-screen overflow-hidden bg-gray-900">
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow relative flex items-center justify-center">
          {/* Background */}
          <div
            className="absolute inset-0 bg-cover bg-center blur-sm scale-105"
            style={{ backgroundImage: "url('/banner1.jpng')" }}
          >
            <div className="absolute inset-0 bg-black/70"></div>
          </div>

          {/* Login card */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative z-10 w-full max-w-md p-10 bg-gradient-to-br from-orange-400 via-green-400 to-green-600 backdrop-blur-sm rounded-3xl shadow-2xl"
          >
            <h2 className="text-3xl font-bold mb-8 text-center text-white">
              POS Login
            </h2>

            <form onSubmit={handleLogin} className="flex flex-col gap-6">
              <div className="flex flex-col">
                <label className="mb-2 text-white font-medium">Username</label>
                <input
                  type="text"
                  placeholder="Enter your email or username"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  required
                  className="px-4 py-3 rounded-xl border border-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-1 transition bg-white/20 text-white placeholder-white/70"
                />
              </div>

              <div className="flex flex-col">
                <label className="mb-2 text-white font-medium">Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="px-4 py-3 rounded-xl border border-white/50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-1 transition bg-white/20 text-white placeholder-white/70"
                />
              </div>

              <motion.button
                type="submit"
                whileTap={{ scale: 0.95 }}
                className={`mt-2 px-6 py-3 rounded-xl text-white font-semibold transition-all bg-gradient-to-r from-orange-500 to-green-500 hover:from-orange-600 hover:to-green-600 flex items-center justify-center gap-2 ${loading ? "cursor-not-allowed opacity-80" : ""
                  }`}
                disabled={loading}
              >
                {loading && (
                  <motion.span
                    className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"
                  />
                )}
                {loading ? "Logging in..." : "Login"}
              </motion.button>
            </form>
          </motion.div>
        </main>

        <Banner />
      </div>
    </div>
  );
}

export default LoginPage;
