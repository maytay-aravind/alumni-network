import * as React from "react"
import { cn } from "@/lib/utils"

interface TooltipProps {
  children: React.ReactNode
  content: string
  side?: "top" | "bottom" | "left" | "right"
  className?: string
}

function Tooltip({ children, content, side = "top", className }: TooltipProps) {
  return (
    <div className={cn("group relative inline-flex", className)}>
      {children}
      <div
        role="tooltip"
        className={cn(
          "pointer-events-none absolute z-50 hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground group-hover:block",
          side === "top" && "bottom-full left-1/2 mb-2 -translate-x-1/2",
          side === "bottom" && "top-full left-1/2 mt-2 -translate-x-1/2",
          side === "left" && "right-full top-1/2 mr-2 -translate-y-1/2",
          side === "right" && "left-full top-1/2 ml-2 -translate-y-1/2"
        )}
      >
        {content}
        <div
          className={cn(
            "absolute h-2 w-2 rotate-45 bg-primary",
            side === "top" && "bottom-full left-1/2 -translate-x-1/2 translate-y-1/2",
            side === "bottom" && "top-full left-1/2 -translate-x-1/2 -translate-y-1/2",
            side === "left" && "right-full top-1/2 -translate-y-1/2 translate-x-1/2",
            side === "right" && "left-full top-1/2 -translate-y-1/2 -translate-x-1/2"
          )}
        />
      </div>
    </div>
  )
}

export { Tooltip }
