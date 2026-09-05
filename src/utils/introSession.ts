// Module-scoped flag: resets on a real page load/refresh, persists across in-app route changes.
let introPlayedThisPageLoad = false;

export function hasIntroPlayed(): boolean {
  return introPlayedThisPageLoad;
}

export function markIntroPlayed(): void {
  introPlayedThisPageLoad = true;
}
