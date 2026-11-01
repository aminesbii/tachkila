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
  { id: "p-chmakh", name: "Mouhib Chmakh ", position: "GK", pts: 1, nationality: "Tunisia" },
  { id: "p-raya", name: "David Raya", position: "GK", pts: 4, nationality: "Spain" },
  { id: "p-alisson", name: "Alisson Becker", position: "GK", pts: 4, nationality: "Brazil" },
  { id: "p-courtois", name: "Thibaut Courtois", position: "GK", pts: 4, nationality: "Belgium" },
  { id: "p-bounou", name: "Yassine Bounou", position: "GK", pts: 3, nationality: "Morocco" },
  { id: "p-mendy", name: "Édouard Mendy", position: "GK", pts: 2, nationality: "Senegal" },
  { id: "p-navas", name: "Keylor Navas", position: "GK", pts: 3, nationality: "Costa Rica" },
  { id: "p-areola", name: "Alphonse Areola", position: "GK", pts: 2, nationality: "France" },
  { id: "p-atouga" , name: "Sadek Sassi Atouga" , position:"GK" , pts: 3, nationality: "Tunisia"},
  { id: "p-waer" , name: "Chokri Waer" , position:"GK" , pts: 2, nationality: "Tunisia"},
  { id: "p-balbouli" , name: "Aymen Balbouli" , position:"GK" , pts: 1, nationality: "Tunisia"},
  { id: "p-cann" , name: "Oliver can", position:"GK" , pts: 3 , nationality:"German"},
  { id: "p-boumnijel" , name: "Ali bou-mnijel" , position:"GK" , pts: 4, nationality: "Tunisia"},
  { id: "p-hadhari" , name: "Issam Hadhari" , position:"GK" , pts: 3, nationality: "Egyption"},
  { id: "p-donaroma" , name: "galouiji Donnaroma" , position:"GK" , pts: 3, nationality: "Italien"},
  { id: "p-casias" , name: "casias" , position:"GK" , pts: 4, nationality: "Spanish"},
  { id: "p-dida" , name: "Dia" , position:"GK" , pts: 2, nationality: "Brazilian"},
  { id: "p-Higita" , name: "Higita" , position:"GK" , pts: 2, nationality: "Colombia"},
  { id: "p-Otchua" , name: "otchoua" , position:"GK" , pts: 1, nationality: "Mexico"},
  { id: "p-baaboura" , name: "Abdrahmen baboura" , position:"GK" , pts: 1, nationality: "Tunisia"},
  { id: "p-nevzi" , name: "Adel nevzi" , position:"GK" , pts: 1, nationality: "Tunisia"},
  { id: "p-jbal" , name: "Abou jabal" , position:"GK" , pts: 1, nationality: "Egypt"},


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
  { id: "p-maloul", name: "Ali maloul", position: "DEF", pts: 2, nationality: "Tunisia" },
  { id: "p-kimpembe", name: "Presnel Kimpembe", position: "DEF", pts: 2, nationality: "France" },
  { id: "p-umtiti", name: "Samuel Umtiti", position: "DEF", pts: 1, nationality: "France" },
  { id: "p-zalouni" , name: "Ghaith zalouni" , position:"DEF" , pts: 2, nationality: "Tunisia"},
  { id: "p-yousef" , name: "Ali youssef" , position:"DEF" , pts: 2, nationality: "Libya"},
  { id: "p-bouhouch" , name: "Abd slem bouhouch " , position:"DEF" , pts: 1, nationality: "Tunisia"},
  { id: "p-Ghanem" , name: "Soltani Ghanem" , position:"DEF" , pts:1 , nationality: "Soudia"},
  { id: "p-blaihi" , name: "Ali blaihi" , position:"DEF" , pts:1 , nationality: "Soudia"},
  { id: "p-alhamid" , name: "Soud abd alhamid" , position:"DEF" , pts:1 , nationality: "Soudia"},
  { id: "p-fouthil" , name: "Fouthim magharia" , position:"DEF" , pts:2 , nationality: "Algerie"},
  { id: "p-Tugai" , name: "Tugai" , position:"DEF" , pts:1 , nationality: "Algerie"},
  { id: "p-trabelsi" , name: "Hatem Trabelsi" , position:"DEF" , pts:4 , nationality: "Tunisia"},
  { id: "p-badra" , name: "khaled badra" , position:"DEF" , pts:2 , nationality: "Tunisia"},
  { id: "p-jaidi" , name: "Rathi Jaidi" , position:"DEF" , pts:2 , nationality: "Tunisia"},
  { id: "p-kaabi" , name: "Ali kaabi" , position:"DEF" , pts:3 , nationality: "Tunisia"},
  { id: "p-opoco" , name: "nicolas opoco" , position:"DEF" , pts:1 , nationality: "Ghana"},
   { id: "p-waer" , name: "Khlifa baneni" , position:"GK" , pts:1 , nationality: "Tunisia"},

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
  { id: "p-agrebi" , name: "Hamadi Agrebi" , position:"MID" , pts:3 , nationality: "Tunisia"},
  { id: "p-bouziz" , name: "Riadh bou azizi" , position:"MID" , pts:1 , nationality: "Tunisia"},
   { id: "p-sassi" , name: "Ferjeni sassi" , position:"MID" , pts:1 , nationality: "Tunisia"},
    { id: "p-Seliti" , name: "naim Seliti" , position:"MID" , pts:1 , nationality: "Tunisia"},
  { id: "p-khdraoui" , name: "Hamza khdraoui " , position:"MID" , pts:1 , nationality: "Tunisia"},
   { id: "p-Jaziri" , name: "Zied Jaziri" , position:"MID" , pts:2, nationality: "Tunisia"},
    { id: "p-msekni" , name: "Youssef msekni" , position:"MID" , pts:2 , nationality: "Tunisia"},
     { id: "p-baya" , name: "zoubair baya" , position:"MID" , pts:1 , nationality: "Tunisia"},
      { id: "p-dhiab" , name: "tarek dhiab" , position:"MID" , pts:3 , nationality: "Tunisia"},
 { id: "p-Daraji" , name: "Oussema Daraji" , position:"MID" , pts:3 , nationality: "Tunisia"},
  { id: "p-Mondomo" , name: "Alexis Mondomo" , position:"MID" , pts:1 , nationality: "Kameroun"},
   { id: "p-Kaita" , name: "Nabi Kaita" , position:"MID" , pts:1 , nationality: "Guine"},
    { id: "p-Dyouf" , name: "Haj Dyouf" , position:"MID" , pts:1 , nationality: "Tunisia"},
 { id: "p-massoud" , name: "Amir haj massoud" , position:"MID" , pts:1 , nationality: "Tunisia"},
    
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
   { id: "p-Chaouat" , name: "Firas Chaouat" , position:"FWD" , pts:2 , nationality: "Tunisia"},
    { id: "p-Khlifa" , name: "Saber Khlifa" , position:"FWD" , pts:2 , nationality: "Tunisia"},
     { id: "p-khazri" , name: "Whabi khazri" , position:"FWD" , pts:2 , nationality: "Tunisia"},
 { id: "p-bounjeh" , name: "Bagded bounjeh" , position:"FWD" , pts:1 , nationality: "Algerie"},   
  { id: "p-Inremou" , name: "Micheal Inremou" , position:"FWD" , pts:2 , nationality: "Negiria"},
   { id: "p-Traouri" , name: "Draman Traouri" , position:"FWD" , pts:1 , nationality: "Mali"},
    { id: "p-BIson" , name: "Jack BIson" , position:"FWD" , pts:1 , nationality: "Benin"},
     { id: "p-EBDOUASEL" , name: "Ezikeal EBDOUASEL" , position:"FWD" , pts:1 , nationality: "Chad"},
       { id: "p-Danao" , name: "Flurian Danao " , position:"FWD" , pts:1 , nationality: "Cote d'ivoire"},
        { id: "p-Maryami" , name: "Azou Maryami" , position:"FWD" , pts:1 , nationality: "Libya"},
         { id: "p-Karti" , name: "Walid Karti" , position:"FWD" , pts:1 , nationality: "Maroc"}
];

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "player"
  );
}

const SEED_PLAYERS: PlayerSeed[] = (() => {
  const usedIds = new Map<string, number>();
  const usedNames = new Set<string>();
  const out: PlayerSeed[] = [];

  for (const raw of PLAYERS) {
    const name = raw.name.trim().replace(/\s+/g, " ");
    const nameKey = slugify(name);
    if (!name || usedNames.has(nameKey)) continue;
    usedNames.add(nameKey);

    const baseId = slugify(raw.id) || `p-${nameKey}`;
    const seen = usedIds.get(baseId) ?? 0;
    usedIds.set(baseId, seen + 1);

    out.push({
      ...raw,
      id: seen === 0 ? baseId : `${baseId}-${seen + 1}`,
      name,
      nationality: raw.nationality.trim(),
    });
  }

  return out;
})();

export function playersByPosition(position: Position): PlayerSeed[] {
  return SEED_PLAYERS.filter((p) => p.position === position);
}