"use client"

import { useEffect } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Mail, User2, X } from "lucide-react"
import { Email } from "@/lib/types"

interface EmailDetailsProps {
  email: Email
  onClose: () => void
}

export default function EmailDetails({ email, onClose }: EmailDetailsProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [onClose])

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-screen overflow-y-auto">
        <DialogTitle className="sr-only">Email Details</DialogTitle>

        <div className="flex items-start justify-between border-b pb-3 mb-4">
          <div>
            <h2 className="text-xl font-bold mb-1">{email.subject}</h2>
            <div className="text-sm text-muted-foreground mb-1">
              <User2 className="inline mr-1 w-4 h-4" />
              {email.sender}
            </div>
            <div className="text-xs text-muted-foreground">
              {new Date(email.date).toLocaleString()}
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <Badge variant="outline">{email.category}</Badge>
          <Badge variant="secondary">{email.priority}</Badge>
        </div>

        {/* Email content rendered as HTML like Gmail */}
        <div
          className="border p-4 rounded-md prose max-w-none"
          dangerouslySetInnerHTML={{
            __html: email.body || "<p><i>Email content not available</i></p>",
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
