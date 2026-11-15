import { playClickSound } from './sound';

/**
 * Simple client-side SPA navigation helper.
 * Supports pushState and popstate dispatch so transitions between pages are instant.
 * Automatically plays a tactile clicking sound on navigation.
 */
export function navigate(to) {
  if (typeof window === 'undefined') return;

  // Play clicking sound on every page navigation
  playClickSound();

  if (to.startsWith('/')) {
    window.history.pushState({}, '', to);
  } else if (to.startsWith('#')) {
    window.location.hash = to;
  } else {
    window.history.pushState({}, '', '/' + to);
  }

  // Dispatch popstate event so listeners update route state immediately
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export { playClickSound };
