// lib/gmail-actions.ts
import { google } from "googleapis"
import { categorizeEmail, prioritizeEmail } from "@/lib/ai-filter"
import { Base64 } from "js-base64"

function getStartOfTodayTimestamp(): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.floor(today.getTime() / 1000)
}

function extractBody(payload: any): string {
  if (!payload) return ""
  const htmlPart = (payload.parts || []).find((part: any) => part.mimeType === "text/html")
  const bodyData = htmlPart?.body?.data || payload.body?.data
  if (!bodyData) return ""
  return Base64.decode(bodyData.replace(/-/g, "+").replace(/_/g, "/"))
}

export async function fetchEmails(accessToken: string, maxPages = 1) {
  if (!accessToken) throw new Error("No access token provided")

  const auth = new google.auth.OAuth2()
  auth.setCredentials({ access_token: accessToken })
  const gmail = google.gmail({ version: "v1", auth })

  const afterTimestamp = getStartOfTodayTimestamp()
  let allMessages: any[] = []
  let nextPageToken: string | undefined
  let pageCount = 0

  do {
    const res = await gmail.users.messages.list({
      userId: "me",
      maxResults: 20,
      pageToken: nextPageToken,
      q: `label:INBOX after:${afterTimestamp}`,
    })

    const messages = res.data.messages || []
    allMessages.push(...messages)
    nextPageToken = res.data.nextPageToken
    pageCount++
  } while (nextPageToken && pageCount < maxPages)

  const details: any[] = []

  const fetches = allMessages.map((msg) =>
    gmail.users.messages.get({ userId: "me", id: msg.id!, format: "full" })
  )

  const results = await Promise.allSettled(fetches)

  for (const result of results) {
    if (result.status !== "fulfilled") continue
    const full = result.value
    const headers = full.data.payload?.headers || []
    const getHeader = (name: string) =>
      headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value || ""

    const snippet = full.data.snippet || ""
    const html = extractBody(full.data.payload)

    const email = {
      id: full.data.id!,
      subject: getHeader("subject"),
      sender: getHeader("from"),
      date: getHeader("date"),
      preview: snippet,
      read: true,
      archived: false,
      trash: false,
      body: html,
      category: "En attente",
      priority: "normal",
    }

    try {
      email.category = await categorizeEmail({ subject: email.subject, sender: email.sender, body: snippet })
      email.priority = await prioritizeEmail({ subject: email.subject, sender: email.sender })
    } catch (err) {
      console.warn("AI fallback", err)
    }

    details.push(email)
  }

  return details
}