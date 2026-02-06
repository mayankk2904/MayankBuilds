import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { CircleArrowRight } from "lucide-react"

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
    <div className="space-y-4 pb-6 border-b border-border last:border-0 last:pb-0">
      
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
          <div className="w-10 h-10 rounded-md bg-muted overflow-hidden flex-shrink-0">
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
          <h4 className="font-medium text-base sm:text-lg leading-tight text-foreground">
            {title}
          </h4>
          <div
            className="text-sm"
            style={{ color: "hsl(var(--accent))" }} // follows selected color theme
          >
            {company}
          </div>
        </div>

        {/* Period */}
        <div
          className="
            text-xs text-muted-foreground bg-muted
            px-2 py-1 rounded-full w-fit
            col-span-2 sm:col-span-1
            sm:justify-self-end
          "
        >
          {period}
        </div>
      </div>

      {/* BODY */}
      <p className="text-sm text-foreground">
        {description}
      </p>

      <div className="space-y-2">
        <h5 className="text-sm font-medium text-muted-foreground">
          Notable Activities
        </h5>

        <ul className="space-y-2">
          {achievements.map((item, i) => (
            <li key={i} className="flex text-sm text-foreground">
              <CircleArrowRight
                className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0"
                style={{ color: "hsl(var(--accent))" }} // follows selected color theme
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h5 className="text-sm font-medium text-muted-foreground mb-2">
          Technologies & Skills
        </h5>

        <div className="flex flex-wrap gap-2">
          {technologies.map((tech, i) => (
            <Badge
              key={i}
              variant="outline"
              className="text-xs bg-background"
            >
              {tech}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
}
