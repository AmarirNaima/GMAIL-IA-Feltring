"use client"

import { useState, useEffect } from "react"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Star, Inbox, Trash,
  AlertCircle, Clock, Tag, LogOut, RefreshCw
} from "lucide-react"

import EmailList from "@/components/email-list"
import { useToast } from "@/hooks/use-toast"
import type { Email, EmailCategory } from "@/lib/types"

const fetchEmails = async (method: "GET" | "POST" = "GET"): Promise<Email[]> => {
  const res = await fetch("/api/emails", { method })
  const data = await res.json()
  return data.emails || []
}

export default function DashboardClient({ session }: { session: any }) {
  const { toast } = useToast()

  const [emails, setEmails] = useState<Email[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [activeFilter, setActiveFilter] = useState<string>("inbox")
  const [activeCategory, setActiveCategory] = useState<EmailCategory | null>(null)

  useEffect(() => {
    loadEmails()
  }, [])

  const loadEmails = async () => {
    setIsLoading(true)
    try {
      const data = await fetchEmails("GET")
      setEmails(data)
    } catch (err) {
      toast({ title: "Erreur", description: "Impossible de charger les emails.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSyncEmails = async () => {
    setIsSyncing(true)
    try {
      const data = await fetchEmails("POST")
      setEmails(data)
      toast({ title: "Synchronisé", description: "Les emails ont été mis à jour." })
    } catch (err) {
      toast({ title: "Erreur", description: "Échec de la synchronisation.", variant: "destructive" })
    } finally {
      setIsSyncing(false)
    }
  }

  const handleSignOut = () => signOut({ callbackUrl: "/" })

  const filteredEmails = emails.filter(email => {
    if (activeFilter === "inbox") return !email.trash
    if (activeFilter === "important") return email.priority === "important"
    if (activeFilter === "urgent") return email.priority === "urgent"
    if (activeFilter === "later") return email.priority === "low"
    if (activeFilter === "trash") return email.trash
    return true
  }).filter(email => activeCategory ? email.category === activeCategory : true)

  const getCounts = () => ({
    inbox: emails.filter(e => !e.trash).length,
    important: emails.filter(e => e.priority === "important").length,
    urgent: emails.filter(e => e.priority === "urgent").length,
    later: emails.filter(e => e.priority === "low").length,
    remboursement: emails.filter(e => e.category === "Remboursement").length,
    suivi: emails.filter(e => e.category === "Suivi").length,
    urgence: emails.filter(e => e.category === "Urgence").length,
    résiliation: emails.filter(e => e.category === "Résiliation").length,
    personnel: emails.filter(e => e.category === "Personnel").length,
    autre: emails.filter(e => e.category === "Autre").length,
  })

  const counts = getCounts()
  const userEmail = session?.user?.email || "User"

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background px-4 py-3 flex items-center">
        <h1 className="text-xl font-semibold">Gmail AI Filter</h1>
        <div className="ml-auto flex items-center gap-2">
          <div className="text-sm mr-2">{userEmail}</div>
          <Button variant="outline" size="sm" onClick={handleSyncEmails} disabled={isSyncing}>
            {isSyncing ? <><RefreshCw className="mr-2 h-4 w-4 animate-spin" />Syncing...</> : <><RefreshCw className="mr-2 h-4 w-4" />Sync Emails</>}
          </Button>
          <Button size="sm" onClick={handleSignOut}><LogOut className="mr-2 h-4 w-4" /> Sign Out</Button>
        </div>
      </header>

      <main className="flex flex-1 flex-col md:flex-row gap-4 p-4">
        <div className="w-full md:w-64 flex-shrink-0">
          <Card>
            <CardContent className="p-2">
              <div className="space-y-1 py-2">
                {[
                  { label: "Inbox", icon: <Inbox />, filter: "inbox", count: counts.inbox },
                  { label: "Important", icon: <Star />, filter: "important", count: counts.important },
                  { label: "Urgent", icon: <AlertCircle />, filter: "urgent", count: counts.urgent },
                  { label: "Later", icon: <Clock />, filter: "later", count: counts.later },
                  { label: "Trash", icon: <Trash />, filter: "trash" },
                ].map(({ label, icon, filter, count }) => (
                  <Button
                    key={filter}
                    variant={activeFilter === filter ? "default" : "ghost"}
                    className="w-full justify-start"
                    size="sm"
                    onClick={() => {
                      setActiveFilter(filter)
                      setActiveCategory(null)
                    }}
                  >
                    {icon}
                    <span className="ml-2">{label}</span>
                    {count !== undefined && (
                      <Badge className="ml-auto" variant="secondary">{count}</Badge>
                    )}
                  </Button>
                ))}
              </div>

              <div className="mt-6">
                <h3 className="mb-2 px-2 text-sm font-medium">Categories</h3>
                {["Remboursement", "Suivi", "Urgence", "Résiliation", "Personnel", "Autre"].map(category => (
                  <Button
                    key={category}
                    variant={activeCategory === category ? "default" : "ghost"}
                    className="w-full justify-start"
                    size="sm"
                    onClick={() => {
                      setActiveCategory(category as EmailCategory)
                      setActiveFilter("inbox")
                    }}
                  >
                    <Tag className="mr-2 h-4 w-4" />
                    {category}
                    <Badge className="ml-auto" variant="secondary">
                      {counts[category.toLowerCase() as keyof typeof counts]}
                    </Badge>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex-1">
          <Tabs defaultValue="emails">
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="emails">Emails</TabsTrigger>
              </TabsList>
              <Button variant="outline" size="sm" onClick={loadEmails} disabled={isLoading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                {isLoading ? "Loading..." : "Refresh"}
              </Button>
            </div>

            <TabsContent value="emails">
              <EmailList emails={filteredEmails} isLoading={isLoading} onRefresh={loadEmails} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
