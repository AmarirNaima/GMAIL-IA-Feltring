export type EmailCategory = "Work" | "Personal" | "Finance" | "Social" | "Promotions" | string

export type PriorityLevel = "urgent" | "important" | "normal" | "low"

export interface Email {
  id: string
  sender: string
  email: string
  subject: string
  preview: string
  time: string
  read: boolean
  body?: string
  category: EmailCategory
  priority: PriorityLevel
  archived?: boolean
  trash?: boolean
}

export interface FilterSettings {
  aiSensitivity: number
  autoArchive: boolean
  autoLabel: boolean
  categories: { name: string; description: string }[]
  urgentKeywords: string
  importantKeywords: string
}
