"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function LoggedOutPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0f0f11] to-[#1a1a1d] text-white font-sans">
      <section className="max-w-6xl mx-auto px-6 py-16 space-y-24 flex flex-col items-center justify-center min-h-[70vh]">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-xl"
        >
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 text-transparent bg-clip-text">
            Successfully Logged Out
          </h1>
          <p className="text-lg mt-4 text-neutral-400">
            You have been logged out. Feel free to log back in or return home.
          </p>
        </motion.div>

        <motion.div 
          className="flex gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <button
            onClick={() => router.push("/login")}
            className="px-8 py-3 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 hover:from-pink-500 hover:via-purple-500 hover:to-blue-400 text-white font-semibold rounded-lg shadow-lg transition-transform hover:scale-[1.05]"
          >
            Go to Login
          </button>
          <button
            onClick={() => router.push("/")}
            className="px-8 py-3 bg-white/10 backdrop-blur rounded-lg text-white font-semibold hover:bg-white/20 transition"
          >
            Go Home
          </button>
        </motion.div>
      </section>
    </main>
  );
}
