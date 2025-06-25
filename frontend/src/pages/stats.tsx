"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

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

const tableVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: { opacity: 1, height: "auto" },
};

function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() ?? null;
  return null;
}

export default function StatsPage() {
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [fishCounts, setFishCounts] = useState<Record<string, number>>({});
  const [fishRarities, setFishRarities] = useState<Record<string, string>>({});
  const [totalFishCaught, setTotalFishCaught] = useState(0);
  const [crabCount, setCrabCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [crabLoading, setCrabLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [crabError, setCrabError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"count" | "rarity" | "alphabetical">(
    "count"
  );
  const [asc, setAsc] = useState(false);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    const idFromCookie = getCookie("fishUserId");
    if (!idFromCookie) {
      router.replace("/login");
      return;
    }
    setUserId(idFromCookie);
  }, [router]);

  useEffect(() => {
    if (!userId) return;

    const fetchFishData = async () => {
      try {
        setLoading(true);
        const fishRes = await fetch(
          `https://api.tracker.458011.xyz/get/fish?id=${userId}`
        );
        const fishData = await fishRes.json();
        if (!Array.isArray(fishData.fish)) throw new Error("Invalid fish data");

        // Capitalize first letter of username from API response
        setUsername(
          fishData.user
            ? fishData.user.charAt(0).toUpperCase() + fishData.user.slice(1)
            : null
        );

        const counts: Record<string, number> = {};
        const rarities: Record<string, string> = {};
        fishData.fish.forEach((entry: FishEntry) => {
          counts[entry.name] = (counts[entry.name] || 0) + 1;
          rarities[entry.name] = entry.rarity;
        });

        setFishCounts(counts);
        setFishRarities(rarities);
        setTotalFishCaught(fishData.fish.length);
        setError(null);
      } catch (e: any) {
        setError(e.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    const fetchCrabData = async () => {
      try {
        setCrabLoading(true);
        const crabRes = await fetch(
          `https://api.tracker.458011.xyz/get/crab?id=${userId}`
        );
        const crabData = await crabRes.json();
        if (!Array.isArray(crabData.crabs))
          throw new Error("Invalid crab data");
        setCrabCount(crabData.crabs.length);
        setCrabError(null);
      } catch (e: any) {
        setCrabError(e.message || "Unknown error");
      } finally {
        setCrabLoading(false);
      }
    };

    fetchFishData();
    fetchCrabData();
  }, [userId]);

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

  const fishCountByRarity = Object.entries(fishRarities).reduce<
    Record<string, number>
  >((acc, [name, rarity]) => {
    if (name.toLowerCase() === "crab") return acc;
    const key = rarity.toLowerCase();
    acc[key] = (acc[key] || 0) + fishCounts[name];
    return acc;
  }, {});

  if (!userId) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0f0f11] to-[#1a1a1d] text-white p-4 font-sans">
        <p className="text-lg text-neutral-400">Redirecting to login...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0f0f11] to-[#1a1a1d] p-8 text-white font-sans pt-16">
      <section className="max-w-6xl mx-auto space-y-12">
        <header className="text-center space-y-3">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-5xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 text-transparent bg-clip-text"
          >
            {username ? `${username}'s Fish Tracker` : "Fish Tracker"}
          </motion.h1>
          <p className="text-neutral-400 text-sm">
            Live fish stats with sorting and filtering
          </p>
        </header>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <input
            type="search"
            placeholder="Search fish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:flex-grow bg-neutral-900 border border-neutral-700 rounded-xl px-5 py-3 text-sm placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />

          <div className="flex items-center gap-4 md:ml-8">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-sm cursor-pointer transition"
            >
              <option value="count">Sort by Count</option>
              <option value="rarity">Sort by Rarity</option>
              <option value="alphabetical">Sort Alphabetically</option>
            </select>
            <button
              onClick={() => setAsc(!asc)}
              className="px-6 py-3 min-w-[80px] text-sm border border-neutral-700 rounded-xl hover:bg-neutral-700 transition"
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

        <div className="text-center space-y-2">
          <p className="text-lg font-semibold">
            Total Fish Caught:{" "}
            <span className="text-blue-400">{totalFishCaught}</span>
          </p>
          <p className="text-lg font-semibold">
            Total Unique Fish Caught:{" "}
            <span className="text-green-400">{uniqueFishCount}</span>
          </p>
          <button
            onClick={() => setShowStats(!showStats)}
            className="mt-2 text-sm text-blue-400 hover:underline inline-flex items-center"
          >
            {showStats ? "Hide Rarity Summary" : "Show Rarity Summary"}
            <span
              className={`ml-2 transition-transform ${
                showStats ? "rotate-180" : ""
              }`}
            >
              ▲
            </span>
          </button>
        </div>

        <AnimatePresence>
          {showStats && (
            <motion.table
              key="rarity-table"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={tableVariants}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="w-full mt-4 text-left text-sm text-white rounded-2xl overflow-hidden shadow-md bg-neutral-800/80 border border-neutral-700 backdrop-blur-md"
            >
              <thead className="bg-neutral-700/90">
                <tr>
                  <th className="px-6 py-3 border-b border-neutral-600 capitalize">
                    Rarity
                  </th>
                  <th className="px-6 py-3 border-b border-neutral-600">
                    Caught Count
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(fishCountByRarity).map(([rarity, count]) => (
                  <tr
                    key={rarity}
                    className="even:bg-neutral-800/70 odd:bg-neutral-800/50 transition hover:bg-neutral-700/50"
                  >
                    <td className="px-6 py-2 capitalize">{rarity}</td>
                    <td className="px-6 py-2">{count}</td>
                  </tr>
                ))}
              </tbody>
            </motion.table>
          )}
        </AnimatePresence>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
        >
          <motion.div
            key="crab-card"
            variants={cardVariants}
            whileHover="hover"
            className="bg-gradient-to-br from-yellow-800/30 to-yellow-900/60 border border-yellow-700/50 backdrop-blur-lg p-6 rounded-3xl shadow-md flex flex-col items-center"
          >
            <Image
              src="/crab.png"
              alt="Crab"
              width={72}
              height={72}
              className="mb-4"
            />
            <h2 className="text-2xl font-semibold text-yellow-300 mb-1">
              Crab
            </h2>
            <p className="italic tracking-wide font-semibold text-yellow-400">
              Rarity: ???
            </p>
            {crabLoading ? (
              <p className="text-yellow-300 mt-2 text-sm font-medium">
                Loading...
              </p>
            ) : crabError ? (
              <p className="text-red-500 mt-2 text-xs text-center">
                {crabError}
              </p>
            ) : (
              <p className="text-yellow-400 mt-2 text-sm font-medium">
                Caught: {crabCount}
              </p>
            )}
          </motion.div>

          {/* Fish Cards */}
          {fishList.map(([name, count]) => {
            const rarity = fishRarities[name]?.toLowerCase() || "unknown/other";
            return (
              <motion.div
                key={name}
                variants={cardVariants}
                whileHover="hover"
                className="bg-gradient-to-br from-blue-900/30 to-purple-900/60 border border-white/20 backdrop-blur-lg p-6 rounded-3xl shadow-md flex flex-col items-center"
              >
                <Image
                  src={getFishImage(rarity)}
                  alt={name}
                  width={72}
                  height={72}
                  className="mb-4"
                />
                <h2 className="text-2xl font-semibold text-center mb-1">
                  {name}
                </h2>
                <p className="italic tracking-wide font-semibold text-blue-400 capitalize">
                  Rarity: {rarity}
                </p>
                <p className="mt-2 text-sm text-neutral-300 font-medium">
                  Caught: {count}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>
    </main>
  );
}
