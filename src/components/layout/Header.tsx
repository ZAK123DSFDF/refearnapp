"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { OrgHeader } from "@/components/ui-custom/OrgHeader"

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 py-4 px-3 transition-all duration-300 ease-in-out",
        isScrolled ? "bg-white/80 backdrop-blur-md shadow-sm" : "bg-transparent"
      )}
    >
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <OrgHeader affiliate={false} isPreview={false} />

        {/* Desktop Navigation: Only show on lg+ */}
        <nav className="hidden lg:flex space-x-8">
          <a href="#features" className="nav-link">
            Features
          </a>
          <a href="#how-it-works" className="nav-link">
            How It Works
          </a>
          <a href="#testimonials" className="nav-link">
            Testimonials
          </a>
          <a href="#pricing" className="nav-link">
            Pricing
          </a>
        </nav>

        {/* Desktop CTA buttons */}
        <div className="hidden lg:flex items-center space-x-4">
          <Link
            href="/login"
            className="text-foreground/80 hover:text-foreground transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="bg-primary text-primary-foreground px-4 py-2 rounded-full hover:bg-primary/90 transition-colors shadow-sm"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className="lg:hidden p-2 rounded-md hover:bg-muted"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? (
            /* Close Icon */
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          ) : (
            /* Hamburger Icon */
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="4" y1="6" x2="20" y2="6"></line>
              <line x1="4" y1="12" x2="20" y2="12"></line>
              <line x1="4" y1="18" x2="20" y2="18"></line>
            </svg>
          )}
        </button>
      </div>

      {menuOpen && (
        <div
          className={cn(
            "lg:hidden bg-white/90 backdrop-blur-md shadow-md px-6 py-6 space-y-4 rounded-xl mt-3",
            "animate-slide-down"
          )}
        >
          <a
            href="#features"
            className="mobile-link"
            onClick={() => setMenuOpen(false)}
          >
            Features
          </a>

          <a
            href="#how-it-works"
            className="mobile-link"
            onClick={() => setMenuOpen(false)}
          >
            How It Works
          </a>

          <a
            href="#testimonials"
            className="mobile-link"
            onClick={() => setMenuOpen(false)}
          >
            Testimonials
          </a>

          <a
            href="#pricing"
            className="mobile-link"
            onClick={() => setMenuOpen(false)}
          >
            Pricing
          </a>

          <div className="pt-4 border-t border-border flex items-center justify-between gap-4">
            <Link
              href="/login"
              className="mobile-link"
              onClick={() => setMenuOpen(false)}
            >
              Log in
            </Link>

            <Link
              href="/signup"
              className="bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-sm text-sm whitespace-nowrap"
              onClick={() => setMenuOpen(false)}
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
