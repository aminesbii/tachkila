#!/usr/bin/env node
/**
 * Resolves an online portrait for every seeded footballer and regenerates
 * `src/data/player-images.ts`.
 *
 *   npm run images
 *
 * The lookup is Wikipedia's read-only API: it is free, keyless and its
 * `upload.wikimedia.org` thumbnails are safe to hot-link from the app. A player
 * is only accepted when the article is a footballer, the name matches and the
 * nationality in the short description agrees with the seed. Everyone else is
 * left out of the map, so the UI falls back to the first two letters of the name.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PLAYERS_SOURCE = path.join(ROOT, "src", "data", "players.ts");
const OUTPUT = path.join(ROOT, "src", "data", "player-images.ts");
const CACHE = path.join(ROOT, "scripts", ".player-images-cache.json");
const API = "https://en.wikipedia.org/w/api.php";
const USER_AGENT = "Tachkila/1.0 (local auction app; player portrait lookup)";
const THUMB_SIZE = 480;
const BATCH = 20;
/** Wikipedia throttles anonymous traffic; stay well under the limit. */
const MIN_GAP_MS = 1100;

/** Seed names that need a helping hand to find their article. */
const TITLES = {
  "Ali blaihi": "Ali Al-Bulaihi",
  "Ali maloul": "Ali Maâloul",
  "casias": "Iker Casillas",
  Dia: "Dida (footballer, born 1973)",
  Gavi: "Gavi (footballer)",
  Higuita: "René Higuita",
  "Issam Hadhari": "Essam El Hadary",
  "Kim Min-jae": "Kim Min-jae (footballer)",
  "nicolas opoco": "Nicholas Opoku",
  otchoua: "Guillermo Ochoa",
  "Saber Khlifa": "Saber Khalifa",
  "Soud abd alhamid": "Saud Abdulhamid",
  "Tarek Dhiab": "Tarak Dhiab",
  "Zied Jaziri": "Ziad Jaziri",
};

/** How each seed nationality shows up in a Wikipedia short description. */
const NATIONALITY = {
  Algeria: ["algerian"],
  Argentina: ["argentine", "argentinian"],
  Belgium: ["belgian"],
  Benin: ["beninese"],
  Brazil: ["brazilian"],
  Cameroon: ["cameroonian"],
  Chad: ["chadian"],
  Colombia: ["colombian"],
  "Costa Rica": ["costa rican"],
  "Côte d'Ivoire": ["ivorian", "ivory coast"],
  Croatia: ["croatian"],
  Egypt: ["egyptian"],
  England: ["english"],
  France: ["french"],
  Germany: ["german"],
  Ghana: ["ghanaian"],
  Guinea: ["guinean"],
  Italy: ["italian"],
  Libya: ["libyan"],
  Mali: ["malian"],
  Mexico: ["mexican"],
  Morocco: ["moroccan"],
  Netherlands: ["dutch"],
  Nigeria: ["nigerian"],
  Norway: ["norwegian"],
  Poland: ["polish"],
  Portugal: ["portuguese"],
  "Saudi Arabia": ["saudi"],
  Senegal: ["senegalese"],
  Serbia: ["serbian"],
  "South Korea": ["south korean", "korean"],
  Spain: ["spanish"],
  Switzerland: ["swiss"],
  Tunisia: ["tunisian"],
  Uruguay: ["uruguayan"],
};

const FOOTBALL = /football|soccer|goalkeeper|goaltender|defender|midfielder|forward|striker|winger/i;

/** Every country word we know, used to spot a description about another nation. */
const NATIONS = new Set(
  Object.entries(NATIONALITY).flatMap(([country, words]) => [fold(country), ...words])
);

function mentionsNation(description, nationality) {
  const text = fold(description);
  const expected = [fold(nationality), ...(NATIONALITY[nationality] ?? [])];
  const agreed = expected.some((word) => word && text.includes(word));
  const anyNation = [...NATIONS].some((word) => text.includes(word));
  // No country in the short description at all is fine — the name still matched.
  return agreed || !anyNation;
}

function slugify(name) {
  return (
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "player"
  );
}

function fold(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Reads the raw seed list and applies the same de-duplication as players.ts. */
async function readSeed() {
  const source = await readFile(PLAYERS_SOURCE, "utf8");
  const players = [];
  const seen = new Set();
  for (const match of source.matchAll(
    /id:\s*"([^"]+)"\s*,\s*name:\s*"([^"]+)"\s*,\s*position:\s*"[^"]+"\s*,\s*pts:\s*\d+\s*,\s*nationality:\s*"([^"]*)"/g
  )) {
    const name = match[2].trim().replace(/\s+/g, " ");
    const key = slugify(name);
    if (!name || seen.has(key)) continue;
    seen.add(key);
    players.push({ name, nationality: match[3].trim() });
  }
  return players;
}

const cache = new Map();
let lastCall = 0;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Keeps anonymous requests politely spaced. */
function gap() {
  const wait = Math.max(0, lastCall + MIN_GAP_MS - Date.now());
  lastCall = Date.now() + wait;
  return wait;
}

async function api(params, attempt = 0) {
  const key = JSON.stringify(params);
  if (cache.has(key)) return cache.get(key);

  const url = new URL(API);
  for (const [name, value] of Object.entries({ format: "json", origin: "*", ...params })) {
    url.searchParams.set(name, value);
  }

  await sleep(gap());
  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
  });
  if (response.status === 429 && attempt < 5) {
    await sleep(5000 * (attempt + 1));
    return api(params, attempt + 1);
  }
  if (!response.ok) throw new Error(`Wikipedia ${response.status} for ${url}`);
  const data = await response.json();
  cache.set(key, data);
  return data;
}

