"use client"
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6750A4] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[#6750A4] text-white shadow-sm hover:bg-[#5a45a0] active:bg-[#4f378b]",
        destructive: "bg-[#BA1A1A] text-white shadow-sm hover:bg-[#93000A]",
        outline: "border border-[#79747E] bg-transparent text-[#6750A4] hover:bg-[#E8DEF8]",
        secondary: "bg-[#E8DEF8] text-[#1D192B] hover:bg-[#D9C3F0]",
        ghost: "text-[#6750A4] hover:bg-[#E8DEF8]",
        link: "text-[#6750A4] underline-offset-4 hover:underline rounded-none",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-8 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

type ButtonProps = React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { loading?: boolean }
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, loading = false, disabled, children, ...props }, ref) => (
  <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} disabled={disabled || loading} {...props}>
    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
    {children}
  </button>
))
Button.displayName = "Button"
export { Button, buttonVariants }
export type { ButtonProps }
