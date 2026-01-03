"use client";

import { motion } from "framer-motion";

const FishTrackerMod: React.FC = () => {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0f0f11] to-[#1a1a1d] text-white font-sans">
      <div className="max-w-4xl mx-auto px-6 space-y-16">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 text-transparent bg-clip-text">
            Fish Tracker Mod
          </h1>
          <p className="text-base sm:text-lg mt-4 text-neutral-400 max-w-2xl mx-auto">
            A Minecraft Fabric mod that automatically logs your catches on CosmosMc and securely
            sends the data to the API.
          </p>
        </motion.header>

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold mb-4">Overview</h2>
          <p className="text-neutral-300 leading-relaxed">
            FishTracker is designed to track what you fish on the CosmosMc server by
            automatically logging your catches. It parses in-game chat messages to detect fish catches,
            including their rarity, and securely transmits this data to the API using encryption.
          </p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold mb-4">Key Benefits</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-neutral-300">
            <li className="flex items-start gap-3">
              <span className="text-blue-400 mt-1">•</span>
              <div>
                <strong className="text-white">Seamless Tracking:</strong> No manual logging required; the
                mod handles everything automatically.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 mt-1">•</span>
              <div>
                <strong className="text-white">Secure Data Transmission:</strong> Uses Fernet encryption to
                protect your data.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 mt-1">•</span>
              <div>
                <strong className="text-white">Debug Support:</strong> Enable debug mode for troubleshooting.
              </div>
            </li>
          </ul>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold mb-4">Downloads</h2>
          <ul className="space-y-3 text-neutral-300">
            <li className="flex items-center gap-2">
              <span className="text-blue-400">•</span>
              <span>Modrinth (Coming Soon)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-blue-400">•</span>
              <a
                href="https://github.com/PetarMc1/fish-tracker-mod/releases"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline decoration-blue-400/30 hover:decoration-blue-300 transition-all"
              >
                GitHub Releases Page
              </a>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-blue-400">•</span>
              <a
                href="https://ci.petarmc.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline decoration-blue-400/30 hover:decoration-blue-300 transition-all"
              >
                Latest Commit Build (ci.petarmc.com)
              </a>
            </li>
          </ul>
        </motion.section>

        <motion.section className="text-center" initial={{ opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
          <p className="text-neutral-300 mb-6 max-w-xl mx-auto">
            For installation steps, configuration details, and full usage instructions, see the official
            documentation.
          </p>
          <a
            href="https://docs.petarmc.com/fish-tracker/mod"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-full text-white font-semibold transition transform hover:scale-105"
          >
            Read Full Documentation →
          </a>
        </motion.section>
      </div>
    </main>
  );
};

export default FishTrackerMod;
