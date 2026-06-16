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

/**
 * Darken a hex color by a given amount.
 * @param {string} hex 
 * @param {number} amount 0-255
 * @returns {string} darkened hex color
 */
export function darkenColor(hex, amount = 40) {
  if (!hex || hex === 'transparent') return hex;
  
  // Remove hash if present
  const useHash = hex.startsWith('#');
  const color = useHash ? hex.slice(1) : hex;
  
  // Parse r, g, b
  let r, g, b;
  if (color.length === 3) {
    r = parseInt(color[0] + color[0], 16);
    g = parseInt(color[1] + color[1], 16);
    b = parseInt(color[2] + color[2], 16);
  } else {
    r = parseInt(color.slice(0, 2), 16);
    g = parseInt(color.slice(2, 4), 16);
    b = parseInt(color.slice(4, 6), 16);
  }
  
  // Darken
  r = Math.max(0, r - amount);
  g = Math.max(0, g - amount);
  b = Math.max(0, b - amount);
  
  // Convert back to hex
  const toHex = (c) => c.toString(16).padStart(2, '0');
  return (useHash ? '#' : '') + toHex(r) + toHex(g) + toHex(b);
}
