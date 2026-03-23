"use client";
import { useState } from "react";
import Link from "next/link";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Verify Job", href: "/verify" },
  { name: "Prepare", href: "/prepare" },
  { name: "Mock Interview", href: "/interview" },
  { name: "History", href: "/history" },
];

export default function Navbar() {
  const [active, setActive] = useState("Home");

  return (
    <nav className="bg-white border-b border-gray-100 px-6 h-16 flex items-center justify-between sticky top-0 z-50">

      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">H</span>
          </div>
          <span className="text-gray-900 font-semibold text-lg">
            Hire<span className="text-blue-600">App</span>
          </span>
        </Link>

        <div className="flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setActive(link.name)}
              className={`px-4 py-2 rounded-full text-sm transition-all duration-200
                ${active === link.name
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-green-50 text-green-700 text-xs px-3 py-1.5 rounded-full">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
          AI Ready
        </div>
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium cursor-pointer">
          BB
        </div>
      </div>
    </nav>
  );
}