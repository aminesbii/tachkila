import type { Position } from "@/engine/types";

const FLAGS: Record<string, string> = {
  Tunisia: "🇹🇳",
  Spain: "🇪🇸",
  Brazil: "🇧🇷",
  Belgium: "🇧🇪",
  Morocco: "🇲🇦",
  Senegal: "🇸🇳",
  "Costa Rica": "🇨🇷",
  France: "🇫🇷",
  Netherlands: "🇳🇱",
  Croatia: "🇭🇷",
  Portugal: "🇵🇹",
  Switzerland: "🇨🇭",
  "South Korea": "🇰🇷",
  Germany: "🇩🇪",
  Italy: "🇮🇹",
  Argentina: "🇦🇷",
  England: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  Norway: "🇳🇴",
  Uruguay: "🇺🇾",
  Egypt: "🇪🇬",
  Poland: "🇵🇱",
  Nigeria: "🇳🇬",
  Serbia: "🇷🇸",
  Colombia: "🇨🇴",
  Mexico: "🇲🇽",
  Algeria: "🇩🇿",
  Mali: "🇲🇱",
  Benin: "🇧🇯",
  Chad: "🇹🇩",
  Libya: "🇱🇾",
  Ghana: "🇬🇭",
  Cameroon: "🇨🇲",
  Guinea: "🇬🇳",
  "Saudi Arabia": "🇸🇦",
  "Côte d'Ivoire": "🇨🇮",
};

const ALIASES: Record<string, string> = {
  Egyption: "Egypt",
  Italien: "Italy",
  Spanish: "Spain",
  Brazilian: "Brazil",
  Maroc: "Morocco",
  Negiria: "Nigeria",
  German: "Germany",
  Soudia: "Saudi Arabia",
  Algerie: "Algeria",
  Kameroun: "Cameroon",
  Guine: "Guinea",
  Tunisian: "Tunisia",
};

export function flagFor(nationality: string): string {
  return FLAGS[ALIASES[nationality] ?? nationality] ?? "🌍";
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function positionOrder(position: Position): number {
  return position === "GK" ? 0 : position === "DEF" ? 1 : position === "MID" ? 2 : 3;
}

export function formatRelative(epochMs: number, now = Date.now()): string {
  const diff = Math.max(0, now - epochMs);
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(epochMs).toLocaleDateString();
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return count === 1 ? singular : plural;
}

export function formatMoney(amount: number): string {
  return `${amount}`;
}
