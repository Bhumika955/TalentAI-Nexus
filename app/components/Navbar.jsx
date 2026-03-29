"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Verify Job", href: "/verify", protected: false },
  { name: "Prepare", href: "/prepare", protected: true },
  { name: "Mock Interview", href: "/interview", protected: true },
  { name: "History", href: "/history", protected: true },
];

export default function Navbar() {
  const [active, setActive] = useState("Home");
  const [dropdown, setDropdown] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const handleLogout = () => {
    logout();
    setDropdown(false);
    router.push("/");
  };

  const handleNavClick = (link) => {
   
    setActive(link.name);
    router.push(link.href);
  };

  return (
    <nav className="bg-white border-b border-gray-100 px-6 h-16 flex items-center justify-between sticky top-0 z-50">

      {/* Left — Logo + Links */}
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">H</span>
          </div>
          <span className="text-gray-900 font-semibold text-lg">
            Hire<span className="text-blue-600">App</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => handleNavClick(link)}
              className={`px-4 py-2 rounded-full text-sm transition-all duration-200
                ${active === link.name
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"}`}
            >
              {link.name}
            </button>
          ))}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">

        {/* AI Status — only when logged in */}
        {user && (
          <div className="hidden sm:flex items-center gap-2 bg-green-50 text-green-700 text-xs px-3 py-1.5 rounded-full">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            AI Ready
          </div>
        )}

        {/* Avatar / Login Button */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setDropdown(!dropdown)}
              className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium cursor-pointer hover:bg-blue-700 transition-all"
            >
              {getInitials(user.name)}
            </button>

            {dropdown && (
              <div className="absolute right-0 top-10 bg-white border border-gray-100 rounded-xl shadow-lg py-2 w-48 z-50">
                <div className="px-4 py-2 border-b border-gray-50">
                  <div className="text-sm font-medium text-gray-800">{user.name}</div>
                  <div className="text-xs text-gray-400 truncate">{user.email}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-all mt-1"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => router.push("/login")}
            className="bg-blue-600 text-white text-xs px-4 py-2 rounded-full hover:bg-blue-700 transition-all"
          >
            Login
          </button>
        )}

      </div>
    </nav>
  );
}