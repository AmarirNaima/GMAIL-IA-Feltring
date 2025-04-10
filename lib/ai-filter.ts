// ✅ lib/ai-filter.ts (FINAL VERSION)
import OpenAI from "openai"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

// ✅ Manual keyword mapping
const keywordMap: { [key: string]: string[] } = {
  Suivi: ["suivi", "colis", "reçu", "livraison", "tracking"],
  Remboursement: ["remboursement", "rembourse", "argent", "payer", "rembourser"],
  Urgence: ["plainte", "police", "urgence", "remonter", "immédiat"],
  Résiliation: ["résilier", "annuler", "résiliation", "met fin"],
}

function categorizeByKeyword(content: string): string | null {
  const lower = content.toLowerCase()
  for (const category in keywordMap) {
    if (keywordMap[category].some(word => lower.includes(word))) {
      return category
    }
  }
  return null
}

export async function categorizeEmail(email: { subject: string; sender: string; body?: string }) {
  const fullText = `${email.subject} ${email.body || ""}`

  // 🔍 Fast keyword-based categorization
  const keywordCategory = categorizeByKeyword(fullText)
  if (keywordCategory) return keywordCategory

  // 🧠 Fallback to OpenAI if keywords not matched
  const prompt = `
Tu es un assistant d'email intelligent. Lis le sujet, l'expéditeur et le contenu d'un email, et catégorise-le dans l'une des étiquettes suivantes :

- Remboursement
- Suivi
- Urgence
- Résiliation
- Support
- Facture
- Newsletter
- Personnel
- Autre

Voici l'email :

Expéditeur : ${email.sender}
Sujet : ${email.subject}
Contenu : ${email.body || "non disponible"}

Réponds uniquement avec l'étiquette exacte (sans phrase ni ponctuation).`

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
  })

  return completion.choices[0].message.content?.trim() || "Autre"
}

export async function prioritizeEmail(email: { subject: string; sender: string }) {
  const prompt = `
Tu es un assistant d'email. Analyse cet email et donne une priorité parmi : urgent, important, normal, faible.

Expéditeur : ${email.sender}
Sujet : ${email.subject}

Réponds uniquement avec la priorité exacte (sans phrase ni ponctuation).`

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
  })

  const raw = completion.choices[0].message.content?.trim().toLowerCase()

  switch (raw) {
    case "urgent":
    case "important":
    case "normal":
      return raw
    case "faible":
    case "low":
      return "low"
    default:
      return "normal"
  }
}
