function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const MAX_FETCH_ATTEMPTS = 3;
const RETRY_DELAYS_MS = [800, 1600]; // pause before attempt 2, then before attempt 3

// Supabase queries resolve with { data, error } rather than throwing, so a
// failure has to be checked on the result, not caught. Several queries
// often fire in parallel on a single page/section load — with that many
// round trips, a transient blip (a brief network drop, a cold-start
// hiccup) hitting at least one of them is a real, expected occurrence, not
// a sign anything is actually broken. Without a retry, any single query
// failing took down the whole load and forced a manual "reload" click.
//
// This retries the *whole* batch together (rather than tracking which one
// query failed) — these are small, fast reads, so redoing all of them
// costs nothing meaningful — with a short pause between attempts, before
// ever surfacing an error.
//
// Only for automatic loads triggered on mount. Never wrap a user-initiated
// write (a save, a reorder, a delete) in this — those already get a toast
// and a manual retry when they fail, which is the right UX for something
// the person just clicked; silently retrying a write behind their back
// isn't the same kind of safe default that retrying a read is.
export async function fetchAllWithRetry(queryThunks) {
  let lastResults;
  for (let attempt = 0; attempt < MAX_FETCH_ATTEMPTS; attempt++) {
    if (attempt > 0) {
      await delay(RETRY_DELAYS_MS[attempt - 1]);
    }
    lastResults = await Promise.all(queryThunks.map((thunk) => thunk()));
    const hasError = lastResults.some((result) => result.error);
    if (!hasError) return lastResults;
  }
  return lastResults; // exhausted retries — caller's existing error handling takes over
}
