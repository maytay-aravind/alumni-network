"use client"

import toast, { Toaster } from "react-hot-toast"
import { AlertTriangle, Info } from "lucide-react"

const toastOptions = {
  duration: 4000,
  style: {
    background: "hsl(var(--card))",
    color: "hsl(var(--card-foreground))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "0.75rem",
    padding: "12px 16px",
    fontSize: "14px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
  },
  success: {
    iconTheme: {
      primary: "#10b981",
      secondary: "#fff",
    },
  },
  error: {
    iconTheme: {
      primary: "#ef4444",
      secondary: "#fff",
    },
  },
}

export const showToast = {
  success: (message: string) => toast.success(message, toastOptions),
  error: (message: string) => toast.error(message, toastOptions),
  warning: (message: string) =>
    toast(message, {
      ...toastOptions,
      icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
    }),
  info: (message: string) =>
    toast(message, {
      ...toastOptions,
      icon: <Info className="h-5 w-5 text-blue-500" />,
    }),
  promise: <T,>(
    promise: Promise<T>,
    msgs: { loading: string; success: string; error: string }
  ) => toast.promise(promise, msgs, toastOptions),
  dismiss: (id?: string) => toast.dismiss(id),
}

export function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={toastOptions}
      containerStyle={{
        bottom: 20,
        right: 20,
      }}
    />
  )
}

export { toast }
