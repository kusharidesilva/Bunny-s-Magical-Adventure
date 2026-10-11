const paths: Record<string, string> = {
  play: '<path d="m9 5 11 7-11 7Z" fill="currentColor" stroke="none"/>',
  arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  back: '<path d="M19 12H5m6-6-6 6 6 6"/>',
  star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9Z"/>',
  gem: '<path d="m7 4-4 6 9 11 9-11-4-6Zm-4 6h18M7 4l5 17 5-17"/>',
  heart: '<path d="M20.7 5.5a5.3 5.3 0 0 0-7.5 0L12 6.7l-1.2-1.2a5.3 5.3 0 0 0-7.5 7.5L12 21l8.7-8a5.3 5.3 0 0 0 0-7.5Z"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2"/>',
  settings: '<path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1M5.6 18.4l2.1-2.1m8.6-8.6 2.1-2.1"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.7-2.5 1.7-2.5 3.5M12 16h.01"/>',
  sound: '<path d="m11 4-6 5H2v6h3l6 5Zm4 4a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
  mute: '<path d="m11 4-6 5H2v6h3l6 5Zm5 5 5 6m0-6-5 6"/>',
  expand: '<path d="M4 9V4h5m6 0h5v5M4 15v5h5m6 0h5v-5"/>',
  collapse: '<path d="M9 4v5H4m16 0h-5V4M9 20v-5H4m16 0h-5v5"/>',
  pause: '<path d="M9 5v14M15 5v14" stroke-width="3.5"/>',
  leaf: '<path d="M20 3C10 2 2 8 5 15s14 3 15-12ZM4 21 16 8"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  book: '<path d="M12 6c-4-3-7-3-10-2v15c4-1 7-1 10 2 3-3 6-3 10-2V4c-3-1-6-1-10 2Zm0 0v15"/>',
};

export const icon = (name: string, className = ''): string => `<svg class="icon ${className}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] ?? paths.star}</svg>`;

export const starRating = (earned: number, total = 3): string => `<div class="star-rating" aria-label="${earned} of ${total} stars">${Array.from({ length: total }, (_, index) => icon('star', index < earned ? 'earned' : 'empty')).join('')}</div>`;

export const worldArt = (id: number): string => `/assets/art/${id === 2 ? 'candy' : id === 3 ? 'moonlight' : 'forest'}.svg`;
