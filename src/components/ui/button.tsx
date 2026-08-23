"use client"
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        default: "bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] hover:bg-[#4539A0] active:bg-[#3B2E8F]",
        tonal: "bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] hover:bg-[#D9D9F0]",
        outlined: "border border-[var(--md-sys-color-outline)] bg-transparent text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-surface-container)]",
        outline: "border border-[var(--md-sys-color-outline)] bg-transparent text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-surface-container)]",
        text: "text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-surface-container-high)]",
        ghost: "text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-surface-container-high)]",
        secondary: "bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] hover:bg-[#D9D9F0]",
        link: "text-[var(--md-sys-color-primary)] underline-offset-4 hover:underline",
        error: "bg-[var(--md-sys-color-error)] text-[var(--md-sys-color-on-error)] hover:bg-[#93000A]",
        destructive: "bg-[var(--md-sys-color-error)] text-[var(--md-sys-color-on-error)] hover:bg-[#93000A]",
      },
      size: {
        default: "h-10 px-6 rounded-full",
        sm: "h-8 px-4 rounded-full text-xs",
        lg: "h-12 px-8 rounded-full text-base",
        icon: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

type ButtonProps = React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { loading?: boolean }
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, loading, disabled, children, ...props }, ref) => (
  <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} disabled={disabled || loading} {...props}>
    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
    {children}
  </button>
))
Button.displayName = "Button"
export { Button, buttonVariants }
