"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { getNavItems, getPersonalInfo } from "@/lib/data"
import { ThemeToggle } from "@/components/theme-toggle"
import ColorThemeToggle from "@/components/color-theme-toggle"
import { Palette } from "lucide-react"

export function PortfolioHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("")
  const logoRef = useRef<HTMLDivElement | null>(null)
  const lastScrollY = useRef(0)
  const rotation = useRef(0)

  const navItems = getNavItems()
  const personalInfo = getPersonalInfo()

  /* -------------------------
     Logo / theme image logic
     ------------------------- */

  // Map your theme-class -> image filename.
  // Update these paths to match the files you downloaded.
  const LOGO_MAP = {
    "color-lime": {
      wheel: "/logos/wheel1-lime.png",
      center: "/logos/center-lime.png",
    },
    "color-purple": {
      wheel: "/logos/wheel1-purple.png",
      center: "/logos/center-purple.png",
    },
    "color-gold": {
      wheel: "/logos/wheel1-gold.png",
      center: "/logos/center-gold.png",
    },
    "color-cyan": {
      wheel: "/logos/wheel1-cyan.png",
      center: "/logos/center-cyan.png",
    },
    // default (no extra class) - keep original orange variant
    default: {
      wheel: "/logos/wheel1.png",
      center: "/logos/center.png",
    },
  } as const

  // derive theme class name from document.documentElement
const getActiveColorClass = () => {
  if (typeof window === "undefined") return "default"
  const el = document.documentElement
  if (!el) return "default"

  // Look for any of our known classes on <html>
  const known = ["color-lime", "color-purple", "color-gold", "color-cyan"]
  for (const k of known) {
    if (el.classList.contains(k)) return k
  }

  return "default"
}


  const [logoTheme, setLogoTheme] = useState<keyof typeof LOGO_MAP>(
    typeof window === "undefined" ? "default" : (getActiveColorClass() as any)
  )

  useEffect(() => {
    // update on mount in case SSR -> CSR change
    setLogoTheme(getActiveColorClass() as any)

    // Observe html.class changes (so theme applied by adding/removing classes is captured)
    const target = document.documentElement
    const mo = new MutationObserver(() => {
      setLogoTheme(getActiveColorClass() as any)
    })
    mo.observe(target, { attributes: true, attributeFilter: ["class"] })

    // also listen to localStorage changes (cross-tab)
return () => {
  mo.disconnect()
}

  }, [])

  /* -------------------------
     Scroll / active section logic (unchanged)
     ------------------------- */
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setScrolled(currentScrollY > 20)

      /* 🔁 LOGO ROTATION BASED ON SCROLL */
      const delta = currentScrollY - lastScrollY.current
      rotation.current += delta * 0.25 // adjust sensitivity here

      if (logoRef.current) {
        logoRef.current.style.transform = `rotate(${rotation.current}deg)`
      }

      lastScrollY.current = currentScrollY

      /* 🔹 ACTIVE SECTION LOGIC (unchanged) */
      const sections = navItems
        .filter((item) => item.href.startsWith("#"))
        .map((item) => item.href.substring(1))

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

      if (currentScrollY < 100) {
        setActiveSection("")
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [navItems])

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  /**
   * ColorPickerButton: self-contained button + dropdown used in both desktop & mobile.
   * - Handles outside click to close
   * - Auto aligns left/right to avoid overflowing the viewport
   */
