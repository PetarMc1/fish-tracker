"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface FishEntry {
  name: string;
  rarity: string;
}

const rarityRank: Record<string, number> = {
  mythical: 6,
  platinum: 5,
  diamond: 4,
  gold: 3,
  silver: 2,
  bronze: 1,
  "unknown/other": 0,
};

const rarityColors: Record<string, string> = {
  bronze: "#cd7f32",
  silver: "#c0c0c0",
  gold: "#ffd700",
  platinum: "#ff4c4c",
  mythical: "#d8b4fe",
  diamond: "#6ee7b7",
  "unknown/other": "#999999",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
  hover: { scale: 1.05, boxShadow: "0 8px 20px rgba(59, 130, 246, 0.4)" },
};

export default function FishPage() {
  const [enteredId, setEnteredId] = useState("");
  const [confirmedId, setConfirmedId] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  const [fishCounts, setFishCounts] = useState<Record<string, number>>({});
  const [fishRarities, setFishRarities] = useState<Record<string, string>>({});
  const [totalFishCaught, setTotalFishCaught] = useState(0);
  const [crabCount, setCrabCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"count" | "rarity" | "alphabetical">(
    "count"
  );
  const [asc, setAsc] = useState(false);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    const savedId = localStorage.getItem("fishUserId");
    if (savedId) setConfirmedId(savedId);
  }, []);

  useEffect(() => {
    if (!confirmedId) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const fishRes = await fetch(
          `https://api.tracker.458011.xyz/get/fish?id=${confirmedId}`
        );
        const fishData = await fishRes.json();
        if (!Array.isArray(fishData.fish)) throw new Error("Invalid fish data");

        const counts: Record<string, number> = {};
        const rarities: Record<string, string> = {};
        fishData.fish.forEach((entry: FishEntry) => {
          counts[entry.name] = (counts[entry.name] || 0) + 1;
          rarities[entry.name] = entry.rarity;
        });

        setFishCounts(counts);
        setFishRarities(rarities);
        setTotalFishCaught(fishData.fish.length);

        const crabRes = await fetch(
          `https://api.tracker.458011.xyz/get/crab?id=${confirmedId}`
        );
        const crabData = await crabRes.json();
        if (!Array.isArray(crabData.crabs))
          throw new Error("Invalid crab data");
        setCrabCount(crabData.crabs.length);
        setError(null);
      } catch (e: any) {
        setError(e.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [confirmedId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedId = enteredId.trim();
    if (trimmedId) {
      if (rememberMe) {
        localStorage.setItem("fishUserId", trimmedId);
      }
      setConfirmedId(trimmedId);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("fishUserId");
    setConfirmedId(null);
    setEnteredId("");
    setRememberMe(false);
  };

  const getFishImage = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case "bronze":
        return "/fish.png";
      case "silver":
        return "/fish2.png";
      case "gold":
        return "/fish3.png";
      case "diamond":
        return "/fish4.png";
      case "platinum":
        return "/fish5.png";
      case "mythical":
        return "/fish6.png";
      default:
        return "/none.png";
    }
  };

  const rarityTotals: Record<string, number> = {};
  Object.entries(fishCounts).forEach(([name, count]) => {
    const rarity = fishRarities[name]?.toLowerCase() || "unknown/other";
    rarityTotals[rarity] = (rarityTotals[rarity] || 0) + count;
  });

  const uniqueFishCount = Object.keys(fishCounts).filter(
    (n) => n.toLowerCase() !== "crab"
  ).length;

  const fishList = Object.entries(fishCounts)
    .filter(
      ([name]) =>
        name.toLowerCase() !== "crab" &&
        name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "count") {
        return asc ? a[1] - b[1] : b[1] - a[1];
      } else if (sortBy === "rarity") {
        const aR =
          rarityRank[fishRarities[a[0]]?.toLowerCase() || "unknown/other"];
        const bR =
          rarityRank[fishRarities[b[0]]?.toLowerCase() || "unknown/other"];
        return aR === bR
          ? asc
            ? a[1] - b[1]
            : b[1] - a[1]
          : asc
          ? aR - bR
          : bR - aR;
      } else {
        return asc ? a[0].localeCompare(b[0]) : b[0].localeCompare(a[0]);
      }
    });

  if (!confirmedId) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-black text-white p-4">
        <form
          onSubmit={handleSubmit}
          className="bg-neutral-800 p-6 rounded-2xl shadow-md space-y-4 w-full max-w-md text-center"
        >
          <h1 className="text-2xl font-bold mb-2">Enter Access ID</h1>
          <input
            type="text"
            placeholder="Enter ID..."
            value={enteredId}
            onChange={(e) => setEnteredId(e.target.value)}
            className="w-full bg-neutral-700 border border-neutral-600 rounded-lg px-4 py-2 text-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="flex items-center justify-start gap-2 text-sm text-neutral-300">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
              className="w-4 h-4"
            />
            <label>Remember Me</label>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition"
          >
            Submit
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-black to-neutral-900 p-8 text-white font-sans">
      <button
        onClick={handleLogout}
        className="fixed top-4 right-4 px-4 py-2 text-sm bg-red-600 hover:bg-red-500 rounded-lg transition"
      >
        Logout
      </button>

      <div className="max-w-7xl mx-auto space-y-12">
        <header className="text-center space-y-3">
          <h1 className="text-5xl font-extrabold tracking-tight">
            Petar&apos;s Fish
          </h1>
          <p className="text-neutral-400 text-sm">Live fish stats</p>
        </header>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <input
            type="search"
            placeholder="Search fish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:flex-grow bg-neutral-800 border border-neutral-700 rounded-xl px-5 py-3 text-sm placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />

          <div className="flex items-center gap-4 md:ml-8">
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "count" | "rarity" | "alphabetical")
              }
              className="bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-sm cursor-pointer transition"
            >
              <option value="count">Sort by Count</option>
              <option value="rarity">Sort by Rarity</option>
              <option value="alphabetical">Sort Alphabetically</option>
            </select>

            <button
              onClick={() => setAsc(!asc)}
              aria-label="Toggle sort order"
              className="px-6 py-3 min-w-[80px] text-sm border border-neutral-700 rounded-xl hover:bg-neutral-700 transition cursor-pointer"
            >
              {sortBy === "alphabetical"
                ? asc
                  ? "A-Z ↑"
                  : "Z-A ↓"
                : asc
                ? "Asc ↑"
                : "Desc ↓"}
            </button>
          </div>
        </div>

        <div className="text-center space-y-1">
          <p className="text-lg font-semibold">
            Total Fish Caught:{" "}
            <span className="text-blue-400">{totalFishCaught}</span>
          </p>
          <p className="text-lg font-semibold">
            Total Unique Fish Caught:{" "}
            <span className="text-green-400">{uniqueFishCount}</span>
          </p>
        </div>

        {showStats && (
          <div className="max-w-md mx-auto mt-4 bg-white/10 border border-white/20 backdrop-blur-lg p-6 rounded-3xl shadow-md select-text">
            <h3 className="text-xl font-semibold mb-4 text-center">
              Fish Caught by Rarity
            </h3>
            <ul className="space-y-2">
              {Object.entries(rarityTotals)
                .sort((a, b) => rarityRank[b[0]] - rarityRank[a[0]])
                .map(([rarity, count]) => (
                  <li
                    key={rarity}
                    className="flex justify-between"
                    style={{ color: rarityColors[rarity] || "#999999" }}
                  >
                    <span className="capitalize">{rarity}</span>
                    <span>{count}</span>
                  </li>
                ))}
            </ul>
          </div>
        )}

        <p
          onClick={() => setShowStats(!showStats)}
          className="cursor-pointer select-none mt-6 text-center text-gray-400 hover:text-gray-200 transition-colors duration-300 font-semibold"
        >
          {showStats ? "Show less ↑" : "Show more ↓"}
        </p>

        {loading && (
          <p className="text-center text-neutral-400 text-lg mt-6">
            Loading fish data...
          </p>
        )}
        {error && (
          <p className="text-center text-red-500 text-lg mt-6">
            Error: {error}
          </p>
        )}

        {!loading && !error && (
          <>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-8"
            >
              <motion.div
                variants={cardVariants}
                whileHover="hover"
                className="bg-white/10 border border-white/20 backdrop-blur-lg p-6 rounded-3xl shadow-md"
              >
                <Image
                  src="/crab.png"
                  alt="Crab"
                  width={72}
                  height={72}
                  className="mx-auto mb-4"
                />
                <h2 className="text-2xl font-semibold text-center mb-1">
                  Crab
                </h2>
                <p className="text-center text-neutral-400 text-sm">
                  Rarity: ???
                </p>
                <p className="text-center mt-2 text-sm text-neutral-300 font-medium">
                  Caught: {crabCount}
                </p>
              </motion.div>

              <AnimatePresence>
                {fishList.map(([name, count]) => {
                  const rarity = fishRarities[name] || "Unknown/Other";
                  const color = rarityColors[rarity.toLowerCase()] || "#999999";
                  return (
                    <motion.div
                      key={name}
                      variants={cardVariants}
                      whileHover="hover"
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      className="bg-white/10 border border-white/20 backdrop-blur-lg p-6 rounded-3xl shadow-md"
                    >
                      <Image
                        src={getFishImage(rarity)}
                        alt={name}
                        width={72}
                        height={72}
                        className="mx-auto mb-4"
                      />
                      <h2 className="text-2xl font-semibold text-center mb-1">
                        {name}
                      </h2>
                      <p
                        className="text-center italic tracking-wide font-semibold"
                        style={{ color }}
                      >
                        Rarity: {rarity}
                      </p>
                      <p className="text-center mt-2 text-sm text-neutral-300 font-medium">
                        Caught: {count}
                      </p>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>

            <p className="text-center text-xs text-neutral-500 italic mt-10 max-w-md mx-auto">
              *Unknown/Other means the fish isn&apos;t in the known list yet.
              Contact the site owner to add it.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
