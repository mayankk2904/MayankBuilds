"use client"

import Image from "next/image"
import Link from "next/link"
import { Card } from "@/components/ui/card"

interface ProjectCardProps {
  title: string
  category: string
  image: string
  slug: string
}

export function ProjectCard({
  title,
  category,
  image,
  slug,
}: ProjectCardProps) {
  return (
    <Link href={`/projects/${slug}`} className="block h-full">
      <Card
        className="
          overflow-hidden h-full group transition-all
          bg-card border-border
          hover:opacity-95
        "
        style={{
          borderColor: "hsl(var(--border))",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.borderColor = "hsl(var(--accent) / 0.6)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.borderColor = "hsl(var(--border))")
        }
      >
        <div className="relative h-40 sm:h-48 w-full overflow-hidden">
          {/* Image */}
          <Image
            src={image || "/placeholder.svg"}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Overlay */}
          <div
            className="
              absolute inset-0
              bg-gradient-to-t
              from-black/85 via-black/40 to-transparent
            "
          />

          {/* Text Content */}
          <div className="absolute bottom-0 left-0 p-3 sm:p-4">
            <div
              className="text-xs mb-1"
              style={{ color: "hsl(var(--accent))" }}
            >
              {category}
            </div>

            <h3
              className="
                font-medium text-sm sm:text-base
                text-zinc-100
                drop-shadow-md
              "
            >
              {title}
            </h3>
          </div>
        </div>
      </Card>
    </Link>
  )
}
