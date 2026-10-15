/**
 * Puts `removed` items back into `current` at their positions in `snapshot`,
 * keeping any edits or additions made since the snapshot was taken.
 */
export function restoreRemoved<T extends { id: string }>(current: T[], snapshot: T[], removed: T[]) {
  const live = new Map(current.map((item) => [item.id, item]))
  const removedIds = new Set(removed.map((item) => item.id))
  const snapshotIds = new Set(snapshot.map((item) => item.id))

  const restored = snapshot.flatMap((item) => {
    if (removedIds.has(item.id)) return [live.get(item.id) ?? item]
    const kept = live.get(item.id)
    return kept ? [kept] : []
  })
  const added = current.filter((item) => !snapshotIds.has(item.id))
  return [...restored, ...added]
}
