"use client";

import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0f0f11] to-[#1a1a1d] text-white font-sans">

      <section className="max-w-6xl mx-auto px-6 py-16 space-y-24">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 text-transparent bg-clip-text">
            CosmosMC Fish Tracker
          </h1>
          <p className="text-lg mt-4 text-neutral-400 max-w-2xl mx-auto">
            A powerful full-stack app to track, sort, and visualize your catches on the{" "}
            <a href="https://cosmosmc.org" target="_blank" className="text-blue-400 underline">
              CosmosMC Minecraft server
            </a>. Built with Next.js, TailwindCSS, Node.js, and MongoDB.
          </p>
        </motion.div>

        <Section title="Key Features" />

        <motion.div
          className="grid gap-8 md:grid-cols-2"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ staggerChildren: 0.2 }}
        >
          {features.map((f, i) => (
            <FeatureCard key={i} {...f} />
          ))}
        </motion.div>

        <Section title="Fish Rarity Tiers" />
        <RarityTable />

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center text-sm text-neutral-500 pt-12"
        >
          Not affiliated with CosmosMC. Built by Petar.{" "}
          <a href="https://discord.gg/Uah2dNRhFV" className="text-blue-400 underline" target="_blank">
            Join the Discord →
          </a>
        </motion.div>
      </section>
    </main>
  );
}

const features = [
  {
    title: "Desktop Logger",
    content:
      "Parses Lunar Client logs to detect fish and crab catches. AES-128 Fernet encryption in real time.",
  },
  {
    title: "Backend API",
    content:
      "Secure endpoints to receive, decrypt, and store fishing logs using Express and MongoDB.",
  },
  {
    title: "Frontend Viewer",
    content:
      "Search, filter, and view stats in real time. Includes user summaries and secure login/logout.",
  },
  {
    title: "Security First",
    content:
      "Zero plain-text token storage. Fully encrypted from log to backend using Fernet.",
  },
];

function FeatureCard({ title, content }: { title: string; content: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="rounded-xl border border-white/10 p-6 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur shadow-xl hover:scale-[1.02] transition-transform duration-300"
    >
      <h3 className="text-xl font-semibold mb-2 text-blue-300">{title}</h3>
      <p className="text-neutral-300 text-sm">{content}</p>
    </motion.div>
  );
}

function Section({ title }: { title: string }) {
  return (
    <motion.div
      className="flex items-center gap-4 justify-center"
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <div className="h-px w-12 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
      <h2 className="text-2xl font-bold text-blue-300">{title}</h2>
      <div className="h-px w-12 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500" />
    </motion.div>
  );
}

function RarityTable() {
  const rows = [
    ["7", "Mythical", "INSANE CATCH!", "Ultra rare / top-tier new fish", "bg-gradient-to-r from-purple-600 to-pink-500"],
    ["6", "Platinum", "LEGENDARY CATCH!", "Very rare / exceptional new fish", "bg-gradient-to-r from-blue-400 to-cyan-500"],
    ["4", "Diamond", "EPIC CATCH!", "Rare / high-tier new fish", "bg-gradient-to-r from-cyan-400 to-indigo-500"],
    ["3", "Gold", "GREAT CATCH!", "Above average / mid-tier new fish", "bg-gradient-to-r from-yellow-400 to-amber-500"],
    ["2", "Silver", "NICE CATCH!", "Uncommon / low-mid new fish", "bg-gradient-to-r from-gray-400 to-slate-500"],
    ["1", "Bronze", "GOOD CATCH!", "Common / basic new fish", "bg-gradient-to-r from-amber-600 to-orange-600"],
    ["5", "Default", "You caught a <Fish>", "Normal catch or unknown rarity", "bg-white/10"],
  ];

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      transition={{ staggerChildren: 0.1 }}
      className="overflow-x-auto rounded-xl border border-white/10 shadow-md"
    >
      <motion.table className="min-w-full text-sm bg-white/5 text-left">
        <thead className="text-blue-300 text-xs bg-white/10 uppercase">
          <tr>
            <th className="px-4 py-3">Tier</th>
            <th className="px-4 py-3">Rarity</th>
            <th className="px-4 py-3">Log Prefix</th>
            <th className="px-4 py-3">Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([tier, rarity, prefix, desc, color], i) => (
            <motion.tr
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="border-t border-white/10 hover:bg-white/10 transition"
            >
              <td className="px-4 py-2">{tier}</td>
              <td className="px-4 py-2">
                <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${color}`}>
                  {rarity}
                </span>
              </td>
              <td className="px-4 py-2 font-mono text-green-300">{prefix}</td>
              <td className="px-4 py-2 text-neutral-300">{desc}</td>
            </motion.tr>
          ))}
        </tbody>
      </motion.table>
    </motion.div>
  );
}
