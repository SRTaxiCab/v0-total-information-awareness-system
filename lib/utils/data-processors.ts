// Utility functions for data processing and analysis

export function extractDateFromText(text: string): Date | null {
  // Simple date extraction - can be enhanced with more sophisticated NLP
  const datePatterns = [
    /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
    /(\d{4})-(\d{2})-(\d{2})/,
    /(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})/i,
  ]

  for (const pattern of datePatterns) {
    const match = text.match(pattern)
    if (match) {
      return new Date(match[0])
    }
  }

  return null
}

export function extractEntitiesFromText(text: string) {
  // Simple entity extraction - in production would use NLP library
  const entities = {
    people: [] as string[],
    organizations: [] as string[],
    locations: [] as string[],
  }

  // Extract capitalized words (simple approach)
  const capitalizedWords = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || []

  // Common organizational suffixes
  const orgSuffixes = ["Inc", "Corp", "LLC", "Ltd", "Company", "Organization"]

  capitalizedWords.forEach((word) => {
    if (orgSuffixes.some((suffix) => word.includes(suffix))) {
      entities.organizations.push(word)
    } else {
      // Simple heuristic: 2+ capitalized words likely a person name
      const wordCount = word.split(" ").length
      if (wordCount >= 2) {
        entities.people.push(word)
      }
    }
  })

  return entities
}

export function calculateSimilarity(text1: string, text2: string): number {
  // Simple Jaccard similarity
  const words1 = new Set(text1.toLowerCase().split(/\s+/))
  const words2 = new Set(text2.toLowerCase().split(/\s+/))

  const intersection = new Set([...words1].filter((x) => words2.has(x)))
  const union = new Set([...words1, ...words2])

  return intersection.size / union.size
}

export function generateSummary(text: string, maxLength = 200): string {
  // Simple extractive summary - take first N characters
  if (text.length <= maxLength) return text

  const truncated = text.substring(0, maxLength)
  const lastSpace = truncated.lastIndexOf(" ")

  return lastSpace > 0 ? truncated.substring(0, lastSpace) + "..." : truncated + "..."
}

export function detectLanguage(text: string): string {
  // Very simple language detection
  const sample = text.substring(0, 100).toLowerCase()

  if (/[а-яё]/.test(sample)) return "ru"
  if (/[一-龯]/.test(sample)) return "zh"
  if (/[ぁ-んァ-ン]/.test(sample)) return "ja"
  if (/[가-힣]/.test(sample)) return "ko"
  if (/[à-ÿ]/.test(sample)) return "fr"
  if (/[ä-ü]/.test(sample)) return "de"
  if (/[á-ú]/.test(sample)) return "es"

  return "en"
}

export function findKeywords(text: string, topN = 10): string[] {
  // Simple keyword extraction by frequency
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)

  // Filter out common stop words
  const stopWords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "from",
    "as",
    "is",
    "was",
    "are",
    "were",
    "been",
    "be",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "may",
    "might",
    "must",
    "can",
    "this",
    "that",
    "these",
    "those",
  ])

  const filteredWords = words.filter((word) => word.length > 3 && !stopWords.has(word))

  const frequency = new Map<string, number>()
  filteredWords.forEach((word) => {
    frequency.set(word, (frequency.get(word) || 0) + 1)
  })

  return Array.from(frequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word]) => word)
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
}

export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-z0-9.\-_]/gi, "_")
    .replace(/_{2,}/g, "_")
    .toLowerCase()
}
