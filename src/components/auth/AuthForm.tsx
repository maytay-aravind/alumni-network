"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface AuthFormProps {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  className?: string;
}

export default function AuthForm({ children, onSubmit, className }: AuthFormProps) {
  return (
    <form onSubmit={onSubmit} className={cn("space-y-4", className)}>
      {children}
    </form>
  );
}
