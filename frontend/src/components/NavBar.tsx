"use client";

import { useEffect, useState, useRef } from "react";
import { FiLogIn, FiUser } from "react-icons/fi";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkLogin = () => {
      const id = Cookies.get("fishUserId") || null;
      setUserId(id);
      setIsLoggedIn(!!id);
    };

    checkLogin();
    window.addEventListener("storage", checkLogin);
    return () => window.removeEventListener("storage", checkLogin);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const id = Cookies.get("fishUserId") || null;
      setUserId(id);
      setIsLoggedIn(!!id);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close menu if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const handleLogout = () => {
    Cookies.remove("fishUserId");
    setUserId(null);
    setIsLoggedIn(false);
    setMenuOpen(false);
    router.push("/logged-out");
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur bg-[#0f0f11]/80">
      <div className="flex items-center justify-between py-4 px-6 max-w-6xl mx-auto">
        <button
          onClick={() => router.push("/")}
          className="text-2xl font-bold text-white select-none hover:text-blue-400 transition-colors duration-300"
        >
          Fish Logger
        </button>

        {!isLoggedIn ? (
          <button
            onClick={() => router.push("/login")}
            className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors duration-300"
            aria-label="Login"
          >
            <FiLogIn size={20} />
            <span>Login</span>
          </button>
        ) : (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors duration-300 focus:outline-none"
              aria-haspopup="true"
              aria-expanded={menuOpen}
              aria-label="Account menu"
            >
              <FiUser size={20} />
              <span>Account</span>
              <svg
                className={`w-4 h-4 ml-1 transition-transform duration-200 ${
                  menuOpen ? "rotate-180" : "rotate-0"
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {menuOpen && (
              <ul className="absolute right-0 mt-2 w-48 bg-neutral-900 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                <li className="px-4 py-2 text-sm text-neutral-400 select-text break-all">
                  <span className="font-semibold text-white">User ID:</span> {userId}
                </li>
                <li>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      router.push("/stats");
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-blue-600 transition-colors"
                  >
                    Dashboard
                  </button>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-red-600 transition-colors"
                  >
                    Logout
                  </button>
                </li>
              </ul>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
