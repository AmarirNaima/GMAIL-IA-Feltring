"use client"

import type React from "react"

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <NextAuthSessionProvider basePath="/api/auth">{children}</NextAuthSessionProvider>
}
