/**
 * Maps dish names to food emojis using fuzzy keyword matching
 */

const DISH_EMOJI_MAP = [
  // Indian
  { keywords: ['biryani', 'biriyani', 'pulao', 'pulav'], emoji: '🍚' },
  { keywords: ['naan', 'roti', 'chapati', 'paratha', 'kulcha', 'bread'], emoji: '🫓' },
  { keywords: ['dal', 'dhal', 'daal', 'lentil'], emoji: '🥘' },
  { keywords: ['paneer', 'cottage'], emoji: '🧀' },
  { keywords: ['tikka', 'tandoori', 'kebab', 'kabab'], emoji: '🍢' },
  { keywords: ['curry', 'masala', 'gravy', 'korma', 'vindaloo'], emoji: '🍛' },
  { keywords: ['dosa', 'idli', 'uttapam', 'vada', 'appam'], emoji: '🥞' },
  { keywords: ['chutney', 'pickle', 'achar'], emoji: '🫙' },
  { keywords: ['samosa', 'pakora', 'bhaji', 'fritter'], emoji: '🥟' },
  { keywords: ['raita', 'curd', 'yogurt', 'lassi'], emoji: '🥛' },
  { keywords: ['gulab', 'jalebi', 'kheer', 'halwa', 'ladoo', 'rasmalai', 'dessert', 'sweet'], emoji: '🍮' },
  { keywords: ['chaat', 'pani puri', 'bhel'], emoji: '🥗' },

  // Chinese / Asian
  { keywords: ['noodle', 'chow', 'mein', 'ramen', 'pho', 'udon', 'soba'], emoji: '🍜' },
  { keywords: ['rice', 'fried rice', 'steamed rice', 'jeera rice'], emoji: '🍚' },
  { keywords: ['momos', 'dimsum', 'dim sum', 'dumpling', 'wonton'], emoji: '🥟' },
  { keywords: ['spring roll', 'roll'], emoji: '🌯' },
  { keywords: ['soup', 'broth', 'shorba'], emoji: '🍲' },
  { keywords: ['manchurian', 'gobi', 'cauliflower'], emoji: '🥦' },
  { keywords: ['sushi'], emoji: '🍣' },
  { keywords: ['tofu', 'bean curd'], emoji: '🫘' },

  // Western
  { keywords: ['pizza'], emoji: '🍕' },
  { keywords: ['burger', 'hamburger'], emoji: '🍔' },
  { keywords: ['sandwich', 'sub', 'club'], emoji: '🥪' },
  { keywords: ['pasta', 'spaghetti', 'penne', 'macaroni', 'alfredo', 'carbonara'], emoji: '🍝' },
  { keywords: ['steak', 'beef', 'ribeye', 'sirloin'], emoji: '🥩' },
  { keywords: ['salad', 'caesar'], emoji: '🥗' },
  { keywords: ['fries', 'french fries', 'wedges'], emoji: '🍟' },
  { keywords: ['taco', 'burrito', 'quesadilla', 'nachos'], emoji: '🌮' },
  { keywords: ['hot dog', 'hotdog', 'sausage'], emoji: '🌭' },
  { keywords: ['waffle', 'pancake', 'crepe'], emoji: '🧇' },

  // Protein
  { keywords: ['chicken', 'poultry', 'wings', 'drumstick'], emoji: '🍗' },
  { keywords: ['fish', 'salmon', 'tuna', 'cod', 'prawn', 'shrimp', 'lobster', 'crab', 'seafood'], emoji: '🐟' },
  { keywords: ['mutton', 'lamb', 'goat'], emoji: '🍖' },
  { keywords: ['egg', 'omelette', 'omelet', 'scramble'], emoji: '🥚' },

  // Drinks
  { keywords: ['coffee', 'cappuccino', 'latte', 'espresso', 'americano', 'mocha'], emoji: '☕' },
  { keywords: ['tea', 'chai'], emoji: '🍵' },
  { keywords: ['juice', 'smoothie', 'shake', 'milkshake'], emoji: '🧃' },
  { keywords: ['cola', 'coke', 'pepsi', 'sprite', 'fanta', 'soda', 'soft drink', 'cold drink'], emoji: '🥤' },
  { keywords: ['beer', 'ale', 'lager', 'pint'], emoji: '🍺' },
  { keywords: ['wine', 'champagne', 'prosecco'], emoji: '🍷' },
  { keywords: ['cocktail', 'mojito', 'margarita', 'martini'], emoji: '🍸' },
  { keywords: ['whiskey', 'vodka', 'rum', 'gin', 'tequila', 'brandy', 'scotch'], emoji: '🥃' },
  { keywords: ['water', 'mineral', 'sparkling'], emoji: '💧' },

  // Misc
  { keywords: ['ice cream', 'gelato', 'sundae', 'scoop'], emoji: '🍨' },
  { keywords: ['cake', 'pastry', 'brownie', 'muffin', 'cupcake'], emoji: '🍰' },
  { keywords: ['chocolate', 'choco'], emoji: '🍫' },
  { keywords: ['bread', 'toast', 'bun'], emoji: '🍞' },
  { keywords: ['cheese'], emoji: '🧀' },
  { keywords: ['corn'], emoji: '🌽' },
  { keywords: ['mushroom'], emoji: '🍄' },
  { keywords: ['potato', 'aloo'], emoji: '🥔' },
];

const FALLBACK_EMOJIS = ['🍽️', '🥘', '🍲', '🍛', '🥧', '🫕', '🍱'];

/**
 * Get the best matching food emoji for a dish name
 * @param {string} dishName
 * @returns {string} emoji
 */
export function getDishEmoji(dishName) {
  const lower = dishName.toLowerCase();

  for (const entry of DISH_EMOJI_MAP) {
    for (const keyword of entry.keywords) {
      if (lower.includes(keyword)) {
        return entry.emoji;
      }
    }
  }

  // Deterministic fallback based on name hash
  let hash = 0;
  for (let i = 0; i < dishName.length; i++) {
    hash = ((hash << 5) - hash + dishName.charCodeAt(i)) | 0;
  }
  return FALLBACK_EMOJIS[Math.abs(hash) % FALLBACK_EMOJIS.length];
}

/**
 * Generate a vibrant color for a dish card based on its name
 * @param {string} name
 * @returns {string} HSL color
 */
export function getDishColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 60%, 65%)`;
}

/**
 * Avatar color palette for friends
 */
const AVATAR_COLORS = [
  '#ff6b6b', '#4ecdc4', '#ffd93d', '#a78bfa', '#60a5fa',
  '#f472b6', '#34d399', '#fb923c', '#c084fc', '#38bdf8',
  '#e879f9', '#a3e635', '#f87171', '#22d3ee', '#fbbf24',
];

/**
 * Get a consistent avatar color for a friend name
 * @param {string} name
 * @param {number} index
 * @returns {string} hex color
 */
export function getAvatarColor(name, index = 0) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

/**
 * Get initials from a name
 * @param {string} name
 * @returns {string} 1-2 character initials
 */
export function getInitials(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}
