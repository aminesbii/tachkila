import type { Position } from "@/lib/types";

export interface PlayerSeed {
  id: string;
  name: string;
  position: Position;
  pts: number;
  nationality: string;
  imageUrl?: string;
}

export const PLAYERS: PlayerSeed[] = [
  // Goalkeepers
  { id: "p-chmakh", name: "Chmakh", position: "GK", pts: 1, nationality: "Tunisia" },
  { id: "p-raya", name: "David Raya", position: "GK", pts: 4, nationality: "Spain" },
  { id: "p-alisson", name: "Alisson Becker", position: "GK", pts: 4, nationality: "Brazil" },
  { id: "p-courtois", name: "Thibaut Courtois", position: "GK", pts: 4, nationality: "Belgium" },
  { id: "p-bounou", name: "Yassine Bounou", position: "GK", pts: 3, nationality: "Morocco" },
  { id: "p-mendy", name: "Édouard Mendy", position: "GK", pts: 2, nationality: "Senegal" },
  { id: "p-navas", name: "Keylor Navas", position: "GK", pts: 3, nationality: "Costa Rica" },
  { id: "p-areola", name: "Alphonse Areola", position: "GK", pts: 2, nationality: "France" },

  // Defenders
  { id: "p-saliba", name: "William Saliba", position: "DEF", pts: 4, nationality: "France" },
  { id: "p-vandijk", name: "Virgil van Dijk", position: "DEF", pts: 4, nationality: "Netherlands" },
  { id: "p-kounde", name: "Jules Koundé", position: "DEF", pts: 4, nationality: "France" },
  { id: "p-hakimi", name: "Achraf Hakimi", position: "DEF", pts: 4, nationality: "Morocco" },
  { id: "p-theo", name: "Theo Hernández", position: "DEF", pts: 4, nationality: "France" },
  { id: "p-gvardiol", name: "Joško Gvardiol", position: "DEF", pts: 4, nationality: "Croatia" },
  { id: "p-trent", name: "Trent Alexander-Arnold", position: "DEF", pts: 4, nationality: "England" },
  { id: "p-marquinhos", name: "Marquinhos", position: "DEF", pts: 4, nationality: "Brazil" },
  { id: "p-cancelo", name: "João Cancelo", position: "DEF", pts: 3, nationality: "Portugal" },
  { id: "p-akanji", name: "Manuel Akanji", position: "DEF", pts: 3, nationality: "Switzerland" },
  { id: "p-kim", name: "Kim Min-jae", position: "DEF", pts: 3, nationality: "South Korea" },
  { id: "p-deligt", name: "Matthijs de Ligt", position: "DEF", pts: 3, nationality: "Netherlands" },
  { id: "p-tah", name: "Jonathan Tah", position: "DEF", pts: 3, nationality: "Germany" },
  { id: "p-bastoni", name: "Alessandro Bastoni", position: "DEF", pts: 3, nationality: "Italy" },
  { id: "p-romero", name: "Cristian Romero", position: "DEF", pts: 3, nationality: "Argentina" },
  { id: "p-militao", name: "Éder Militão", position: "DEF", pts: 3, nationality: "Brazil" },
  { id: "p-varane", name: "Raphaël Varane", position: "DEF", pts: 3, nationality: "France" },
  { id: "p-udogie", name: "Destiny Udogie", position: "DEF", pts: 2, nationality: "Italy" },
  { id: "p-kimpembe", name: "Presnel Kimpembe", position: "DEF", pts: 2, nationality: "France" },
  { id: "p-umtiti", name: "Samuel Umtiti", position: "DEF", pts: 1, nationality: "France" },

  // Midfielders
  { id: "p-bellingham", name: "Jude Bellingham", position: "MID", pts: 4, nationality: "England" },
  { id: "p-kdb", name: "Kevin De Bruyne", position: "MID", pts: 4, nationality: "Belgium" },
  { id: "p-rodri", name: "Rodri", position: "MID", pts: 4, nationality: "Spain" },
  { id: "p-rice", name: "Declan Rice", position: "MID", pts: 4, nationality: "England" },
  { id: "p-musiala", name: "Jamal Musiala", position: "MID", pts: 4, nationality: "Germany" },
  { id: "p-odegaard", name: "Martin Ødegaard", position: "MID", pts: 4, nationality: "Norway" },
  { id: "p-bruno", name: "Bruno Fernandes", position: "MID", pts: 4, nationality: "Portugal" },
  { id: "p-kimmich", name: "Joshua Kimmich", position: "MID", pts: 4, nationality: "Germany" },
  { id: "p-barella", name: "Nicolò Barella", position: "MID", pts: 4, nationality: "Italy" },
  { id: "p-valverde", name: "Fede Valverde", position: "MID", pts: 4, nationality: "Uruguay" },
  { id: "p-pedri", name: "Pedri", position: "MID", pts: 3, nationality: "Spain" },
  { id: "p-gavi", name: "Gavi", position: "MID", pts: 3, nationality: "Spain" },
  { id: "p-camavinga", name: "Eduardo Camavinga", position: "MID", pts: 3, nationality: "France" },
  { id: "p-tchouameni", name: "Aurélien Tchouaméni", position: "MID", pts: 3, nationality: "France" },
  { id: "p-enzo", name: "Enzo Fernández", position: "MID", pts: 3, nationality: "Argentina" },
  { id: "p-modric", name: "Luka Modrić", position: "MID", pts: 3, nationality: "Croatia" },
  { id: "p-casemiro", name: "Casemiro", position: "MID", pts: 3, nationality: "Brazil" },
  { id: "p-vitinha", name: "Vitinha", position: "MID", pts: 3, nationality: "Portugal" },
  { id: "p-kante", name: "N'Golo Kanté", position: "MID", pts: 3, nationality: "France" },
  { id: "p-verratti", name: "Marco Verratti", position: "MID", pts: 3, nationality: "Italy" },
  { id: "p-guimaraes", name: "Bruno Guimarães", position: "MID", pts: 3, nationality: "Brazil" },
  { id: "p-caqueret", name: "Maxence Caqueret", position: "MID", pts: 1, nationality: "France" },

  // Forwards
  { id: "p-mbappe", name: "Kylian Mbappé", position: "FWD", pts: 4, nationality: "France" },
  { id: "p-haaland", name: "Erling Haaland", position: "FWD", pts: 4, nationality: "Norway" },
  { id: "p-salah", name: "Mohamed Salah", position: "FWD", pts: 4, nationality: "Egypt" },
  { id: "p-vinicius", name: "Vinícius Júnior", position: "FWD", pts: 4, nationality: "Brazil" },
  { id: "p-kane", name: "Harry Kane", position: "FWD", pts: 4, nationality: "England" },
  { id: "p-lewa", name: "Robert Lewandowski", position: "FWD", pts: 4, nationality: "Poland" },
  { id: "p-yamal", name: "Lamine Yamal", position: "FWD", pts: 4, nationality: "Spain" },
  { id: "p-saka", name: "Bukayo Saka", position: "FWD", pts: 4, nationality: "England" },
  { id: "p-messi", name: "Lionel Messi", position: "FWD", pts: 4, nationality: "Argentina" },
  { id: "p-ronaldo", name: "Cristiano Ronaldo", position: "FWD", pts: 4, nationality: "Portugal" },
  { id: "p-osimhen", name: "Victor Osimhen", position: "FWD", pts: 4, nationality: "Nigeria" },
  { id: "p-son", name: "Son Heung-min", position: "FWD", pts: 4, nationality: "South Korea" },
  { id: "p-dembele", name: "Ousmane Dembélé", position: "FWD", pts: 3, nationality: "France" },
  { id: "p-rashford", name: "Marcus Rashford", position: "FWD", pts: 3, nationality: "England" },
  { id: "p-vlahovic", name: "Dušan Vlahović", position: "FWD", pts: 3, nationality: "Serbia" },
  { id: "p-nkunku", name: "Christopher Nkunku", position: "FWD", pts: 3, nationality: "France" },
  { id: "p-ziyech", name: "Hakim Ziyech", position: "FWD", pts: 3, nationality: "Morocco" },
];

export function playersByPosition(position: Position): PlayerSeed[] {
  return PLAYERS.filter((p) => p.position === position);
}