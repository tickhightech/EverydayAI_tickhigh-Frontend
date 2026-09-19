// Lucide-compliant SVG dictionary for Admin and Telecom Subscriber Portals
const SVG_ATTRS = 'viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';

export const icons = {
  // Navigation
  dashboard: `<svg ${SVG_ATTRS} width="18" height="18"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>`,
  operators: `<svg ${SVG_ATTRS} width="18" height="18"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  agents: `<svg ${SVG_ATTRS} width="18" height="18"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>`,
  plans: `<svg ${SVG_ATTRS} width="18" height="18"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
  providers: `<svg ${SVG_ATTRS} width="18" height="18"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>`,
  subscribers: `<svg ${SVG_ATTRS} width="18" height="18"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  notifications: `<svg ${SVG_ATTRS} width="18" height="18"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>`,
  swagger: `<svg ${SVG_ATTRS} width="18" height="18"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10"/><path d="M6 10h10"/></svg>`,
  logout: `<svg ${SVG_ATTRS} width="18" height="18"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>`,
  
  // Controls & Actions
  plus: `<svg ${SVG_ATTRS} width="16" height="16"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>`,
  check: `<svg ${SVG_ATTRS} width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg>`,
  close: `<svg ${SVG_ATTRS} width="18" height="18"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>`,
  refresh: `<svg ${SVG_ATTRS} width="16" height="16"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>`,
  edit: `<svg ${SVG_ATTRS} width="15" height="15"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>`,
  trash: `<svg ${SVG_ATTRS} width="15" height="15"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`,
  palette: `<svg ${SVG_ATTRS} width="16" height="16"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>`,
  settings: `<svg ${SVG_ATTRS} width="16" height="16"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>`,
  globe: `<svg ${SVG_ATTRS} width="16" height="16"><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
  search: `<svg ${SVG_ATTRS} width="16" height="16"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>`,
  arrowRight: `<svg ${SVG_ATTRS} width="16" height="16"><line x1="5" x2="19" y1="12" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
  zap: `<svg ${SVG_ATTRS} width="16" height="16"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  server: `<svg ${SVG_ATTRS} width="18" height="18"><rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/></svg>`,
  database: `<svg ${SVG_ATTRS} width="18" height="18"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>`,
  shield: `<svg ${SVG_ATTRS} width="18" height="18"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  signal: `<svg ${SVG_ATTRS} width="18" height="18"><path d="M2 20h.01"/><path d="M7 20v-4"/><path d="M12 20v-8"/><path d="M17 20V4"/></svg>`,
  creditCard: `<svg ${SVG_ATTRS} width="18" height="18"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>`,
  users: `<svg ${SVG_ATTRS} width="18" height="18"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  trendingUp: `<svg ${SVG_ATTRS} width="14" height="14"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,

  // Standard Lucide Category Icons for AI Assistants
  utensils: `<svg ${SVG_ATTRS}><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>`,
  'graduation-cap': `<svg ${SVG_ATTRS}><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`,
  'book-open': `<svg ${SVG_ATTRS}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
  'heart-pulse': `<svg ${SVG_ATTRS}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/></svg>`,
  dumbbell: `<svg ${SVG_ATTRS}><path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/></svg>`,
  activity: `<svg ${SVG_ATTRS}><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`,
  wallet: `<svg ${SVG_ATTRS}><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>`,
  coins: `<svg ${SVG_ATTRS}><circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82"/></svg>`,
  plane: `<svg ${SVG_ATTRS}><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>`,
  compass: `<svg ${SVG_ATTRS}><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`,
  sparkles: `<svg ${SVG_ATTRS}><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>`,
  music: `<svg ${SVG_ATTRS}><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,
  camera: `<svg ${SVG_ATTRS}><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>`,
  'message-square': `<svg ${SVG_ATTRS}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  briefcase: `<svg ${SVG_ATTRS}><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
  code: `<svg ${SVG_ATTRS}><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
  'shield-check': `<svg ${SVG_ATTRS}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>`,
  'shopping-cart': `<svg ${SVG_ATTRS}><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>`,
  newspaper: `<svg ${SVG_ATTRS}><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/></svg>`,
  home: `<svg ${SVG_ATTRS}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  smile: `<svg ${SVG_ATTRS}><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg>`,
  bot: `<svg ${SVG_ATTRS}><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/><path d="M12 2v4"/><circle cx="12" cy="2" r="1"/></svg>`,

  // Aliases for backwards compatibility
  chef: `<svg ${SVG_ATTRS}><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>`,
  tutor: `<svg ${SVG_ATTRS}><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`,
  doctor: `<svg ${SVG_ATTRS}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/></svg>`,
  finance: `<svg ${SVG_ATTRS}><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>`,
  travel: `<svg ${SVG_ATTRS}><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>`,
  fitness: `<svg ${SVG_ATTRS}><path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/></svg>`,
  creative: `<svg ${SVG_ATTRS}><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>`,
};

/**
 * Curated list of telecom VAS category icons for Admin Pickers.
 */
export const CURATED_ICON_CATALOG = [
  { id: 'utensils', label: 'Recipes & Cooking', category: 'Lifestyle', color: '#F97316' },
  { id: 'heart-pulse', label: 'Health & Wellness', category: 'Wellness', color: '#10B981' },
  { id: 'dumbbell', label: 'Fitness & Gym', category: 'Wellness', color: '#EF4444' },
  { id: 'activity', label: 'Daily Vitals & Habit', category: 'Wellness', color: '#14B8A6' },
  { id: 'graduation-cap', label: 'Education & Study', category: 'Education', color: '#3B82F6' },
  { id: 'book-open', label: 'Reading & Books', category: 'Education', color: '#6366F1' },
  { id: 'wallet', label: 'Finance & Budget', category: 'Finance', color: '#EAB308' },
  { id: 'coins', label: 'Savings & Money', category: 'Finance', color: '#F59E0B' },
  { id: 'plane', label: 'Travel & Trips', category: 'Travel', color: '#8B5CF6' },
  { id: 'compass', label: 'Local Guide & City', category: 'Travel', color: '#06B6D4' },
  { id: 'sparkles', label: 'Fun & Creative', category: 'Creative', color: '#EC4899' },
  { id: 'music', label: 'Music & Audio', category: 'Creative', color: '#A855F7' },
  { id: 'camera', label: 'Art & Photography', category: 'Creative', color: '#0EA5E9' },
  { id: 'message-square', label: 'Chat & Writing', category: 'Social', color: '#3B82F6' },
  { id: 'briefcase', label: 'Career & Work', category: 'Work', color: '#64748B' },
  { id: 'code', label: 'Coding & Tech', category: 'Work', color: '#10B981' },
  { id: 'shield-check', label: 'Security & Safety', category: 'Safety', color: '#059669' },
  { id: 'shopping-cart', label: 'Shopping & Deals', category: 'Lifestyle', color: '#F97316' },
  { id: 'newspaper', label: 'News & Current Affairs', category: 'Lifestyle', color: '#475569' },
  { id: 'home', label: 'Home & Parenting', category: 'Lifestyle', color: '#0284C7' },
  { id: 'smile', label: 'Lifestyle & Mood', category: 'Wellness', color: '#F59E0B' },
  { id: 'bot', label: 'Everyday Assistant', category: 'General', color: '#6366F1' },
];

/**
 * Maps a category slug, identifier, or freeform name to its best SVG icon.
 * @param {string} category
 * @returns {string} SVG HTML string
 */
export function getCategoryIcon(category = '') {
  if (!category) return icons.bot;
  const c = String(category).toLowerCase().trim();

  // Direct exact match
  if (icons[c]) return icons[c];

  // Common synonyms / topic match
  if (c.includes('recipe') || c.includes('cook') || c.includes('culinary') || c.includes('food') || c.includes('dish') || c.includes('utensil')) return icons.utensils;
  if (c.includes('edu') || c.includes('study') || c.includes('tutor') || c.includes('school') || c.includes('exam') || c.includes('college')) return icons['graduation-cap'];
  if (c.includes('book') || c.includes('read') || c.includes('story') || c.includes('lit')) return icons['book-open'];
  if (c.includes('health') || c.includes('doctor') || c.includes('medical') || c.includes('wellness') || c.includes('pulse')) return icons['heart-pulse'];
  if (c.includes('gym') || c.includes('fit') || c.includes('workout') || c.includes('dumbbell') || c.includes('exercise')) return icons.dumbbell;
  if (c.includes('finance') || c.includes('money') || c.includes('budget') || c.includes('bank') || c.includes('wallet')) return icons.wallet;
  if (c.includes('coin') || c.includes('invest') || c.includes('cash')) return icons.coins;
  if (c.includes('travel') || c.includes('trip') || c.includes('flight') || c.includes('vacation') || c.includes('plane')) return icons.plane;
  if (c.includes('compass') || c.includes('city') || c.includes('explore') || c.includes('local') || c.includes('guide')) return icons.compass;
  if (c.includes('creative') || c.includes('fun') || c.includes('joke') || c.includes('spark') || c.includes('magic')) return icons.sparkles;
  if (c.includes('music') || c.includes('song') || c.includes('audio')) return icons.music;
  if (c.includes('camera') || c.includes('photo') || c.includes('art') || c.includes('pic')) return icons.camera;
  if (c.includes('chat') || c.includes('message') || c.includes('comm')) return icons['message-square'];
  if (c.includes('job') || c.includes('career') || c.includes('work') || c.includes('biz') || c.includes('briefcase')) return icons.briefcase;
  if (c.includes('code') || c.includes('tech') || c.includes('prog') || c.includes('dev')) return icons.code;
  if (c.includes('shield') || c.includes('secur') || c.includes('safe') || c.includes('privacy')) return icons['shield-check'];
  if (c.includes('shop') || c.includes('cart') || c.includes('deal') || c.includes('buy')) return icons['shopping-cart'];
  if (c.includes('news') || c.includes('paper') || c.includes('article')) return icons.newspaper;
  if (c.includes('home') || c.includes('house') || c.includes('family') || c.includes('parent')) return icons.home;
  if (c.includes('smile') || c.includes('mood') || c.includes('life')) return icons.smile;

  return icons.bot;
}

/**
 * Universal Smart Icon Renderer.
 * Supports:
 * 1. Image URLs (https://..., http://..., data:image/...) -> renders <img>
 * 2. Standard Lucide Icon Keys ('utensils', 'heart-pulse', etc.) -> renders clean SVG with custom size & stroke color
 * 3. Fallback to generic Bot SVG
 * 
 * @param {Object} options
 * @param {string} options.icon - Icon identifier or image URL
 * @param {string} [options.color='currentColor'] - Hex stroke color or CSS variable
 * @param {number} [options.size=20] - Width/height in pixels
 * @param {string} [options.className=''] - Extra CSS class names
 * @param {string} [options.style=''] - Extra inline CSS styles
 * @returns {string} Rendered HTML string (<img> or <svg>)
 */
export function renderSmartIcon({
  icon = 'bot',
  color = 'currentColor',
  size = 20,
  className = '',
  style = '',
} = {}) {
  const iconStr = String(icon || 'bot').trim();

  // 1. External Image or CDN URL
  if (
    iconStr.startsWith('http://') ||
    iconStr.startsWith('https://') ||
    iconStr.startsWith('data:image/') ||
    iconStr.startsWith('/') ||
    /\.(png|jpe?g|svg|webp|gif|ico)(\?.*)?$/i.test(iconStr)
  ) {
    return `<img src="${iconStr}" width="${size}" height="${size}" alt="icon" class="${className}" style="width: ${size}px; height: ${size}px; object-fit: contain; display: inline-block; vertical-align: middle; border-radius: 4px; ${style}" onerror="this.onerror=null;this.replaceWith(document.createRange().createContextualFragment('${icons.bot}'));" />`;
  }

  // 2. Lucide SVG Resolution
  let rawSvg = icons[iconStr] || getCategoryIcon(iconStr);
  if (!rawSvg) rawSvg = icons.bot;

  // Dynamically update dimensions, stroke color, and attributes
  return rawSvg
    .replace(/width="[^"]*"/i, `width="${size}"`)
    .replace(/height="[^"]*"/i, `height="${size}"`)
    .replace(/stroke="[^"]*"/i, `stroke="${color}"`)
    .replace(/<svg\s/i, `<svg class="${className}" style="display: inline-block; vertical-align: middle; ${style}" `);
}
