// Color palette suitable for dark mode maps
export const USER_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#a855f7', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
  '#14b8a6', // teal
  '#84cc16', // lime
  '#e11d48', // rose
];

/**
 * Generate a consistent color for a given username.
 * @param {string} userName 
 * @returns {string} hex color
 */
export function getUserColor(userName) {
  if (!userName) return '#6b7280'; // gray for unknown
  
  let hash = 0;
  for (let i = 0; i < userName.length; i++) {
    hash = userName.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % USER_COLORS.length;
  return USER_COLORS[index];
}
