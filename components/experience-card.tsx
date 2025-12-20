import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2 } from "lucide-react"

interface ExperienceCardProps {
  title: string
  company: string
  period: string
  description: string
  achievements: string[]
  technologies: string[]
  logo?: string
}

export function ExperienceCard({
  title,
  company,
  period,
  description,
  achievements,
  technologies,
  logo,
}: ExperienceCardProps) {
  return (
    <div className="space-y-4 pb-6 border-b border-zinc-800 last:border-0 last:pb-0">
      
    {/* HEADER */}
    <div
      className="
        grid gap-3
        grid-cols-[auto_1fr]
        sm:grid-cols-[auto_1fr_auto]
        items-center
      "
    >
      {/* Logo */}
      {logo && (
        <div className="w-10 h-10 rounded-md bg-zinc-800 overflow-hidden flex-shrink-0">
          <Image
            src={logo}
            alt={company}
            width={40}
            height={40}
            className="object-contain p-1"
          />
        </div>
      )}

      {/* Title + Company */}
      <div>
        <h4 className="font-medium text-base sm:text-lg leading-tight">
          {title}
        </h4>
        <div className="text-sm text-brand">
          {company}
        </div>
      </div>

      {/* Period */}
      <div
        className="
          text-xs text-zinc-400 bg-zinc-800/70
          px-2 py-1 rounded-full w-fit
          col-span-2 sm:col-span-1
          sm:justify-self-end
        "
      >
        {period}
      </div>
    </div>


      {/* BODY — full width, unaffected by logo */}
      <p className="text-sm text-zinc-300">
        {description}
      </p>

      <div className="space-y-2">
        <h5 className="text-sm font-medium text-zinc-400">
          Key Achievements
        </h5>
        <ul className="space-y-2">
          {achievements.map((item, i) => (
            <li key={i} className="flex text-sm text-zinc-300">
              <CheckCircle2 className="w-4 h-4 mr-2 text-brand mt-0.5 flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h5 className="text-sm font-medium text-zinc-400 mb-2">
          Technologies & Skills
        </h5>
        <div className="flex flex-wrap gap-2">
          {technologies.map((tech, i) => (
            <Badge
              key={i}
              variant="outline"
              className="text-xs bg-zinc-800/50"
            >
              {tech}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
}
