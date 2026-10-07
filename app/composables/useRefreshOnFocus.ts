/**
 * The classic multi-user symptom: someone else changes data (assigns a unit,
 * accepts a report, etc.) and your already-open tab has no idea — it just
 * looks stale until you hit refresh. This re-runs the given refresh
 * functions whenever the tab becomes visible/focused again, which covers
 * the common case (switched tabs, came back later) without needing a full
 * realtime subscription.
 *
 * `minIntervalMs` guards against refetch storms if someone rapidly
 * alt-tabs in and out — it won't re-fire more often than this.
 */
export function useRefreshOnFocus(
  refreshFns: Array<() => Promise<unknown>>,
  opts?: { minIntervalMs?: number }
) {
  const minInterval = opts?.minIntervalMs ?? 15_000
  let lastRefresh = Date.now()

  function maybeRefresh() {
    if (document.visibilityState !== 'visible') return

    const now = Date.now()
    if (now - lastRefresh < minInterval) return
    lastRefresh = now

    Promise.all(refreshFns.map((fn) => fn())).catch(() => {
      // Individual composables already surface their own error state /
      // toasts on failure — a background refresh failing silently here is
      // fine, it'll just try again next time the tab regains focus.
    })
  }

  onMounted(() => {
    document.addEventListener('visibilitychange', maybeRefresh)
    window.addEventListener('focus', maybeRefresh)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('visibilitychange', maybeRefresh)
    window.removeEventListener('focus', maybeRefresh)
  })
}
