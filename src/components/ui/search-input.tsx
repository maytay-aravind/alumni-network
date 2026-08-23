"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Search, X } from "lucide-react"

interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  onSearch?: (value: string) => void
  debounceMs?: number
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, onSearch, debounceMs = 300, ...props }, ref) => {
    const [value, setValue] = React.useState(props.defaultValue || "")
    const [isFocused, setIsFocused] = React.useState(false)
    const timerRef = React.useRef<NodeJS.Timeout>(undefined)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setValue(newValue)

      if (debounceMs > 0) {
        clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => {
          onSearch?.(newValue)
        }, debounceMs)
      } else {
        onSearch?.(newValue)
      }
    }

    const handleClear = () => {
      setValue("")
      onSearch?.("")
      clearTimeout(timerRef.current)
    }

    React.useEffect(() => {
      return () => clearTimeout(timerRef.current)
    }, [])

    return (
      <div
        className={cn(
          "relative flex items-center rounded-md border bg-background transition-colors",
          isFocused
            ? "ring-1 ring-ring"
            : "hover:border-muted-foreground/50",
          className
        )}
      >
        <Search className="ml-3 h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="h-9 w-full border-0 bg-transparent px-3 py-1 text-sm placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          {...props}
        />
        {value && (
          <button
            onClick={handleClear}
            className="mr-2 rounded-sm p-1 text-muted-foreground hover:text-foreground"
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    )
  }
)
SearchInput.displayName = "SearchInput"

export { SearchInput }
