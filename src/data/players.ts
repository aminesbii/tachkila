import type { Position } from "@/engine/types";

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
  { id: "p-waer" , name: "Chokri El Ouaer" , position:"GK" , pts: 2, nationality: "Tunisia"},
  { id: "p-balbouli" , name: "Aymen Balbouli" , position:"GK" , pts: 1, nationality: "Tunisia"},
  { id: "p-cann" , name: "Oliver Kahn", position:"GK" , pts: 3 , nationality:"Germany"},
  { id: "p-boumnijel" , name: "Ali Boumnijel" , position:"GK" , pts: 4, nationality: "Tunisia"},
  { id: "p-hadhari" , name: "Issam Hadhari" , position:"GK" , pts: 3, nationality: "Egypt"},
  { id: "p-donaroma" , name: "Gianluigi Donnarumma" , position:"GK" , pts: 3, nationality: "Italy"},
  { id: "p-casias" , name: "casias" , position:"GK" , pts: 4, nationality: "Spain"},
  { id: "p-dida" , name: "Dia" , position:"GK" , pts: 2, nationality: "Brazil"},
  { id: "p-Higita" , name: "Higuita" , position:"GK" , pts: 2, nationality: "Colombia"},
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
  { id: "p-Ghanem" , name: "Soltani Ghanem" , position:"DEF" , pts:1 , nationality: "Saudi Arabia"},
  { id: "p-blaihi" , name: "Ali blaihi" , position:"DEF" , pts:1 , nationality: "Saudi Arabia"},
  { id: "p-alhamid" , name: "Soud abd alhamid" , position:"DEF" , pts:1 , nationality: "Saudi Arabia"},
  { id: "p-fouthil" , name: "Fouthim magharia" , position:"DEF" , pts:2 , nationality: "Algeria"},
  { id: "p-Tugai" , name: "Tugai" , position:"DEF" , pts:1 , nationality: "Algeria"},
  { id: "p-trabelsi" , name: "Hatem Trabelsi" , position:"DEF" , pts:4 , nationality: "Tunisia"},
  { id: "p-badra" , name: "Khaled Badra" , position:"DEF" , pts:2 , nationality: "Tunisia"},
  { id: "p-jaidi" , name: "Radhi Jaïdi" , position:"DEF" , pts:2 , nationality: "Tunisia"},
  { id: "p-kaabi" , name: "Ali Kaabi" , position:"DEF" , pts:3 , nationality: "Tunisia"},
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
  { id: "p-bouziz" , name: "Riadh Bouazizi" , position:"MID" , pts:1 , nationality: "Tunisia"},
   { id: "p-sassi" , name: "Ferjani Sassi" , position:"MID" , pts:1 , nationality: "Tunisia"},
    { id: "p-Seliti" , name: "Naim Sliti" , position:"MID" , pts:1 , nationality: "Tunisia"},
  { id: "p-khdraoui" , name: "Hamza khdraoui " , position:"MID" , pts:1 , nationality: "Tunisia"},
   { id: "p-Jaziri" , name: "Zied Jaziri" , position:"MID" , pts:2, nationality: "Tunisia"},
    { id: "p-msekni" , name: "Youssef Msakni" , position:"MID" , pts:2 , nationality: "Tunisia"},
     { id: "p-baya" , name: "Zoubeir Baya" , position:"MID" , pts:1 , nationality: "Tunisia"},
      { id: "p-dhiab" , name: "Tarek Dhiab" , position:"MID" , pts:3 , nationality: "Tunisia"},
 { id: "p-Daraji" , name: "Oussama Darragi" , position:"MID" , pts:3 , nationality: "Tunisia"},
  { id: "p-Mondomo" , name: "Alexis Mondomo" , position:"MID" , pts:1 , nationality: "Cameroon"},
   { id: "p-Kaita" , name: "Naby Keïta" , position:"MID" , pts:1 , nationality: "Guinea"},
    { id: "p-Dyouf" , name: "Haj Dyouf" , position:"MID" , pts:1 , nationality: "Tunisia"},
 { id: "p-massoud" , name: "Amir Hadj Massaoud" , position:"MID" , pts:1 , nationality: "Tunisia"},
    
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
     { id: "p-khazri" , name: "Wahbi Khazri" , position:"FWD" , pts:2 , nationality: "Tunisia"},
 { id: "p-bounjeh" , name: "Baghdad Bounedjah" , position:"FWD" , pts:1 , nationality: "Algeria"},   
  { id: "p-Inremou" , name: "Micheal Inremou" , position:"FWD" , pts:2 , nationality: "Nigeria"},
   { id: "p-Traouri" , name: "Draman Traouri" , position:"FWD" , pts:1 , nationality: "Mali"},
    { id: "p-BIson" , name: "Jack BIson" , position:"FWD" , pts:1 , nationality: "Benin"},
     { id: "p-EBDOUASEL" , name: "Ezikeal EBDOUASEL" , position:"FWD" , pts:1 , nationality: "Chad"},
       { id: "p-Danao" , name: "Flurian Danao " , position:"FWD" , pts:1 , nationality: "Côte d'Ivoire"},
        { id: "p-Maryami" , name: "Azou Maryami" , position:"FWD" , pts:1 , nationality: "Libya"},
         { id: "p-Karti" , name: "Walid Karti" , position:"FWD" , pts:1 , nationality: "Morocco"}
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