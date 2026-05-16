export const CATEGORY_KEYS = [
  { key: "catClimbing", emoji: "🧗" },
  { key: "catSnowTouring", emoji: "❄️" },
  { key: "catBikeBags", emoji: "🎒" },
  { key: "catRoofTents", emoji: "🚗" },
  { key: "catTents", emoji: "🏕️" },
  { key: "catBackpacks", emoji: "🎒" },
  { key: "catSleepingBags", emoji: "🛏️" },
  { key: "catBikesEbikes", emoji: "🚲" },
  { key: "catSki", emoji: "⛷️" },
  { key: "catCamping", emoji: "🏕️" },
  { key: "catWaterSports", emoji: "🚣" },
  { key: "catOther", emoji: "📦" },
] as const;

export type CategoryKey = (typeof CATEGORY_KEYS)[number]["key"];
