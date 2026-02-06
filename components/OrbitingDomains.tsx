"use client"

import React, { useEffect, useMemo, useState, memo, useRef } from "react"
import Image from "next/image"

/* -------------------- Types -------------------- */
type Skill = { name: string; logo?: string }

type TechnicalSkillsShape = {
  aiml: Skill[]
  development: Skill[]
  backdb: Skill[]
  softSkills: (string | Skill)[]
}

type DomainKey = "AI & Data" | "Development" | "Backend" | "Soft"

/* -------------------- Small helpers -------------------- */
const InitialsFallback = ({ name }: { name: string }) => {
  const initials = name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <div className="w-full h-full rounded-full flex items-center justify-center text-[10px] font-semibold">
      {initials}
    </div>
  )
}

/* ---------- Container-based scale (IMPORTANT) ---------- */
function useContainerScale(ref: React.RefObject<HTMLDivElement>) {
  const [scale, setScale] = useState(1)

  useEffect(() => {
    if (!ref.current) return

    const BASE = 420 // design size (desktop reference)

    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width
      const s = Math.min(1, w / BASE)
      setScale(Number(s.toFixed(3)))
    })

    ro.observe(ref.current)
    return () => ro.disconnect()
  }, [ref])

  return scale
}

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const check = () => setIsDesktop(typeof window !== "undefined" && window.innerWidth >= 1024)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  return isDesktop
}

/* -------------------- Shuffle utils -------------------- */
function shuffle<T>(arr: T[]) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function splitIntoTwoOrbits(skills: Skill[]) {
  const s = shuffle(skills)
  if (s.length >= 6) return [s.slice(0, 3), s.slice(3)]
  const mid = Math.ceil(s.length / 2)
  return [s.slice(0, mid), s.slice(mid)]
}

function splitIntoThreeOrbits(skills: Skill[]) {
  const s = shuffle(skills)
  const base = Math.floor(s.length / 3)
  const rem = s.length % 3
  const sizes = [base, base, base]
  for (let i = 0; i < rem; i++) sizes[i]++

  const groups: Skill[][] = []
  let idx = 0
  for (const size of sizes) {
    groups.push(s.slice(idx, idx + size))
    idx += size
  }
  return groups
}

/* -------------------- Orbit Elements -------------------- */
const OrbitingDot = memo(
  ({
    x,
    y,
    size,
    children,
  }: {
    x: number
    y: number
    size: number
    children: React.ReactNode
  }) => (
    <div
      className="absolute top-1/2 left-1/2"
      style={{
        width: size,
        height: size,
        transform: `translate(calc(${x}px - 50%), calc(${y}px - 50%))`,
      }}
    >
      <div className="w-full h-full rounded-full bg-card/80 backdrop-blur-sm shadow-lg flex items-center justify-center">
        {children}
      </div>
    </div>
  )
)
OrbitingDot.displayName = "OrbitingDot"

const OrbitRing = ({ radius }: { radius: number }) => (
  <div
    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
    style={{
      width: radius * 2,
      height: radius * 2,
      // use --accent variable for border & glow so it follows selected color theme
      border: "1px solid hsl(var(--accent) / 0.35)",
      boxShadow: "0 0 40px hsl(var(--accent) / 0.25)",
    }}
  />
)

