"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";

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
  const searchParams = useSearchParams();

  const [username, setUsername] = useState<string | null>(null);
  const [fishCounts, setFishCounts] = useState<Record<string, number>>({});
  const [fishRarities, setFishRarities] = useState<Record<string, string>>({});
  const [totalFish, setTotalFish] = useState(0);
  const [crabCount, setCrabCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [crabLoading, setCrabLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [crabError, setCrabError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"count" | "rarity" | "alphabetical">("count");
  const [asc, setAsc] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [gamemode, setGamemode] = useState("earth");
  const [fishMessage, setFishMessage] = useState<string | null>(null);
  const [crabMessage, setCrabMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (!username) return;
    const shareUrl = `${window.location.origin}/stats?username=${username}`;
    if (navigator.share) {
      await navigator.share({
        title: `${username}'s Fish Tracker`,
        url: shareUrl,
      });
    } else {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    const usernameFromParam = searchParams.get('username');
    const nameFromCookie = getCookie("fishUsername");
    const finalUsername = usernameFromParam || nameFromCookie;
    if (!finalUsername) {
      router.replace("/login");
      return;
    }
    setUsername(finalUsername);
  }, [router, searchParams]);

  useEffect(() => {
    if (!username) return;

    const fetchFishData = async () => {
      try {
        setLoading(true);
        const fishRes = await fetch(
          `https://api.tracker.petarmc.com/get/fish?name=${username}&gamemode=${gamemode}`,
          {
            headers: { "x-api-key": process.env.API_KEY || "" },
          }
        );
        const fishData = await fishRes.json();
        if (fishData.message) {
          setFishCounts({});
          setFishRarities({});
          setTotalFish(0);
          setFishMessage(fishData.message);
          setError(null);
        } else {
          if (!Array.isArray(fishData.fish)) throw new Error("Invalid fish data");

          const counts: Record<string, number> = {};
          const rarities: Record<string, string> = {};
          fishData.fish.forEach((entry: FishEntry) => {
            counts[entry.name] = (counts[entry.name] || 0) + 1;
            rarities[entry.name] = entry.rarity;
          });

          setFishCounts(counts);
          setFishRarities(rarities);
          setTotalFish(fishData.fish.length);
          setFishMessage(null);
          setError(null);
        }
      } catch (e: any) {
        setError(e.message || "Unknown error");
        setFishMessage(null);
      } finally {
        setLoading(false);
      }
    };

    const fetchCrabData = async () => {
      try {
        setCrabLoading(true);
        const crabRes = await fetch(
          `https://api.tracker.petarmc.com/get/crab?name=${username}&gamemode=${gamemode}`,
          {
            headers: { "x-api-key": process.env.API_KEY || "" },
          }
        );
        const crabData = await crabRes.json();
        if (crabData.message) {
          setCrabCount(0);
          setCrabMessage(crabData.message);
          setCrabError(null);
        } else {
          if (!Array.isArray(crabData.crabs))
            throw new Error("Invalid crab data");
          setCrabCount(crabData.crabs.length);
          setCrabMessage(null);
          setCrabError(null);
        }
      } catch (e: any) {
        setCrabError(e.message || "Unknown error");
        setCrabMessage(null);
      } finally {
        setCrabLoading(false);
      }
    };

    fetchFishData();
    fetchCrabData();
  }, [username, gamemode]);

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

  const uniqueFish = Object.keys(fishCounts).filter((n) => n.toLowerCase() !== "crab").length;

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

  if (!username) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0f0f11] to-[#1a1a1d] text-white p-4 font-sans">
        <p className="text-lg text-neutral-400">Redirecting to login...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0f0f11] to-[#1a1a1d] p-8 text-white font-sans">
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
          <button
            onClick={handleShare}
            className="mt-2 px-4 py-2 text-sm border border-neutral-700 rounded-xl hover:bg-neutral-700 transition text-white"
          >
            Share Stats
          </button>
          {copied && (
            <p className="mt-2 text-green-400 text-sm">Link copied to clipboard!</p>
          )}
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
              value={gamemode}
              onChange={(e) => setGamemode(e.target.value)}
              className="bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-sm cursor-pointer transition"
            >
              <option value="earth">Earth</option>
              <option value="factions">Factions</option>
              <option value="oneblock">Oneblock</option>
              <option value="survival">Survival</option>
              <option value="boxsmp">Box SMP</option>
            </select>
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
              {sortBy === "alphabetical" ? (asc ? "A-Z ↑" : "Z-A ↓") : (asc ? "Asc ↑" : "Desc ↓")}
            </button>
          </div>
        </div>

        {fishMessage && (
          <div className="text-center mt-4 p-3 bg-blue-900/20 border border-blue-700 rounded-lg">
            <p className="text-blue-300">{fishMessage}</p>
          </div>
        )}

        {error && (
          <div className="text-center mt-4 p-3 bg-red-900/20 border border-red-700 rounded-lg">
            <p className="text-red-300">{error}</p>
            {error === "NetworkError when attempting to fetch resource." && (
              <p className="mt-2 text-sm text-neutral-300">
                The API might be down.
                For more info go to <a href="https://status.petarmc.com" className="underline text-blue-400 hover:text-blue-300">https://status.petarmc.com</a> <br/>
                If the API isnt down please contact the owner or open an <a href="https://github.com/PetarMc1/fish-tracker/issues" className="underline text-blue-400 hover:text-blue-300">issue</a>.
              </p>
            )}
          </div>
        )}

        <div className="text-center space-y-2">
          <p className="text-lg font-semibold">
            Total Fish Caught: <span className="text-blue-400">{totalFish}</span>
          </p>
          <p className="text-lg font-semibold">
            Total Unique Fish Caught: <span className="text-green-400">{uniqueFish}</span>
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
                {[
                  "bronze",
                  "silver",
                  "gold",
                  "diamond",
                  "platinum",
                  "mythical",
                  "unknown/other",
                ].map((rarity) => (
                  <tr
                    key={rarity}
                    className="even:bg-neutral-800/70 odd:bg-neutral-800/50 transition hover:bg-neutral-700/50"
                  >
                    <td className="px-6 py-2 capitalize">
                      {rarity === "unknown/other" ? "Unknown/Other" : rarity}
                    </td>
                    <td className="px-6 py-2">
                      {Object.entries(fishRarities).filter(([name, r]) => r.toLowerCase() === rarity && name.toLowerCase() !== "crab").reduce((sum, [name]) => sum + fishCounts[name], 0)}
                    </td>
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
            className={`bg-gradient-to-br ${crabMessage ? 'from-red-800/30 to-red-900/60 border border-red-700/50' : 'from-yellow-800/30 to-yellow-900/60 border border-yellow-700/50'} backdrop-blur-lg p-6 rounded-3xl shadow-md flex flex-col items-center`}
          >
            <Image
              src="/crab.png"
              alt="Crab"
              width={72}
              height={72}
              className="mb-4"
            />
            <h2 className={`text-2xl font-semibold mb-1 ${crabMessage ? 'text-red-300' : 'text-yellow-300'}`}>
              Crab
            </h2>
            <p className={`italic tracking-wide font-semibold ${crabMessage ? 'text-red-400' : 'text-yellow-400'}`}>
              Rarity: ???
            </p>
            {crabLoading ? (
              <p className={`mt-2 text-sm font-medium ${crabMessage ? 'text-red-300' : 'text-yellow-300'}`}>
                Loading...
              </p>
            ) : crabError ? (
              <p className="text-red-500 mt-2 text-xs text-center">
                {crabError}
              </p>
            ) : crabMessage ? (
              <p className={`mt-2 text-sm font-medium ${crabMessage ? 'text-red-300' : 'text-yellow-300'}`}>
                {crabMessage}
              </p>
            ) : (
              <p className="text-yellow-400 mt-2 text-sm font-medium">
                Caught: {crabCount}
              </p>
            )}
          </motion.div>

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
