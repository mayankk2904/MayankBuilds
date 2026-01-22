import * as LucideIcons from "lucide-react"

interface SocialLink {
  platform: string
  url: string
  icon: string
}

interface SocialLinksProps {
  socialLinks: SocialLink[]
}

export function SocialLinks({ socialLinks }: SocialLinksProps) {
  return (
    <div className="flex justify-center gap-2 sm:gap-3 my-2 sm:my-3">
      {socialLinks.map((link, index) => {
        const IconComponent =
          LucideIcons[link.icon as keyof typeof LucideIcons]

        return (
          <a
            key={index}
            href={link.url}
            aria-label={link.platform}
            className="
              w-7 h-7 sm:w-8 sm:h-8
              rounded-full
              flex items-center justify-center
              border
              transition-colors
              bg-zinc-100 text-zinc-800 border-zinc-300
              hover:bg-zinc-200
              dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700
              dark:hover:bg-zinc-700
            "
          >
            {IconComponent && (
              <IconComponent className="w-3 h-3 sm:w-4 sm:h-4" />
            )}
          </a>
        )
      })}
    </div>
  )
}