/* -------------------- Animation Clock -------------------- */
function useAnimationClock() {
  const [time, setTime] = useState(0)
  useEffect(() => {
    let raf: number
    let last = performance.now()
    const loop = (now: number) => {
      const dt = (now - last) / 1000
      last = now
      setTime((t) => t + dt)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])
  return time
}

/* -------------------- Orbit Canvas (keeps original animation + responsiveness) -------------------- */
const OrbitCanvas = ({
  orbitGroups,
  desktopScale = 1,
}: {
  orbitGroups: { skills: Skill[]; radius: number; speed: number }[]
  desktopScale?: number
}) => {
  const ref = useRef<HTMLDivElement>(null)
  // We let the container width drive the scale (base 420). If caller requests a smaller desktop size,
  // we set a smaller maxWidth on the container — useContainerScale will pick that up and reduce the scale.
  const time = useAnimationClock()

  const dotSizeRef = useRef(46)

  return (
    <div
      ref={ref}
      className="relative w-full aspect-square mx-auto"
      style={{ maxWidth: `${420 * desktopScale}px` }}
    >
      {/* We must compute scale after the container has been measured; reuse useContainerScale on this ref */}
      <InnerOrbitContent refContainer={ref} orbitGroups={orbitGroups} time={time} />
    </div>
  )
}

// Separate inner content to allow useContainerScale to be used with the same ref
const InnerOrbitContent = (props: {
  refContainer: React.RefObject<HTMLDivElement>
  orbitGroups: { skills: Skill[]; radius: number; speed: number }[]
  time: number
}) => {
  const { refContainer, orbitGroups, time } = props
  const scale = useContainerScale(refContainer)
  const dotSize = 46 * scale
  const centerSize = 72 * scale

  return (
    <>
      {orbitGroups.map((g, gi) => (
        <React.Fragment key={gi}>
          <OrbitRing radius={g.radius * scale} />
          {g.skills.map((skill, i) => {
            const angle = time * g.speed + (i / g.skills.length) * Math.PI * 2
            const x = Math.cos(angle) * g.radius * scale
            const y = Math.sin(angle) * g.radius * scale

            return (
              <OrbitingDot key={i} x={x} y={y} size={dotSize}>
                {skill.logo ? (
                  <Image
                    src={skill.logo}
                    alt={skill.name}
                    width={dotSize}
                    height={dotSize}
                    className="object-contain p-1"
                  />
                ) : (
                  <InitialsFallback name={skill.name} />
                )}
              </OrbitingDot>
            )
          })}
        </React.Fragment>
      ))}

      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-xs font-semibold text-white"
        style={{ width: centerSize, height: centerSize }}
      >
        Skills
      </div>
    </>
  )
}

/* -------------------- Simple carousel hook (keeps UI keyboard + touch friendly) -------------------- */
function useCarousel(length: number) {
  const [active, setActive] = useState(0)
  const touchStartX = useRef<number | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") setActive((a) => Math.max(0, a - 1))
      if (e.key === "ArrowRight") setActive((a) => Math.min(length - 1, a + 1))
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [length])

  return {
    active,
    setActive,
    prev: () => setActive((a) => (a - 1 + length) % length),
    next: () => setActive((a) => (a + 1) % length),
    onTouchStart: (e: React.TouchEvent) => (touchStartX.current = e.touches[0].clientX),
    onTouchEnd: (e: React.TouchEvent) => {
      if (touchStartX.current == null) return
      const dx = e.changedTouches[0].clientX - touchStartX.current
      if (Math.abs(dx) > 40) {
        if (dx > 0) setActive((a) => Math.max(0, a - 1))
        else setActive((a) => Math.min(length - 1, a + 1))
      }
      touchStartX.current = null
    },
  }
}

