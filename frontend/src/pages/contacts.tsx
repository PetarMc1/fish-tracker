"use client";

import { motion } from "framer-motion";

export default function Contacts() {
  return (
    <main className="min-h-screen text-white font-sans">
      <section className="max-w-6xl mx-auto px-6 space-y-12 pt-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-4xl font-extrabold text-blue-300">Contact</h1>
          <p className="mt-4 text-neutral-400 max-w-2xl mx-auto">
            For questions, feedback, or support please email:
          </p>
          <a
            href="mailto:fishtracker@ptrmc.net"
            className="mt-4 inline-block text-blue-400 underline font-medium"
          >
            fishtracker@ptrmc.net
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="max-w-xl mx-auto text-center text-neutral-400"
        >
          <p>
            If you prefer, you can also reach out on the project documentation or join the Discord linked from the homepage.
          </p>
        </motion.div>
      </section>
    </main>
  );
}
