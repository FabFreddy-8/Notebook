/** Every tag used across `items`, most frequent first. */
export function tagsByFrequency(items: { tags: string[] }[]) {
  const counts = new Map<string, number>()
  for (const item of items) for (const t of item.tags) counts.set(t, (counts.get(t) ?? 0) + 1)
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t)
}

/** Pulls "#tag" tokens out of free text: "Buy milk #errands" → { text: "Buy milk", tags: ["errands"] }. */
export function extractTags(input: string) {
  const tags: string[] = []
  const text = input
    .replace(/(^|\s)#([\p{L}\p{N}_-]+)/gu, (_, space: string, tag: string) => {
      tags.push(tag.toLowerCase())
      return space
    })
    .replace(/\s+/g, ' ')
    .trim()
  return { text, tags: [...new Set(tags)] }
}
