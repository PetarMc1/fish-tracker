import React from 'react';
import { motion } from 'framer-motion';

const notFound = () => {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0f0f11] to-[#1a1a1d] text-white font-sans flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="bg-neutral-800 p-8 rounded-2xl shadow-xl w-full max-w-md text-center space-y-6"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 text-transparent bg-clip-text">
          404 - Page Not Found
        </h1>
        <p className="text-neutral-400">
          The page you are looking for does not exist.
        </p>
        <a
          href="/"
          className="inline-block px-5 py-2 border border-blue-400 rounded-full text-blue-400 font-semibold hover:bg-blue-400 hover:text-black transition"
        >
          Go back to home
        </a>
      </motion.div>
    </main>
  );
};

export default notFound;