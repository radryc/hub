/* Apply the saved theme before first paint. No dependencies. */
(() => {
  'use strict';

  const KEY = 'strata-theme';
  const allowed = new Set(['midnight', 'daylight']);
  let theme = null;

  try {
    theme = localStorage.getItem(KEY);
  } catch {
    theme = null;
  }

  if (!allowed.has(theme)) {
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    theme = prefersLight ? 'daylight' : 'midnight';
  }

  document.documentElement.dataset.theme = theme;
})();