/* -------------------- Main Component (merged: original + description & tabs + skill pills) -------------------- */
export default function OrbitingDomains({
  technicalSkills,
}: {
  technicalSkills: TechnicalSkillsShape
}) {
  const domains = useMemo(
    () => [
      {
        key: "AI & Data" as DomainKey,
        label: "AI & Data Science",
        items: technicalSkills.aiml,
      },
      {
        key: "Development" as DomainKey,
        label: "Web Development",
        items: technicalSkills.development,
      },
      {
        key: "Backend" as DomainKey,
        label: "Backend & Databases",
        items: technicalSkills.backdb,
      },
      {
        key: "Soft" as DomainKey,
        label: "Soft Skills",
        items: technicalSkills.softSkills.map((s) => (typeof s === "string" ? { name: s } : s)),
      },
    ],
    [technicalSkills]
  )

  const carousel = useCarousel(domains.length)
  const isDesktop = useIsDesktop()

  const prepared = useMemo(
    () =>
      domains.map((d) => {
        if (d.key === "AI & Data") {
          const groups = splitIntoThreeOrbits(d.items)
          return {
            ...d,
            orbitGroups: groups.map((g, i) => ({ skills: g, radius: [80, 130, 180][i], speed: [0.9, -0.6, 0.5][i] })),
          }
        }
        const groups = splitIntoTwoOrbits(d.items)
        return {
          ...d,
          orbitGroups: groups.map((g, i) => ({ skills: g, radius: i === 0 ? 100 : 160, speed: i === 0 ? 0.9 : -0.6 })),
        }
      }),
    [domains]
  )

  // small domain descriptions (can be customized)
  const descriptions = useMemo(
    () => ({
      "AI & Data Science": `• Built and trained ML/DL models for real-world sponsored projects
• Won several hackathons like TensorFiesta and TE AI Cup 2025
• Deployed and optimized models for production level workflows`,

      "Web Development": `• Developed responsive, accessible UIs with React & modern CSS
• Built several web applications as web development secretary of CSI VIT Pune
• Developed a full stack Bus Transit System for DSS World Pvt. Ltd. in collaboration with ISA, VIT Pune`,

      "Backend & Databases": `• Worked on backend and database in TE AI Cup 2025
• Worked with PostgreSQL, MongoDB, and Supabase for various projects
• Focused on performance, security, and scalability`,

      "Soft Skills": `• Clear communication in cross-functional teams across hackathons and projects
• Had a problem-solving and ownership mindset
• Developed mentoring and leadership through my experience as an ASV at Make A Difference (MAD) NGO`,
    }),
    []
  )
  return (
    <div className="w-full grid grid-cols-1 gap-4">
      {/* header with small desc + controls */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-sm font-semibold">{domains[carousel.active].label}</div>
          <div className="text-xs text-muted-foreground">{(domains as any)[carousel.active].short}</div>
        </div>

        <div className="flex items-center gap-2">
          <button
            aria-label="previous"
            onClick={carousel.prev}
            className="p-2 rounded-full bg-muted hover:bg-accent transition-colors"
          >
            ‹
          </button>
          <div className="flex items-center gap-1">
            {domains.map((_, idx) => (
              <button
                key={`dot-${idx}`}
                onClick={() => carousel.setActive(idx)}
                className={`w-2 h-2 rounded-full transition-colors duration-150 ${carousel.active === idx ? "" : "bg-muted"}`}
                aria-label={`go to ${idx}`}
                // active dot uses accent variable
                style={carousel.active === idx ? { background: "hsl(var(--accent))" } : undefined}
              />
            ))}
          </div>
          <button
            aria-label="next"
            onClick={carousel.next}
            className="p-2 rounded-full bg-muted hover:bg-accent transition-colors"
          >
            ›
          </button>
        </div>
      </div>

      {/* main: left orbit canvas + right description & skills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border-border rounded-lg p-3 flex items-center justify-center" style={{ minHeight: 300 }}>
          <OrbitCanvas orbitGroups={prepared[carousel.active].orbitGroups} desktopScale={isDesktop ? 0.8 : 1} />
        </div>

        <div className="bg-card border-border rounded-lg p-4 flex flex-col gap-4">
          <div>
            <h4 className="text-sm font-semibold">Work done on {domains[carousel.active].label}</h4>
            <div className="text-xs text-muted-foreground mt-2 whitespace-pre-line">{(descriptions as any)[domains[carousel.active].label]}</div>
          </div>

          <div>
            <h5 className="text-sm font-medium">Skills</h5>
            <div className="mt-3 flex flex-wrap gap-2">
              {prepared[carousel.active].items.map((s, i) => (
                <div
                  key={`${s.name}-${i}`}
                  className={`inline-flex items-center gap-2 px-2.5 h-7 rounded-full bg-muted text-[11px] font-medium text-muted-foreground`}
                >
                  {s.logo ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="w-4 h-4 relative shrink-0">
                        <Image src={s.logo} alt={s.name} fill sizes="16px" className="object-contain" />
                      </span>
                      <span>{s.name}</span>
                    </span>
                  ) : (
                    <span>{s.name}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
