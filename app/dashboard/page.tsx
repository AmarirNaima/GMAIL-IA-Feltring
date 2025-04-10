// app/dashboard/page.tsx

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import DashboardClient from "@/components/dashboard"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/")
  }

  return <DashboardClient session={session} />
}