function ColorPickerButton({ ariaLabel = "Color theme" }: { ariaLabel?: string }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const dropdownWidth = 220 // px expected dropdown width
  const [alignRight, setAlignRight] = useState(true)
  const [btnRect, setBtnRect] = useState<DOMRect | null>(null)

  useEffect(() => {
    if (!open) return

    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    const updatePosition = () => {
      const btn = containerRef.current?.getBoundingClientRect()
      if (!btn) return

      // Save measured rect for fixed positioning on small screens
      setBtnRect(btn)

      // If small screen, we'll center the popover fixed in viewport.
      const isSmall = window.innerWidth <= 640

      if (isSmall) {
        // center mode — we won't use alignRight in this case
        setAlignRight(false)
        return
      }

      // desktop/tablet behavior: decide whether to align right to avoid overflow
      const wouldOverflowRight = btn.left + dropdownWidth > window.innerWidth - 12
      setAlignRight(wouldOverflowRight)
    }

    updatePosition()
    window.addEventListener("resize", updatePosition)
    document.addEventListener("mousedown", handleOutside)
    window.addEventListener("orientationchange", updatePosition)

    return () => {
      window.removeEventListener("resize", updatePosition)
      document.removeEventListener("mousedown", handleOutside)
      window.removeEventListener("orientationchange", updatePosition)
    }
  }, [open])

  // Build style for dropdown based on measured rect and viewport
  const dropdownStyle: React.CSSProperties = {}
  const isSmall = typeof window !== "undefined" && window.innerWidth <= 640

  if (isSmall && btnRect) {
    // fixed, centered under the button (so it won't be constrained by header layout)
    const top = btnRect.bottom + window.scrollY + 8 // 8px gap
    dropdownStyle.position = "fixed"
    dropdownStyle.left = "50%"
    dropdownStyle.top = `${top}px`
    dropdownStyle.transform = "translateX(-50%)"
    dropdownStyle.width = "min(92vw, 320px)"
    dropdownStyle.right = "auto"
  } else {
    // absolute positioning anchored to the container (desktop/tablet)
    if (alignRight) {
      dropdownStyle.right = 0
      dropdownStyle.left = "auto"
    } else {
      dropdownStyle.left = 0
      dropdownStyle.right = "auto"
    }
    dropdownStyle.position = "absolute"
    dropdownStyle.transform = undefined
    dropdownStyle.width = undefined
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-accent transition-colors"
        aria-label={ariaLabel}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <Palette className="w-4 h-4" />
      </button>
{open && (
  <div
    role="dialog"
    aria-label="Color theme dropdown"
    className={`
      absolute top-full mt-2
      p-3 sm:p-4
      bg-card border border-border rounded-lg shadow-lg
      z-50 animate-fade-in
      w-[90vw] max-w-[260px] sm:w-[220px]
    `}
    style={{
      // merge computed placement (fixed mode will override position)
      ...dropdownStyle,
      borderColor: "hsl(var(--accent) / 0.15)",
      boxShadow: "0 10px 25px -5px hsl(var(--accent) / 0.08)",
    }}
  >

          <div className="text-xs font-medium text-muted-foreground pb-2 mb-2 flex items-center justify-between">
            <span>Theme Colors</span>
            <button
              onClick={() => setOpen(false)}
              className="w-4 h-4 flex items-center justify-center text-muted-foreground hover:text-foreground"
              aria-label="Close color picker"
            >
              ×
            </button>
          </div>
          <div className="min-h-[48px]">
            <ColorThemeToggle />
          </div>
        </div>
      )}
    </div>
  )
}


  // select current logo images
  const { wheel: wheelSrc, center: centerSrc } = LOGO_MAP[logoTheme] ?? LOGO_MAP.default

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4",
        scrolled
          ? "bg-background/90 backdrop-blur-md shadow-md py-2 border-b border-border"
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo Image */}
        <Link href="/" className="flex items-center group">
          <div className="relative h-10 w-10 md:h-12 md:w-12">
            {/* 🔁 ROTATING WHEEL */}
            <div ref={logoRef} className="absolute inset-0 will-change-transform transition-transform duration-75">
              <Image src={wheelSrc} alt="MK Wheel" fill priority />
            </div>

            {/* 🧷 FIXED CENTER LOGO */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Image src={centerSrc} alt="MK Center" width={18} height={18} />
            </div>
          </div>
        </Link>

        {/* Desktop Navigation with Theme Toggle */}
        <div className="hidden md:flex items-center space-x-1">
          <nav className="flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive =
                item.href === "/" ? activeSection === "" : activeSection === item.href.substring(1)

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "px-3 py-2 text-sm relative group transition-all duration-300",
                    isActive
                      ? "text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className="relative z-10">{item.label}</span>
                  <span
                    className="absolute inset-0 rounded-md transition-all duration-300"
                    style={{
                      backgroundColor: "hsl(var(--accent) / 0.05)",
                    }}
                  ></span>
                  <span
                    className={cn(
                      "absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 transition-all duration-300 group-hover:w-4/5",
                      isActive && "w-4/5"
                    )}
                    style={{
                      background: `hsl(var(--accent))`,
                    }}
                  ></span>
                </Link>
              )
            })}
          </nav>

          {/* Color Palette Dropdown */}
          <div className="ml-4 border-l border-border pl-4 flex items-center gap-3">
            <ColorPickerButton ariaLabel="Color theme (desktop)" />
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile Controls */}
        <div className="md:hidden flex items-center gap-3">
          {/* Color Palette for Mobile */}
          <ColorPickerButton ariaLabel="Color theme (mobile)" />

          {/* Mobile Theme Toggle */}
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
            <ul
              className={cn(
                "mobile-nav-menu fixed top-[70px] right-4 z-40 list-none p-4 w-[200px] rounded-lg",
                "bg-card/95 backdrop-blur-md border",
                "shadow-xl",
                mobileMenuOpen
                  ? "opacity-100 translate-x-0 visible"
                  : "opacity-0 translate-x-4 invisible"
              )}
              style={{
                borderColor: "hsl(var(--accent) / 0.2)",
                boxShadow: "0 20px 25px -5px hsl(var(--accent) / 0.05)",
              }}
            >
              {navItems.map((item) => {
                const isActive =
                  item.href === "/" ? activeSection === "" : activeSection === item.href.substring(1)

                return (
                  <li
                    key={item.label}
                    className="border-b last:border-b-0"
                    style={{
                      borderColor: "hsl(var(--accent) / 0.1)",
                    }}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        "block py-3 px-2 text-base transition-all duration-300 relative group",
                        isActive
                          ? "text-foreground font-semibold"
                          : "text-muted-foreground hover:text-foreground hover:pl-3"
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="relative z-10">{item.label}</span>
                      <span
                        className={cn(
                          "absolute left-0 top-1/2 -translate-y-1/2 w-0 h-4/5 rounded-r transition-all duration-300",
                          isActive && "w-1",
                          "group-hover:w-1"
                        )}
                        style={{
                          background: `linear-gradient(to bottom, hsl(var(--accent) / 0.2), hsl(var(--accent) / 0.2))`,
                        }}
                      ></span>
                    </Link>
                  </li>
                )
              })}

              {/* Color Theme in Mobile Menu */}
              <li
                className="border-t mt-3 pt-3"
                style={{
                  borderColor: "hsl(var(--accent) / 0.1)",
                }}
              >
                <div className="px-2">
                  <ColorThemeToggle />
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Global styles for the animated menu + dropdown animation */}
      <style jsx global>{`
        /* Menu Button Base Styles */
        .animated-menu-button {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid hsl(var(--border));
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: visible;
          padding: 0;
          background: hsl(var(--background));
        }

        .animated-menu-button:hover {
          background: hsl(var(--accent) / 0.05);
          border-color: hsl(var(--accent) / 0.3);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px hsl(var(--accent) / 0.1);
        }

        .animated-menu-button:hover .top-bar {
          animation: menuHoverTop 0.5s 0.5s forwards;
        }

        .animated-menu-button:hover .bottom-bar {
          animation: menuHoverBottom 0.5s 0.5s forwards;
        }

        /* Menu Icon - Smaller and more refined */
        .menu-icon {
          position: relative;
          width: 24px;
          height: 16px;
          display: block;
        }

        .menu-bar {
          position: absolute;
          left: 0;
          width: 100%;
          height: 2px;
          background: hsl(var(--foreground));
          border-radius: 1px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .top-bar {
          top: 0;
          transform-origin: center;
        }

        .middle-bar {
          top: 50%;
          transform: translateY(-50%);
        }

        .bottom-bar {
          bottom: 0;
          transform-origin: center;
        }

        /* Active (Open) State */
        .animated-menu-button.active {
          background: hsl(var(--accent) / 0.1);
          border-color: hsl(var(--accent) / 0.3);
        }

        .animated-menu-button.active .top-bar {
          transform: rotate(45deg) translate(4px, 4px);
          width: 100%;
          background: hsl(var(--accent));
        }

        .animated-menu-button.active .middle-bar {
          opacity: 0;
          transform: translateY(-50%) scaleX(0);
        }

        .animated-menu-button.active .bottom-bar {
          transform: rotate(-45deg) translate(4px, -4px);
          width: 100%;
          background: hsl(var(--accent));
        }

        /* Mobile Menu Animation */
        .mobile-nav-menu {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          transform-origin: top right;
        }

        /* Animations */
        @keyframes menuHoverTop {
          0% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(6px);
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
            transform: translateY(-6px);
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

        .mobile-nav-menu li:nth-child(1) {
          animation-delay: 0.05s;
        }
        .mobile-nav-menu li:nth-child(2) {
          animation-delay: 0.1s;
        }
        .mobile-nav-menu li:nth-child(3) {
          animation-delay: 0.15s;
        }
        .mobile-nav-menu li:nth-child(4) {
          animation-delay: 0.2s;
        }
        .mobile-nav-menu li:nth-child(5) {
          animation-delay: 0.25s;
        }
        .mobile-nav-menu li:nth-child(6) {
          animation-delay: 0.3s;
        }
        .mobile-nav-menu li:nth-child(7) {
          animation-delay: 0.35s;
        }

        /* Dropdown fade-in */
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-6px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fade-in {
          animation: fadeIn 160ms ease-out;
        }

        /* Responsive adjustments for tablets and phones */
        @media (max-width: 768px) {
          .animated-menu-button {
            width: 38px;
            height: 38px;
          }

          .menu-icon {
            width: 22px;
            height: 14px;
          }

          .mobile-nav-menu {
            top: 65px;
            right: 1rem;
            left: 1rem;
            width: auto;
            max-width: 280px;
            margin-left: auto;
            padding: 1rem;
            font-size: 0.95rem;
          }
        }

        @media (max-width: 480px) {
          .animated-menu-button {
            width: 36px;
            height: 36px;
            border-radius: 6px;
          }

          .menu-icon {
            width: 20px;
            height: 12px;
          }

          .menu-bar {
            height: 1.5px;
          }

          .animated-menu-button.active .top-bar {
            transform: rotate(45deg) translate(3px, 3px);
          }

          .animated-menu-button.active .bottom-bar {
            transform: rotate(-45deg) translate(3px, -3px);
          }

          .mobile-nav-menu {
            top: 60px;
            right: 0.75rem;
            left: 0.75rem;
            max-width: calc(100vw - 1.5rem);
            padding: 0.75rem;
          }

          .mobile-nav-menu li a {
            padding: 0.75rem 0.5rem;
            font-size: 0.9rem;
          }
        }

        /* Extra small devices */
        @media (max-width: 360px) {
          .animated-menu-button {
            width: 34px;
            height: 34px;
          }

          .menu-icon {
            width: 18px;
            height: 10px;
          }

          .mobile-nav-menu {
            top: 58px;
          }
        }

        /* Adjust for landscape mode on phones */
        @media (max-height: 500px) and (orientation: landscape) {
          .mobile-nav-menu {
            max-height: 70vh;
            overflow-y: auto;
            top: 65px;
          }
        }
      `}</style>
    </header>
  )
}
