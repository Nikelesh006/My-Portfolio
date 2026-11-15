/**
 * Simple client-side SPA navigation helper.
 * Supports pushState and popstate dispatch so transitions between pages are instant.
 */
export function navigate(to) {
  if (typeof window === 'undefined') return;

  if (to.startsWith('/')) {
    window.history.pushState({}, '', to);
  } else if (to.startsWith('#')) {
    // If navigating to a hash on current page
    window.location.hash = to;
  } else {
    window.history.pushState({}, '', '/' + to);
  }

  // Dispatch popstate event so listeners update route state immediately
  window.dispatchEvent(new PopStateEvent('popstate'));
}