async function loadCache() {
  try {
    const raw = JSON.parse(await readFile(CACHE, "utf8"));
    for (const [key, value] of Object.entries(raw)) cache.set(key, value);
  } catch {
    // No cache yet: every lookup will hit the network.
  }
}

async function saveCache() {
  await writeFile(CACHE, JSON.stringify(Object.fromEntries(cache)), "utf8");
}

function thumbOf(page) {
  const source = page?.thumbnail?.source;
  return source ? source.split("?")[0] : null;
}

/** Requests a batch of exact article titles (following redirects). */
async function lookupTitles(titles) {
  const data = await api({
    action: "query",
    prop: "pageimages|description",
    piprop: "thumbnail",
    pithumbsize: String(THUMB_SIZE),
    redirects: "1",
    titles: titles.join("|"),
  });
  const query = data.query ?? {};
  const moved = new Map();
  for (const item of [...(query.normalized ?? []), ...(query.redirects ?? [])]) {
    moved.set(item.from, item.to);
  }
  const pages = new Map();
  for (const page of Object.values(query.pages ?? {})) pages.set(page.title, page);

  return titles.map((title) => {
    let current = title;
    for (let hop = 0; hop < 3; hop++) {
      const next = moved.get(current);
      if (!next || next === current) break;
      current = next;
    }
    return { title, page: pages.get(current) ?? pages.get(title) ?? null };
  });
}

/**
 * A player is accepted only when the article looks like the same footballer:
 * a portrait, a football description, their name in the title and the country
 * we expect. Anything less would put a stranger's face on the card.
 */
function verdict(player, page, curated) {
  if (!page) return "no article";
  if (!thumbOf(page)) return "no portrait";
  const description = page.description ?? "";
  const haystack = `${description} ${page.title}`;
  if (/disambiguation|surname list|topics referred|list of/i.test(description)) return `not a player: ${description}`;
  if (!FOOTBALL.test(haystack)) return `not football: ${description || "-"}`;

  if (player.nationality && !mentionsNation(description, player.nationality)) {
    return `nationality mismatch: ${description || "-"}`;
  }
  if (curated) return "ok";

  const tokens = fold(player.name)
    .split(" ")
    .filter((token) => token.length > 2);
  const text = `${fold(page.title)} ${fold(description)}`;
  const missing = tokens.filter((token) => !text.includes(token));
  if (missing.length > 0) return `name mismatch: ${page.title}`;
  return "ok";
}

async function main() {
  await loadCache();
  const players = await readSeed();
  const wanted = new Map(players.map((player) => [TITLES[player.name] ?? player.name, player]));
  const resolved = new Map();
  const rejected = new Map();

  const titles = [...wanted.keys()];
  for (let i = 0; i < titles.length; i += BATCH) {
    const chunk = titles.slice(i, i + BATCH);
    for (const { title, page } of await lookupTitles(chunk)) {
      const player = wanted.get(title);
      if (!player) continue;
      const reason = verdict(player, page, Boolean(TITLES[player.name]));
      if (reason === "ok") resolved.set(player.name, thumbOf(page));
      else rejected.set(player.name, page?.title ? `${reason}` : reason);
    }
  }
  await saveCache();

  const lines = players.map((player) => {
    const url = resolved.get(player.name);
    return url ? `  ${JSON.stringify(player.name)}: ${JSON.stringify(url)},` : null;
  });

  const file = `// Generated by scripts/fetch-player-images.mjs — do not edit by hand.
// Run \`npm run images\` to refresh the portraits.
//
// Online portrait for each seeded footballer. A missing entry means no reliable
// picture was found, and the UI falls back to the first two letters of the name.

export const PLAYER_IMAGES: Record<string, string> = {
${lines.filter(Boolean).join("\n")}
};

export const PLAYER_IMAGE_COUNT = ${resolved.size};
export const PLAYER_TOTAL_COUNT = ${players.length};
`;

  await writeFile(OUTPUT, file, "utf8");

  console.log(`Resolved ${resolved.size}/${players.length} portraits.`);
  if (rejected.size > 0) {
    console.log("\nLeft without a picture:");
    for (const [name, reason] of rejected) console.log(`  ${name} — ${reason}`);
  }
}

await main();
