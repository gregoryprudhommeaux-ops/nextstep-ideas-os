/** Google OAuth often blocks sign-in inside embedded IDE / Electron webviews. */
export function isLikelyEmbeddedBrowser(): boolean {
  const ua = navigator.userAgent
  if (/Electron|Cursor|VSCode|Headless|Puppeteer/i.test(ua)) return true
  // Chromium WebViews often report Chrome without a usable window.chrome object.
  if (/Chrome/i.test(ua) && !('chrome' in window)) return true
  return false
}
