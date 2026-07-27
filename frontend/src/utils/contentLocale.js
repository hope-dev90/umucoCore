/**
 * contentLocale.js
 *
 * Provides per-language translations for content cards (heritage items,
 * audio tracks, video titles, collection titles) whose text is stored in
 * the database as a single language string.
 *
 * Usage:
 *   import { localizeItem } from '../utils/contentLocale';
 *   const card = localizeItem(apiItem, language);  // language = 'en' | 'fr' | 'rw'
 *
 * Add new entries by title key (lowercased, trimmed).
 */

// ── Category label translations ───────────────────────────────────────────────
const CATEGORY_LABELS = {
  // architecture
  'architecture':          { en: 'Architecture',          fr: 'Architecture',        rw: 'Ubwubatsi' },
  'ubwami':                { en: 'Royalty',                fr: 'Royauté',             rw: 'Ubwami' },
  // history
  'history':               { en: 'History',               fr: 'Histoire',            rw: 'Amateka' },
  'amateka':               { en: 'History',               fr: 'Histoire',            rw: 'Amateka' },
  // culture
  'culture':               { en: 'Culture',               fr: 'Culture',             rw: 'Umuco' },
  'imigani':               { en: 'Tales & Proverbs',      fr: 'Contes & proverbes',  rw: 'Imigani' },
  // performance
  'performance':           { en: 'Performance',           fr: 'Spectacle',           rw: 'Imikino' },
  'ubutwari':              { en: 'Bravery',               fr: 'Bravoure',            rw: 'Ubutwari' },
  // music
  'music':                 { en: 'Music',                 fr: 'Musique',             rw: 'Umuziki' },
  'umuziki':               { en: 'Music',                 fr: 'Musique',             rw: 'Umuziki' },
  // crafts
  'crafts':                { en: 'Crafts',                fr: 'Artisanat',           rw: 'Ubuhanga' },
  'rusange':               { en: 'Community',             fr: 'Communauté',          rw: 'Rusange' },
  // wildlife / nature
  'wildlife':              { en: 'Nature & Wildlife',     fr: 'Nature & faune',      rw: 'Ibidukikije' },
  'ibyitangira cyumweru':  { en: 'Natural Wonders',       fr: 'Merveilles naturelles', rw: 'Ibyitangira Cyumweru' },
  'lakes':                 { en: 'Lakes',                 fr: 'Lacs',                rw: 'Ibiyaga' },
  // artifacts
  'artifacts':             { en: 'Artefacts',             fr: 'Artefacts',           rw: 'Ibintu bya kera' },
  'ubwenge':               { en: 'Heritage',              fr: 'Patrimoine',          rw: 'Ubwenge' },
  // oral tradition
  'oral tradition':        { en: 'Oral Tradition',        fr: 'Tradition orale',     rw: 'Imigenzo ivugwa' },
  'oral history':          { en: 'Oral History',          fr: 'Histoire orale',      rw: 'Amateka avugwa' },
  // video categories
  'traditional dance':     { en: 'Traditional Dance',    fr: 'Danse traditionnelle', rw: 'Imbyino gakondo' },
  'traditional music':     { en: 'Traditional Music',    fr: 'Musique traditionnelle', rw: 'Umuziki gakondo' },
  'documentary':           { en: 'Documentary',          fr: 'Documentaire',        rw: 'Inyandiko' },
  'ceremony':              { en: 'Ceremony',              fr: 'Cérémonie',           rw: 'Imihango' },
  // collection categories
  'sacred':                { en: 'Sacred',                fr: 'Sacré',               rw: 'Ibyera' },
  'visual art':            { en: 'Visual Art',            fr: 'Art visuel',          rw: 'Ubuhanzi' },
  'art':                   { en: 'Art',                   fr: 'Art',                 rw: 'Ubuhanzi' },
};

