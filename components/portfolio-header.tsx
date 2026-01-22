"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { getNavItems, getPersonalInfo } from "@/lib/data"
import { ThemeToggle } from "@/components/theme-toggle"

export function PortfolioHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("")

  const navItems = getNavItems()
  const personalInfo = getPersonalInfo()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)

      const sections = navItems.filter((item) => item.href.startsWith("#")).map((item) => item.href.substring(1))

      for (const section of sections.reverse()) {
        const element = document.getElementById(section)
        if (element) {
          const rect = element.getBoundingClientRect()
          if (rect.top <= 150) {
            setActiveSection(section)
            break
          }
        }
      }

      if (window.scrollY < 100) {
        setActiveSection("")
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [navItems])

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4",
        scrolled ? "bg-background/90 backdrop-blur-md shadow-md py-2 border-b border-border" : "bg-transparent",
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo/Name */}
        <Link href="/" className="flex items-center group">
          <div className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 font-bold text-xl relative overflow-hidden transition-transform duration-300 group-hover:scale-105">
            {personalInfo.name}
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-300 group-hover:w-full"></span>
          </div>
          <span className="text-muted-foreground text-sm ml-2 hidden sm:inline-block transition-all duration-300 group-hover:text-foreground">
            / {personalInfo.title}
          </span>
        </Link>

        {/* Desktop Navigation with Theme Toggle */}
        <div className="hidden md:flex items-center space-x-1">
          <nav className="flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = item.href === "/" ? activeSection === "" : activeSection === item.href.substring(1)

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "px-3 py-2 text-sm relative group transition-all duration-300",
                    isActive ? "text-brand" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <span className="relative z-10">{item.label}</span>
                  <span className="absolute inset-0 bg-orange-500/0 rounded-md group-hover:bg-orange-500/10 transition-all duration-300"></span>
                  <span
                    className={cn(
                      "absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-300 group-hover:w-4/5",
                      isActive && "w-4/5",
                    )}
                  ></span>
                </Link>
              )
            })}
          </nav>
          
          {/* Desktop Theme Toggle - Updated */}
          <div className="ml-4 border-l border-border pl-4">
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile Controls */}
        <div className="md:hidden flex items-center gap-3">
          {/* Mobile Theme Toggle - Updated */}
          <div className="relative z-50">
            <ThemeToggle />
          </div>
          
          {/* Mobile Menu Button Container */}
          <div className="relative">
            <button
              className={cn(
                "animated-menu-button relative overflow-hidden transition-all duration-300",
                mobileMenuOpen && "active"
              )}
              onClick={toggleMobileMenu}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              <span className="menu-icon">
                <span className="menu-bar top-bar"></span>
                <span className="menu-bar middle-bar"></span>
                <span className="menu-bar bottom-bar"></span>
              </span>
            </button>

            {/* Mobile Navigation Menu */}
            <ul className={cn(
              "mobile-nav-menu fixed top-[70px] right-4 z-40 list-none p-4 w-[200px] rounded-lg",
              "bg-card/95 backdrop-blur-md border border-orange-500/20",
              "shadow-xl shadow-orange-500/5",
              mobileMenuOpen 
                ? "opacity-100 translate-x-0 visible" 
                : "opacity-0 translate-x-4 invisible"
            )}>
              {navItems.map((item) => {
                const isActive = item.href === "/" ? activeSection === "" : activeSection === item.href.substring(1)

                return (
                  <li key={item.label} className="border-b border-orange-500/10 last:border-b-0">
                    <Link
                      href={item.href}
                      className={cn(
                        "block py-3 px-2 text-base transition-all duration-300 relative group",
                        isActive 
                          ? "text-brand font-semibold" 
                          : "text-muted-foreground hover:text-foreground hover:pl-3"
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="relative z-10">{item.label}</span>
                      <span className={cn(
                        "absolute left-0 top-1/2 -translate-y-1/2 w-0 h-4/5 bg-gradient-to-b from-orange-400/20 to-red-500/20 rounded-r transition-all duration-300",
                        isActive && "w-1",
                        "group-hover:w-1"
                      )}></span>
                    </Link>
                  </li>
                )
              })}
              
              {/* Theme Toggle in Mobile Menu (optional) */}
              <li className="border-t border-orange-500/10 mt-3 pt-3">
                <div className="flex items-center justify-between px-2">
                  <span className="text-muted-foreground text-sm">Theme</span>
                  <div className="scale-90">
                    <ThemeToggle />
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Global styles for the animated menu */}
      <style jsx global>{`
        /* Menu Button Base Styles */
        .animated-menu-button {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgb(249 115 22 / 0.1) 0%, rgb(239 68 68 / 0.1) 100%);
          border: 1px solid rgb(249 115 22 / 0.2);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: visible;
        }

        .animated-menu-button:hover {
          background: linear-gradient(135deg, rgb(249 115 22 / 0.2) 0%, rgb(239 68 68 / 0.2) 100%);
          border-color: rgb(249 115 22 / 0.3);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgb(249 115 22 / 0.15);
        }

        .animated-menu-button:hover .top-bar {
          animation: menuHoverTop 0.5s 0.5s forwards;
        }

        .animated-menu-button:hover .bottom-bar {
          animation: menuHoverBottom 0.5s 0.5s forwards;
        }

        /* Menu Icon */
        .menu-icon {
          position: relative;
          width: 30px;
          height: 20px;
          display: block;
        }

        .menu-bar {
          position: absolute;
          left: 0;
          width: 100%;
          height: 3px;
          background: linear-gradient(to right, rgb(249 115 22) 0%, rgb(239 68 68) 100%);
          border-radius: 2px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .top-bar {
          top: 0;
          transform-origin: left center;
        }

        .middle-bar {
          top: 50%;
          transform: translateY(-50%);
        }

        .bottom-bar {
          bottom: 0;
          transform-origin: left center;
        }

        /* Active (Open) State */
        .animated-menu-button.active {
          background: linear-gradient(135deg, rgb(249 115 22 / 0.3) 0%, rgb(239 68 68 / 0.3) 100%);
          border-color: rgb(249 115 22 / 0.4);
        }

        .animated-menu-button.active .top-bar {
          transform: rotate(45deg) translate(2px, -2px);
          width: 100%;
          background: linear-gradient(to right, rgb(249 115 22) 0%, rgb(239 68 68) 100%);
        }

        .animated-menu-button.active .middle-bar {
          opacity: 0;
          transform: translateY(-50%) scaleX(0);
        }

        .animated-menu-button.active .bottom-bar {
          transform: rotate(-45deg) translate(2px, 2px);
          width: 100%;
          background: linear-gradient(to right, rgb(249 115 22) 0%, rgb(239 68 68) 100%);
        }

        /* Mobile Menu Animation */
        .mobile-nav-menu {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          transform-origin: top right;
        }

        /* Animations */
        @keyframes menuHoverTop {
          0% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(8px);
          }
          100% {
            transform: translateY(0);
          }
        }

        @keyframes menuHoverBottom {
          0% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
          100% {
            transform: translateY(0);
          }
        }

        @keyframes menuActiveSlide {
          0% {
            opacity: 0;
            transform: translateX(10px) translateY(-10px);
          }
          100% {
            opacity: 1;
            transform: translateX(0) translateY(0);
          }
        }

        /* Mobile Menu Items Animation */
        .mobile-nav-menu li {
          animation: menuActiveSlide 0.3s ease-out forwards;
          opacity: 0;
        }

        .mobile-nav-menu li:nth-child(1) { animation-delay: 0.05s; }
        .mobile-nav-menu li:nth-child(2) { animation-delay: 0.1s; }
        .mobile-nav-menu li:nth-child(3) { animation-delay: 0.15s; }
        .mobile-nav-menu li:nth-child(4) { animation-delay: 0.2s; }
        .mobile-nav-menu li:nth-child(5) { animation-delay: 0.25s; }
        .mobile-nav-menu li:nth-child(6) { animation-delay: 0.3s; }
        .mobile-nav-menu li:nth-child(7) { animation-delay: 0.35s; }

        /* Responsive adjustments */
        @media (max-width: 640px) {
          .mobile-nav-menu {
            position: fixed;
            top: 70px;
            right: 1rem;
            left: 1rem;
            width: auto;
            max-width: 280px;
            margin-left: auto;
          }
        }
      `}</style>
    </header>
  )
}