import type { ReactNode } from "react"

interface SkillTagProps {
  children: ReactNode
}

export function SkillTag({ children }: SkillTagProps) {
  return (
    <span
      className="
        inline-block
        px-1.5 sm:px-2
        py-0.5 sm:py-1
        text-xs
        rounded-md
        border
        bg-zinc-100 text-zinc-800 border-zinc-300
        dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700
      "
    >
      {children}
    </span>
  )
}
