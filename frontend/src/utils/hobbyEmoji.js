/**
 * Map hobby/interest keywords to emojis for display on tutor cards.
 * Case-insensitive partial match; first match wins.
 */
const HOBBY_EMOJI_MAP = [
  ['swim', '🏊'],
  ['guitar', '🎸'],
  ['piano', '🎹'],
  ['music', '🎵'],
  ['coding', '💻'],
  ['code', '💻'],
  ['gaming', '🎮'],
  ['game', '🎮'],
  ['reading', '📖'],
  ['read', '📖'],
  ['research', '🧬'],
  ['running', '🏃'],
  ['run ', '🏃'],
  ['yoga', '🧘'],
  ['gym', '💪'],
  ['fitness', '💪'],
  ['soccer', '⚽'],
  ['basketball', '🏀'],
  ['tennis', '🎾'],
  ['hiking', '🥾'],
  ['hike', '🥾'],
  ['climbing', '🧗'],
  ['climb', '🧗'],
  ['photography', '📷'],
  ['photo', '📷'],
  ['cooking', '🍳'],
  ['cook', '🍳'],
  ['baking', '🧁'],
  ['bake', '🧁'],
  ['travel', '✈️'],
  ['dancing', '💃'],
  ['dance', '💃'],
  ['chess', '♟️'],
  ['volunteer', '🤝'],
  ['painting', '🎨'],
  ['paint', '🎨'],
  ['pottery', '🫙'],
  ['board game', '🎲'],
  ['podcast', '🎧'],
  ['anime', '🎌'],
  ['design', '✨'],
  ['streaming', '📺'],
  ['ctf', '🔐'],
  ['swimming', '🏊'],
  ['bike', '🚴'],
  ['cycling', '🚴'],
  ['coffee', '☕'],
  ['writing', '✍️'],
  ['blog', '✍️'],
  ['comedy', '🎤'],
  ['piano', '🎹'],
  ['cricket', '🏏'],
  ['marathon', '🏃'],
  ['woodwork', '🪵'],
  ['brew', '🍺'],
  ['animal', '🐾'],
  ['korean', '🇰🇷'],
  ['novel', '📚'],
  ['sci-fi', '🚀'],
  ['thriller', '📚'],
  ['mystery', '🔍'],
  ['business', '📊'],
  ['3d', '🎨'],
  ['modeling', '🎨'],
  ['skateboard', '🛹'],
  ['production', '🎛️'],
  ['bollywood', '🎬'],
];

function getEmojiForHobby(text) {
  if (!text || typeof text !== 'string') return '✨';
  const lower = text.trim().toLowerCase();
  for (const [keyword, emoji] of HOBBY_EMOJI_MAP) {
    if (lower.includes(keyword)) return emoji;
  }
  return '✨';
}

/**
 * Parse a hobbies string (e.g. "Guitar, hiking, photography") into
 * [{ label, emoji }, ...] for display.
 */
export function parseHobbies(hobbiesStr) {
  if (!hobbiesStr || typeof hobbiesStr !== 'string') return [];
  return hobbiesStr
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 6)
    .map((label) => ({ label, emoji: getEmojiForHobby(label) }));
}
