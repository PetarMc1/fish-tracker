"use client";

import { useEffect, useState, useRef } from "react";
import { FiLogIn, FiUser } from "react-icons/fi";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<string[]>([]);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkLogin = () => {
      const id = Cookies.get("fishUsername") || null;
      setUserName(id);
      setIsLoggedIn(!!id);
      const storedAccounts = localStorage.getItem("fishAccounts");
      if (storedAccounts) {
        setAccounts(JSON.parse(storedAccounts));
      }
    };

    checkLogin();
    window.addEventListener("storage", checkLogin);
    return () => window.removeEventListener("storage", checkLogin);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const id = Cookies.get("fishUsername") || null;
      setUserName(id);
      setIsLoggedIn(!!id);
      const storedAccounts = localStorage.getItem("fishAccounts");
      if (storedAccounts) {
        setAccounts(JSON.parse(storedAccounts));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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
    Cookies.remove("fishUsername");
    setUserName(null);
    setIsLoggedIn(false);
    setMenuOpen(false);
    router.push("/logged-out");
  };

  const handleSwitchAccount = (newUsername: string) => {
    Cookies.set("fishUsername", newUsername, { expires: 365 });
    setUserName(newUsername);
    setMenuOpen(false);
    window.dispatchEvent(new Event("storage"));
    // Reload to update the page with new username
    window.location.reload();
  };

  return (
    <nav className="sticky top-0 w-full z-50 backdrop-blur bg-[#0f0f11]/80">
      <div className="flex items-center justify-between py-4 px-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-6">
          <button
            onClick={() => router.push("/")}
            className="text-2xl font-bold text-white select-none hover:text-blue-400 transition-colors duration-300"
          >
            Fish Tracker
          </button>

          <button
            onClick={() => router.push("/")}
            className="text-white hover:text-blue-400 transition-colors duration-300"
            aria-label="Homepage"
          >
            Home
          </button>

          <button
            onClick={() => router.push("/mod")}
            className="text-white hover:text-blue-400 transition-colors duration-300"
            aria-label="Mod page"
          >
            Mod
          </button>

          <a
            href="https://api.tracker.petarmc.com/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-blue-400 transition-colors duration-300"
            aria-label="API documentation"
          >
            API Docs
          </a>

          <a
            href="https://docs.petarmc.com/fish-tracker"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-blue-400 transition-colors duration-300"
            aria-label="Project documentation"
          >
            Docs
          </a>
        </div>

        <div className="flex items-center gap-6">
          {isLoggedIn && (
            <button
              onClick={() => router.push("/stats")}
              className="text-white hover:text-blue-400 transition-colors duration-300"
              aria-label="Dashboard"
            >
              Dashboard
            </button>
          )}

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
                    <span className="font-semibold text-white">User:</span> {userName}
                  </li>
                  {accounts.length > 1 && (
                    <>
                      <li className="px-4 py-2 text-xs text-neutral-500 uppercase tracking-wide">
                        Switch Accounts
                      </li>
                      {accounts.filter(acc => acc !== userName).map(acc => (
                        <li key={acc}>
                          <button
                            onClick={() => handleSwitchAccount(acc)}
                            className="w-full text-left px-6 py-2 text-sm text-white hover:bg-neutral-700 transition-colors"
                          >
                            {acc}
                          </button>
                        </li>
                      ))}
                    </>
                  )}
                  <li>
                    <button
                      onClick={() => router.push("/login")}
                      className="w-full text-left px-4 py-2 text-sm text-white hover:bg-blue-600 transition-colors"
                    >
                      Add Account
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
      </div>
    </nav>
  );
}