// ── Per-item translations keyed by lowercased title ───────────────────────────
const ITEM_TRANSLATIONS = {

  // ── HERITAGE ITEMS (Explore page) ──────────────────────────────────────────

  "ingoro y'ubwami ya nyanza": {
    en: { title: "Nyanza Royal Palace", location: "Nyanza",
          desc: "A reconstructed royal palace showcasing the architecture, ceremonies and daily life of the Rwandan royal court." },
    fr: { title: "Palais royal de Nyanza", location: "Nyanza",
          desc: "Palais royal reconstruit illustrant l'architecture, les cérémonies et la vie quotidienne de la cour royale rwandaise." },
    rw: { title: "Ingoro y'Ubwami ya Nyanza", location: "Nyanza",
          desc: "Ingoro y'Ubwami yubatswe bundi bushya, yerekana ubwubatsi, imihango n'ubuzima bwa buri munsi bw'Urukiko rw'Ubwami." },
  },

  "intore – umubyino w'ubutwari": {
    en: { title: "Intore – The Warrior Dance", location: "Nyanza",
          desc: "The rich Intore tradition, Rwanda's most celebrated warrior dance, born in royal courts and passed down through generations." },
    fr: { title: "Intore – La danse guerrière",
          desc: "La riche tradition Intore, célèbre danse guerrière du Rwanda, née dans les cours royales et transmise de génération en génération." },
    rw: { title: "Intore – Umubyino w'Ubutwari",
          desc: "Umuco ukomeye wa Intore, umubyino w'abasirikare uzwi cyane mu Rwanda." },
  },

  "inanga – umutima w'umuziki nyarwanda": {
    en: { title: "Inanga – Heart of Rwandan Music", location: "Nationwide",
          desc: "Listen to the inanga, ikembe and drums as they resonated for centuries in royal courts and village gatherings across Rwanda." },
    fr: { title: "L'Inanga – Cœur de la musique rwandaise", location: "Tout le pays",
          desc: "Écoutez l'inanga, l'ikembe et les tambours tels qu'ils résonnaient depuis des siècles dans les cours royales et les rassemblements villageois." },
    rw: { title: "Inanga – Umutima w'Umuziki Nyarwanda", location: "Igihugu hose",
          desc: "Umva inanga, ikembe n'ingoma nk'uko byacurangwaga mu binyejana byinshi." },
  },

  "imigani – inkuru zivugwa ku muriro": {
    en: { title: "Imigani – Fireside Tales", location: "Nationwide",
          desc: "Dive into Rwanda's oral tradition: myths, proverbs and moral teachings passed down around the fire from generation to generation." },
    fr: { title: "Imigani – Contes du foyer", location: "Tout le pays",
          desc: "Plongez dans la tradition orale rwandaise : mythes, proverbes et enseignements transmis autour du feu de génération en génération." },
    rw: { title: "Imigani – Inkuru zivugwa ku Muriro", location: "Igihugu hose",
          desc: "Injira mu muco nyarwanda w'imvugo dukesha abakurambere." },
  },

  "kigeli iv rwabugiri – umwami w'intwari": {
    en: { title: "Kigeli IV Rwabugiri – The Warrior King", location: "Kigali",
          desc: "One of Rwanda's most powerful kings, who expanded the kingdom's territory through warfare and administrative reform." },
    fr: { title: "Kigeli IV Rwabugiri – Le roi guerrier", location: "Kigali",
          desc: "L'un des rois les plus puissants du Rwanda, qui étendit le territoire par la guerre et réforma l'administration." },
    rw: { title: "Kigeli IV Rwabugiri – Umwami w'Intwari", location: "Kigali",
          desc: "Umwe mu bami b'u Rwanda bakomeye cyane, wagushije ubutaka bw'igihugu." },
  },

  "ubwiru – imihango y'urukiko rw'ubwami": {
    en: { title: "Ubwiru – Royal Court Rituals", location: "Nyanza",
          desc: "Sacred rites and esoteric knowledge that governed the life of the royal court, transmitted only to those permitted to know." },
    fr: { title: "Ubwiru – Rituels de la cour royale", location: "Nyanza",
          desc: "Rites sacrés et savoirs ésotériques qui gouvernaient la vie de la cour royale, transmis uniquement aux initiés." },
    rw: { title: "Ubwiru – Imihango y'Urukiko rw'Ubwami", location: "Nyanza",
          desc: "Imihango yera n'ubumenyi bwihishe byayoboraga ubuzima bw'urukiko rw'ubwami." },
  },

  "imigani – inkuru zo ku muriro": {
    en: { title: "Imigani – Stories by the Fire", location: "Nationwide",
          desc: "Rwandan oral tradition where elders gathered children around the fire to share folktales and moral lessons." },
    fr: { title: "Imigani – Récits du foyer", location: "Tout le pays",
          desc: "Tradition orale rwandaise où les anciens rassemblaient les enfants autour du feu pour partager contes et leçons morales." },
    rw: { title: "Imigani – Inkuru zo ku Muriro", location: "Igihugu hose",
          desc: "Umuco nyarwanda w'imvugo, aho abakuru bateranyaga abana ku muriro." },
  },

  "ibyivugo – ibisigo by'ubutwari": {
    en: { title: "Ibyivugo – Warrior Self-Praise Poetry", location: "Nationwide",
          desc: "Self-composed poems recited by warriors and hunters celebrating their own acts of bravery and personal achievements." },
    fr: { title: "Ibyivugo – Poésie guerrière", location: "Tout le pays",
          desc: "Poèmes d'auto-éloge récités par des guerriers et des chasseurs célébrant leurs propres actes de bravoure." },
    rw: { title: "Ibyivugo – Ibisigo by'Ubutwari", location: "Igihugu hose",
          desc: "Ibisigo byanditswe n'ababivuga ubwabo, bikavugwa n'abasirikare n'abahigi." },
  },

  "inzira z'ubwenge – ibisakuzo n'ubuhanga": {
    en: { title: "Paths of Wisdom – Riddles & Knowledge", location: "Nationwide",
          desc: "Traditional riddles and proverbs used to teach wisdom and critical thinking across generations." },
    fr: { title: "Sagesse en énigmes – Devinettes et savoir", location: "Tout le pays",
          desc: "Devinettes et proverbes traditionnels utilisés pour enseigner la sagesse et la pensée critique à travers les générations." },
    rw: { title: "Inzira z'Ubwenge – Ibisakuzo n'Ubuhanga", location: "Igihugu hose",
          desc: "Ibisakuzo n'imigani gakondo byakoreshwaga mu kwigisha ubuhanga." },
  },

  "ingoma – ingoma zera z'ubwami": {
    en: { title: "Ingoma – The Sacred Royal Drums", location: "Nyanza",
          desc: "The drums were the beating heart of the royal court, used in ceremonies, proclamations and celebrations." },
    fr: { title: "Les Tambours sacrés de la royauté", location: "Nyanza",
          desc: "Les tambours étaient le cœur battant de la cour royale, utilisés dans les cérémonies, les annonces et les célébrations." },
    rw: { title: "Ingoma – Ingoma Zera z'Ubwami", location: "Nyanza",
          desc: "Ingoma zari umutima w'urukiko rw'ubwami, zikoreshwa mu mihango." },
  },

  "umuvugo – indirimbo z'ishimwe": {
    en: { title: "Umuvugo – Songs of Praise", location: "Nationwide",
          desc: "Traditional songs honouring kings, heroes and important events, performed during ceremonies across Rwanda." },
    fr: { title: "Umuvugo – Chants de louange", location: "Tout le pays",
          desc: "Chants traditionnels en l'honneur des rois, des héros et des événements importants, joués lors des cérémonies." },
    rw: { title: "Umuvugo – Indirimbo z'Ishimwe", location: "Igihugu hose",
          desc: "Indirimbo gakondo zasingizaga abami, intwari n'ibintu bikomeye." },
  },

  "ubudehe – ubufatanye bw'abaturage": {
    en: { title: "Ubudehe – Community Self-Help", location: "Nationwide",
          desc: "An ancient tradition of collective work and mutual aid, a defining symbol of Rwandan community life across the centuries." },
    fr: { title: "Ubudehe – Entraide communautaire", location: "Tout le pays",
          desc: "Tradition ancienne de travail collectif et d'entraide, symbole de la vie communautaire rwandaise à travers les siècles." },
    rw: { title: "Ubudehe – Ubufatanye bw'Abaturage", location: "Igihugu hose",
          desc: "Umuco wa kera w'akazi gakorwa hamwe no gufashanya." },
  },

  "agaseke – ibiseke by'amahoro": {
    en: { title: "Agaseke – Baskets of Peace", location: "Nationwide",
          desc: "Artfully woven baskets carrying rich cultural symbolism, used in ceremonies, exchanged as gifts, and kept as everyday objects." },
    fr: { title: "Agaseke – Paniers de paix", location: "Tout le pays",
          desc: "Paniers tressés avec art, chargés d'une riche symbolique culturelle, utilisés lors des cérémonies, comme cadeaux et objets du quotidien." },
    rw: { title: "Agaseke – Ibiseke by'Amahoro", location: "Igihugu hose",
          desc: "Ibiseke bidukanywe mu buryo bw'ubuhanga, bifite icyerekezo cy'umuco." },
  },

  "inanga – ikinanga cy'u rwanda": {
    en: { title: "Inanga – Rwanda's Iconic Instrument", location: "Nationwide",
          desc: "The iconic instrument of Rwanda's traditional music, played in royal courts and village ceremonies for centuries." },
    fr: { title: "L'Inanga – Instrument emblématique du Rwanda", location: "Tout le pays",
          desc: "Instrument emblématique de la musique traditionnelle rwandaise, joué dans les cours royales et les cérémonies villageoises." },
    rw: { title: "Inanga – Ikinanga cy'u Rwanda", location: "Igihugu hose",
          desc: "Ikirangantego mu bikoresho by'umuziki gakondo by'u Rwanda." },
  },

  "ingabo – abarinzi b'ubwami": {
    en: { title: "Ingabo – The Royal Guard", location: "Kigali",
          desc: "The brave royal guards who protected the king and ensured the safety and security of the kingdom." },
    fr: { title: "Les Ingabo – Garde royale", location: "Kigali",
          desc: "Les courageux gardes royaux qui protégeaient le roi et veillaient à la sécurité du royaume." },
    rw: { title: "Ingabo – Abarinzi b'Ubwami", location: "Kigali",
          desc: "Abarinzi b'intwari b'ubwami barinzaga Umwami kandi bagacunga umutekano." },
  },

  "nyungwe forest national park": {
    en: { title: "Nyungwe Forest National Park", location: "Rusizi",
          desc: "An ancient rainforest harbouring thousands of animal and plant species, including primates, rare birds and reptiles." },
    fr: { title: "Parc national de la forêt de Nyungwe", location: "Rusizi",
          desc: "Forêt ancienne abritant des milliers d'espèces animales et végétales, dont des primates, des oiseaux rares et des reptiles." },
    rw: { title: "Nyungwe Forest National Park", location: "Rusizi",
          desc: "Ishyamba ritandukanye mu Rwanda, harimo inyamaswa n'inyamaswa z'ibihumbi byinshi." },
  },

  "akagera national park": {
    en: { title: "Akagera National Park", location: "Kayonza",
          desc: "Central Africa's largest wetland park, home to the Big Five and a wide variety of savanna wildlife." },
    fr: { title: "Parc national de l'Akagera", location: "Kayonza",
          desc: "Le plus grand parc humide d'Afrique centrale, abritant les Big Five et de nombreuses espèces sauvages." },
    rw: { title: "Akagera National Park", location: "Kayonza",
          desc: "Pariki y'ibisura yabera mu bwongereza bw'u Rwanda." },
  },

  "lake kivu": {
    en: { title: "Lake Kivu", location: "Rubavu",
          desc: "A vast lake on Rwanda's western border, rich in history and biodiversity, shared with the Democratic Republic of Congo." },
    fr: { title: "Lac Kivu", location: "Rubavu",
          desc: "Grand lac à l'ouest du Rwanda, riche en histoire et en biodiversité, bordant la République Démocratique du Congo." },
    rw: { title: "Lake Kivu", location: "Rubavu",
          desc: "Ikiyaga kigari cyo mu ruhande rwa burenga bw'u Rwanda." },
  },

  "kigali genocide memorial centre": {
    en: { title: "Kigali Genocide Memorial Centre", location: "Kigali",
          desc: "A memorial to the 1994 Genocide against the Tutsi, calling people to understanding, remembrance and reconciliation." },
    fr: { title: "Mémorial du Génocide de Kigali", location: "Kigali",
          desc: "Site de mémoire du Génocide de 1994 contre les Tutsi, appelant à la réconciliation et à la compréhension mutuelle." },
    rw: { title: "Kigali Genocide Memorial Centre", location: "Kigali",
          desc: "Ihaha rya jenoside rya 1994 mu Rwanda, rihamagara abantu ku bikoreshwa by'ubwenge." },
  },

  "butare national museum of rwanda": {
    en: { title: "Butare National Museum of Rwanda", location: "Huye",
          desc: "Rwanda's principal museum tracing the nation's cultural history, with a rich collection of artefacts and archives." },
    fr: { title: "Musée national du Rwanda – Butare", location: "Huye",
          desc: "Principal musée du Rwanda retraçant l'histoire culturelle nationale, avec une riche collection d'objets et d'archives." },
    rw: { title: "Butare National Museum of Rwanda", location: "Huye",
          desc: "Ihaha ry'ibitekerezo ry'amateka y'u Rwanda." },
  },

  "murambi genocide memorial": {
    en: { title: "Murambi Genocide Memorial", location: "Nyamagabe",
          desc: "A memorial to the 1994 Genocide at Murambi, preserving the memory of victims so that history is never forgotten." },
    fr: { title: "Mémorial du Génocide de Murambi", location: "Nyamagabe",
          desc: "Site de mémoire du Génocide de 1994 à Murambi, rappelant les événements pour que l'histoire ne se répète pas." },
    rw: { title: "Murambi Genocide Memorial", location: "Nyamagabe",
          desc: "Ihaha rya jenoside rya 1994 mu Murambi." },
  },

  "king's palace museum (rukari)": {
    en: { title: "King's Palace Museum (Rukari)", location: "Nyanza",
          desc: "A museum set in the former royal palace of Rukari, preserving the traditions and artefacts of Rwandan royalty." },
    fr: { title: "Musée du Palais royal (Rukari)", location: "Nyanza",
          desc: "Musée aménagé dans l'ancien palais royal de Rukari, conservant les traditions et objets de la royauté rwandaise." },
    rw: { title: "King's Palace Museum (Rukari)", location: "Nyanza",
          desc: "Ingoro y'Ubwami ya Rukari, rikubiyemo ibintu by'Umwami." },
  },

  "mount karisimbi": {
    en: { title: "Mount Karisimbi", location: "Musanze",
          desc: "The highest peak in the Virunga range, home to mountain gorillas and offering spectacular panoramic views." },
    fr: { title: "Mont Karisimbi", location: "Musanze",
          desc: "Plus haut sommet des Virunga, abritant des gorilles de montagne et offrant des panoramas spectaculaires." },
    rw: { title: "Mount Karisimbi", location: "Musanze",
          desc: "Umusozi mukuru mu Virunga, harimo ibisura n'inyamaswa." },
  },

  "gishwati forest": {
    en: { title: "Gishwati Forest", location: "Ngororero",
          desc: "A remarkable forest home to chimpanzees and rich biodiversity, currently undergoing ecological restoration." },
    fr: { title: "Forêt de Gishwati", location: "Ngororero",
          desc: "Forêt remarquable abritant des chimpanzés et une grande biodiversité, en cours de restauration écologique." },
    rw: { title: "Gishwati Forest", location: "Ngororero",
          desc: "Ishyamba rikubiyemo ibintu bikomeye cyane." },
  },

  "lake muhazi": {
    en: { title: "Lake Muhazi", location: "Rwamagana",
          desc: "A tranquil lake in eastern Rwanda, a natural setting rich in history and landscapes." },
    fr: { title: "Lac Muhazi", location: "Rwamagana",
          desc: "Lac paisible de l'est du Rwanda, cadre naturel riche en histoire et en paysages." },
    rw: { title: "Lake Muhazi", location: "Rwamagana",
          desc: "Ikiyaga kigari cyo mu Rwanda." },
  },

  "bisesero genocide memorial": {
    en: { title: "Bisesero Genocide Memorial", location: "Karongi",
          desc: "A memorial honouring those who resisted the 1994 Genocide on the hills of Bisesero." },
    fr: { title: "Mémorial du Génocide de Bisesero", location: "Karongi",
          desc: "Mémorial honorant ceux qui résistèrent au Génocide de 1994 sur les collines de Bisesero." },
    rw: { title: "Bisesero Genocide Memorial", location: "Karongi",
          desc: "Ihaha rya jenoside rya 1994 mu Bisesero." },
  },

  "gatagara crafts village": {
    en: { title: "Gatagara Crafts Village", location: "Huye",
          desc: "A village renowned for traditional Rwandan craftsmanship, including imigongo paintings and woven baskets." },
    fr: { title: "Village artisanal de Gatagara", location: "Huye",
          desc: "Village réputé pour l'artisanat rwandais traditionnel, notamment les peintures imigongo et les paniers tressés." },
    rw: { title: "Gatagara Crafts Village", location: "Huye",
          desc: "Umujyi w'ibintu byahindutse, harimo imigongo n'ibindi." },
  },

  "rwanda art museum": {
    en: { title: "Rwanda Art Museum", location: "Kigali",
          desc: "A space dedicated to contemporary and traditional Rwandan art, showcasing the celebrated geometric imigongo paintings." },
    fr: { title: "Musée d'art du Rwanda", location: "Kigali",
          desc: "Espace dédié à l'art rwandais contemporain et traditionnel, notamment les célèbres peintures géométriques imigongo." },
    rw: { title: "Rwanda Art Museum", location: "Kigali",
          desc: "Ihaha ry'imigongo n'ibindi by'ubwenge." },
  },

  "amahoro national stadium": {
    en: { title: "Amahoro National Stadium", location: "Kigali",
          desc: "Rwanda's iconic national stadium, witness to important historic moments and a symbol of peace (amahoro)." },
    fr: { title: "Stade national Amahoro", location: "Kigali",
          desc: "Stade emblématique du Rwanda, témoin de moments historiques importants et symbole de paix (amahoro)." },
    rw: { title: "Amahoro National Stadium", location: "Kigali",
          desc: "Ikibuga kizwi cyane mu Rwanda, cyuzuye amateka n'ibintu bikomeye." },
  },

  "kibeho shrine": {
    en: { title: "Kibeho Shrine", location: "Nyaruguru",
          desc: "A world-renowned Catholic pilgrimage site where apparitions of the Virgin Mary are said to have occurred." },
    fr: { title: "Sanctuaire de Kibeho", location: "Nyaruguru",
          desc: "Lieu de pèlerinage catholique renommé mondialement, où des apparitions mariales auraient eu lieu." },
    rw: { title: "Kibeho Shrine", location: "Nyaruguru",
          desc: "Aho Maria yaboneje mu Rwanda." },
  },

  "rugezi marsh": {
    en: { title: "Rugezi Marsh", location: "Burera",
          desc: "An internationally recognised protected wetland renowned for its rich biodiversity of bird species." },
    fr: { title: "Marais de Rugezi", location: "Burera",
          desc: "Zone humide protégée et reconnue internationalement pour sa riche biodiversité en espèces d'oiseaux." },
    rw: { title: "Rugezi Marsh", location: "Burera",
          desc: "Akabiriziro kizwi cyane mu Rwanda." },
  },

  "rusumo falls": {
    en: { title: "Rusumo Falls", location: "Rusumo",
          desc: "Impressive waterfalls marking the border between Rwanda and Tanzania, steeped in history." },
    fr: { title: "Chutes de Rusumo", location: "Rusumo",
          desc: "Impressionnantes chutes d'eau marquant la frontière entre le Rwanda et la Tanzanie, chargées d'histoire." },
    rw: { title: "Rusumo Falls", location: "Rusumo",
          desc: "Imirima y'ibisura, yabera mu Rusumo." },
  },

  "rwankeri hill": {
    en: { title: "Rwankeri Hill", location: "Rwamagana",
          desc: "A striking hill in Rwanda offering beautiful terraced farmland and sweeping panoramic views." },
    fr: { title: "Colline de Rwankeri", location: "Rwamagana",
          desc: "Colline remarquable du Rwanda offrant des paysages de terrasses agricoles et de panoramas." },
    rw: { title: "Rwankeri Hill", location: "Rwamagana",
          desc: "Umusozi ukomeye mu Rwanda." },
  },

  "huye mountain": {
    en: { title: "Huye Mountain", location: "Huye",
          desc: "A forested mountain in southern Rwanda sheltering a rich forest ecosystem." },
    fr: { title: "Mont Huye", location: "Huye",
          desc: "Montagne boisée du sud du Rwanda, abritant un riche écosystème forestier." },
    rw: { title: "Huye Mountain", location: "Huye",
          desc: "Umusozi ukomeye mu Rwanda." },
  },

  "nyarugenge church": {
    en: { title: "Nyarugenge Church", location: "Kigali",
          desc: "One of Kigali's oldest churches, a witness to the city's colonial-era architectural history." },
    fr: { title: "Église de Nyarugenge", location: "Kigali",
          desc: "Ancienne église de Nyarugenge, témoin de l'architecture et de l'histoire coloniale de Kigali." },
    rw: { title: "Nyarugenge Church", location: "Kigali",
          desc: "Itorero rya kera rya Nyarugenge." },
  },

  // ── AUDIO (Listen page) ────────────────────────────────────────────────────

  "the song of ruganzu ii: the king's return": {
    en: { title: "The Song of Ruganzu II: The King's Return",
          desc: "A legendary oral recitation by Mzee Silas, describing the mythical return of the great king Ruganzu Ndoli." },
    fr: { title: "Le chant de Ruganzu II : le retour du roi",
          desc: "Récitation orale légendaire par Mzee Silas, décrivant le retour mythique du grand roi Ruganzu Ndoli." },
    rw: { title: "Indirimbo ya Ruganzu II: Kugaruka k'Umwami",
          desc: "Inkuru ivugwa n'umugani ya Mzee Silas." },
  },

  "why the crane has a crown": {
    en: { title: "Why the Crane Has a Crown",
          desc: "A traditional animal fable explaining the natural crown of the grey crowned crane, Rwanda's national bird." },
    fr: { title: "Pourquoi la grue a une couronne",
          desc: "Fable animale traditionnelle expliquant la couronne naturelle de la grue couronnée, oiseau emblématique du Rwanda." },
    rw: { title: "Impamvu Umusave Afite Ingoma",
          desc: "Inkuru y'inyamaswa yerekana impamvu umusave afite ingoma." },
  },

  "the man on the moon": {
    en: { title: "The Man on the Moon",
          desc: "A traditional Rwandan tale explaining the shadows visible on the moon through a moral story." },
    fr: { title: "L'homme sur la lune",
          desc: "Conte traditionnel rwandais expliquant les ombres visibles sur la lune à travers un récit moral." },
    rw: { title: "Umugabo uri ku Kwezi",
          desc: "Inkuru gakondo y'u Rwanda isobanura ibigaragara ku kwezi." },
  },

  "ibyivugo by intore": {
    en: { title: "Ibyivugo by Intore",
          desc: "Self-praise poems recited by Intore dancers during royal ceremonies and warrior performances." },
    fr: { title: "Ibyivugo des Intore",
          desc: "Poèmes d'auto-éloge récités par les danseurs Intore lors des cérémonies royales et des performances guerrières." },
    rw: { title: "Ibyivugo by'Intore",
          desc: "Ibisigo by'Intore bivugwa mu mihango y'ubwami." },
  },

  "oral history – nyamasheke": {
    en: { title: "Oral History – Nyamasheke",
          desc: "Preserved oral testimonies from the Nyamasheke region, recounting local history and community traditions." },
    fr: { title: "Histoire orale – Nyamasheke",
          desc: "Témoignages oraux préservés de la région de Nyamasheke, racontant l'histoire locale et les traditions communautaires." },
    rw: { title: "Amateka avugwa – Nyamasheke",
          desc: "Ubuhamya bwabitswe buturuka mu karere ka Nyamasheke." },
  },

  // ── VIDEOS ────────────────────────────────────────────────────────────────

  "intore dance performance": {
    en: { title: "Intore Dance Performance",
          desc: "A traditional Rwandan Intore dance performance illustrating warrior and artistic traditions." },
    fr: { title: "Spectacle de danse Intore",
          desc: "Spectacle de danse Intore traditionnelle rwandaise illustrant les traditions guerrières et artistiques." },
    rw: { title: "Kwerekana Intore",
          desc: "Kwerekana Intore, umucyo gakondo w'u Rwanda." },
  },

  "traditional dance – intore": {
    en: { title: "Traditional Dance – Intore",
          desc: "The Intore dance, an intangible Rwandan heritage passed down since pre-colonial royal courts." },
    fr: { title: "Danse traditionnelle – Intore",
          desc: "La danse Intore, patrimoine immatériel rwandais transmis depuis les cours royales précoloniales." },
    rw: { title: "Imbyino gakondo – Intore",
          desc: "Imbyino y'Intore yagezwe ku bindi bisekuru." },
  },

  // ── COLLECTIONS ───────────────────────────────────────────────────────────

  "the inanga tradition": {
    en: { title: "The Inanga Tradition",
          desc: "An in-depth exploration of the evolution of Rwanda's primary string instrument, featuring recordings from the 1920s to contemporary masters." },
    fr: { title: "La tradition de l'Inanga",
          desc: "Une plongée approfondie dans l'évolution du principal instrument à cordes du Rwanda, avec des enregistrements des années 1920 aux maîtres contemporains." },
    rw: { title: "Imigenzo y'Inanga",
          desc: "Isesengura ryimbitse ry'ihindagurika ry'igikinisho cy'imigozi gikomeye cy'u Rwanda." },
  },

  "royal court rituals": {
    en: { title: "Royal Court Rituals",
          desc: "Preserving the rhythmic essence of the Umuganura festival and its sacred ceremonial protocols." },
    fr: { title: "Rituels de la cour royale",
          desc: "Préserver l'essence rythmique du festival Umuganura et ses protocoles cérémoniels sacrés." },
    rw: { title: "Imihango y'Ingoro y'Umwami",
          desc: "Kubika umwuka w'umuziki w'umunsi mukuru wa Umuganura." },
  },
};

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Translate a single content item's display fields based on the active language.
 * Falls back to the original value if no translation is found.
 *
 * @param {object} item  - The raw item from the API or fallback list.
 * @param {string} lang  - 'en' | 'fr' | 'rw'
 * @returns {object}     - A new object with localized title, desc/description, location, category
 */
export function localizeItem(item, lang) {
  if (!item) return item;

  const key = (item.title || '').toLowerCase().trim();
  const overrides = ITEM_TRANSLATIONS[key]?.[lang] || {};

  // Translate category label
  const rawCat = (item.category || item.catKey || '').toLowerCase().trim();
  const catOverride = CATEGORY_LABELS[rawCat]?.[lang];

  return {
    ...item,
    title:       overrides.title       || item.title,
    desc:        overrides.desc        || item.desc,
    description: overrides.desc        || item.description,
    location:    overrides.location    || item.location,
    category:    catOverride           || item.category,
  };
}

/**
 * Translate an array of items at once.
 */
export function localizeItems(items, lang) {
  if (!items) return items;
  return items.map(item => localizeItem(item, lang));
}

/**
 * Translate just a category label string.
 */
export function localizeCategory(category, lang) {
  if (!category) return category;
  const key = category.toLowerCase().trim();
  return CATEGORY_LABELS[key]?.[lang] || category;
}
