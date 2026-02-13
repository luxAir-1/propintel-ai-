"use client";

import Link from "next/link";
import { useState } from "react";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 glass-effect border-b border-slate-800 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
              <span className="font-display text-white font-bold">P</span>
            </div>
            <span className="font-display text-xl font-bold text-white hidden sm:inline">
              PropIntel AI
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-12">
            <Link
              href="#features"
              className="text-slate-300 hover:text-teal-400 transition-colors"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="text-slate-300 hover:text-teal-400 transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/docs"
              className="text-slate-300 hover:text-teal-400 transition-colors"
            >
              Docs
            </Link>
          </div>

          {/* CTA */}
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-slate-300 hover:text-teal-400 transition-colors hidden sm:inline"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="btn-primary text-sm"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-slate-300 hover:text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 border-t border-slate-800">
            <div className="flex flex-col gap-4 mt-4">
              <Link href="#features" className="text-slate-300 hover:text-teal-400">
                Features
              </Link>
              <Link href="#pricing" className="text-slate-300 hover:text-teal-400">
                Pricing
              </Link>
              <Link href="/docs" className="text-slate-300 hover:text-teal-400">
                Docs
              </Link>
              <Link href="/login" className="text-slate-300 hover:text-teal-400">
                Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
