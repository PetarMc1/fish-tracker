"use client";

import { useEffect, useState } from "react";
import { FiLogIn, FiLogOut } from "react-icons/fi";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkLogin = () => {
      const userId = Cookies.get("fishUserId");
      setIsLoggedIn(!!userId);
    };

    checkLogin();
    window.addEventListener("storage", checkLogin);
    return () => window.removeEventListener("storage", checkLogin);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const userId = Cookies.get("fishUserId");
      setIsLoggedIn(!!userId);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleAuthClick = () => {
    if (isLoggedIn) {
      Cookies.remove("fishUserId");
      setIsLoggedIn(false);
      router.push("/login");
    } else {
      router.push("/login");
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur bg-[#0f0f11]/80">
      <div className="flex items-center justify-between py-4 px-6 max-w-6xl mx-auto">
        {/* Make this clickable */}
        <button
          onClick={() => router.push("/")}
          className="text-2xl font-bold text-white select-none hover:text-blue-400 transition-colors duration-300"
        >
          Fish Logger
        </button>

        <button
          onClick={handleAuthClick}
          className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors duration-300"
        >
          {isLoggedIn ? <FiLogOut size={20} /> : <FiLogIn size={20} />}
          <span>{isLoggedIn ? "Logout" : "Login"}</span>
        </button>
      </div>
    </nav>
  );
}
