"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    const cookieOptions = rememberMe ? { expires: 365 } : {};
    Cookies.set("fishUsername", username.trim(), cookieOptions);
    window.dispatchEvent(new Event("storage"));
    router.push("/stats");
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0f0f11] to-[#1a1a1d] text-white font-sans flex items-center justify-center pb-16">
      <motion.form
        onSubmit={handleLogin}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="bg-neutral-800 p-8 rounded-2xl shadow-xl w-full max-w-md text-center space-y-6"
      >
        <h1 className="text-4xl font-bold">Enter Username</h1>

        <input
          type="text"
          placeholder="Enter Name..."
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full bg-neutral-700 border border-neutral-600 rounded-lg px-4 py-3 text-base placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />

        <label className="flex items-center gap-3 text-sm text-neutral-300 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={() => setRememberMe(!rememberMe)}
            className="w-5 h-5 rounded border-neutral-600 bg-neutral-700 checked:bg-blue-500 checked:ring-2 checked:ring-blue-400 transition"
          />
          Remember Me
        </label>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 hover:from-pink-500 hover:via-purple-500 hover:to-blue-400 text-white font-semibold py-3 rounded-lg shadow-lg transition-transform hover:scale-[1.03]"
        >
          Submit
        </button>
      </motion.form>
    </main>
  );
}
