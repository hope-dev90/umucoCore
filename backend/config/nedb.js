import Datastore from 'nedb-promises';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../data');
if (!fs.existsSync(dbPath)) fs.mkdirSync(dbPath, { recursive: true });

const db = {
  users:         Datastore.create({ filename: path.join(dbPath, 'users.db'),         autoload: true }),
  sessions:      Datastore.create({ filename: path.join(dbPath, 'sessions.db'),      autoload: true }),
  heritage:      Datastore.create({ filename: path.join(dbPath, 'heritage.db'),      autoload: true }),
  collections:   Datastore.create({ filename: path.join(dbPath, 'collections.db'),  autoload: true }),
  saved:         Datastore.create({ filename: path.join(dbPath, 'saved.db'),         autoload: true }),
  contributions: Datastore.create({ filename: path.join(dbPath, 'contributions.db'), autoload: true }),
  history:       Datastore.create({ filename: path.join(dbPath, 'history.db'),       autoload: true }),
  calendar:      Datastore.create({ filename: path.join(dbPath, 'calendar.db'),      autoload: true }),
  notifications: Datastore.create({ filename: path.join(dbPath, 'notifications.db'), autoload: true }),
  resets:        Datastore.create({ filename: path.join(dbPath, 'resets.db'),        autoload: true }),
};

// Indexes
db.users.ensureIndex({ fieldName: 'email', unique: true });
db.sessions.ensureIndex({ fieldName: 'token' });
db.saved.ensureIndex({ fieldName: 'userId' });
db.history.ensureIndex({ fieldName: 'userId' });
db.contributions.ensureIndex({ fieldName: 'userId' });

// Seed default heritage data
async function seedHeritage() {
  const count = await db.heritage.count({});
  if (count > 0) return;

  const items = [
    {
      id: 'heritage-001',
      category: 'Architecture', catKey: 'architecture',
      title: "The King's Palace",
      title_rw: "Inzu y'Umwami",
      title_fr: "Le Palais Royal",
      location: 'Nyanza',
      era: 'Pre-colonial',
      region: 'South',
      desc: "Discover the majestic dome-shaped structures that served as the heart of pre-colonial Rwanda.",
      desc_rw: "Menya ibikorwa by'ingenzi by'ingoro y'umwami mu Rwanda rya kera.",
      desc_fr: "Découvrez les majestueuses structures en dôme qui formaient le cœur du Rwanda précolonial.",
      image: '/assets/explore/nyanza.jpg',
      tags: ['architecture', 'royalty', 'pre-colonial'],
      featured: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'heritage-002',
      category: 'History', catKey: 'history',
      title: 'Buhanga Eco-Park',
      title_rw: 'Ishyamba rya Buhanga',
      title_fr: "Éco-Parc de Buhanga",
      location: 'Musanze',
      era: 'Pre-colonial',
      region: 'North',
      desc: "An ancient forest where kings were consecrated, preserving both ecological and spiritual heritage.",
      desc_rw: "Ishyamba rya kera aho abami bategurwaga, ribika amateka y'imico n'imitima.",
      desc_fr: "Une forêt ancienne où les rois étaient consacrés, préservant le patrimoine écologique et spirituel.",
      image: '/assets/explore/buhanga.jpg',
      tags: ['nature', 'royalty', 'spiritual'],
      featured: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'heritage-003',
      category: 'Performance', catKey: 'performance',
      title: 'Intore Rituals',
      title_rw: 'Imyigire y\'Intore',
      title_fr: 'Rituels Intore',
      location: 'National',
      era: 'Pre-colonial',
      region: 'Kigali',
      desc: "The dance of heroes, characterized by rhythmic movements, traditional drums, and warrior symbolism.",
      desc_rw: "Indirimbo y'intwari, ifite indangagaciro z'imitari, ingoma, n'ibimenyetso by'intwari.",
      desc_fr: "La danse des héros, caractérisée par des mouvements rythmiques, des tambours traditionnels et le symbolisme guerrier.",
      image: '/assets/explore/intore2.jpg',
      tags: ['dance', 'performance', 'warriors'],
      featured: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'heritage-004',
      category: 'Crafts', catKey: 'crafts',
      title: 'Agaseke Weaving',
      title_rw: 'Ubukorikori bw\'Agaseke',
      title_fr: "Tissage de l'Agaseke",
      location: 'Gitarama',
      era: 'Pre-colonial',
      region: 'South',
      desc: "The iconic peace basket, a symbol of reconciliation and intricate craftsmanship passed through generations.",
      desc_rw: "Agaseke k'amahoro, ikimenyetso cy'ubwiyunge n'ubukorikori bwangiwe mu bihe byinshi.",
      desc_fr: "Le panier de la paix iconique, symbole de réconciliation et d'artisanat transmis de génération en génération.",
      image: '/assets/explore/weaving_agaseke.jpg',
      tags: ['crafts', 'peace', 'weaving'],
      featured: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'heritage-005',
      category: 'Art', catKey: 'art',
      title: 'Imigongo Geometry',
      title_rw: 'Imyerekezo y\'Imigongo',
      title_fr: 'Géométrie Imigongo',
      location: 'Kibungo',
      era: 'Pre-colonial',
      region: 'East',
      desc: "Explore the rhythmic patterns of imigongo, a unique art form using natural pigments and relief structures.",
      desc_rw: "Menya imigongo, ubuhanzi bwihariye bwifashisha ibara kamere n'intera z'imyerekezo.",
      desc_fr: "Explorez les motifs rythmiques de l'imigongo, une forme d'art unique utilisant des pigments naturels.",
      image: '/assets/explore/imigongo.jpg',
      tags: ['art', 'geometry', 'painting'],
      featured: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'heritage-006',
      category: 'Artifacts', catKey: 'artifacts',
      title: 'Earthenware Legacy',
      title_rw: 'Inzobe z\'Amateka',
      title_fr: "Héritage en Terre Cuite",
      location: 'Rubavu',
      era: 'Pre-colonial',
      region: 'West',
      desc: "Centuries of functional art, from milk jars to communal cooking vessels, reflecting the daily lives of ancestors.",
      desc_rw: "Ibihe byinshi by'ubuhanzi bwifashishwa, kuva imikono y'amata kugeza ibikoresho by'amazu.",
      desc_fr: "Des siècles d'art fonctionnel, des pots à lait aux ustensiles de cuisine communautaires.",
      image: '/assets/explore/artifact.jpg',
      tags: ['pottery', 'artifacts', 'daily-life'],
      featured: false,
      createdAt: new Date().toISOString()
    }
  ];

  await Promise.all(items.map(item => db.heritage.insert(item)));
  console.log('✓ Heritage data seeded');
}

// Seed calendar events
async function seedCalendar() {
  const count = await db.calendar.count({});
  if (count > 0) return;

  const events = [
    {
      day: '07', month: 'APR', monthNum: 4,
      title: 'Kwibuka – Genocide Commemoration',
      title_rw: 'Kwibuka – Gutuza Jenoside',
      title_fr: 'Kwibuka – Commémoration du Génocide',
      sub: 'National Remembrance • April 7, 2025',
      type: 'national', important: true
    },
    {
      day: '21', month: 'MAY', monthNum: 5,
      title: 'Cultural Diversity Day',
      title_rw: 'Umunsi w\'Imico itandukanye',
      title_fr: 'Journée de la Diversité Culturelle',
      sub: 'Dialogue and Development • 21 May 2025',
      type: 'international', important: false
    },
    {
      day: '23', month: 'JUN', monthNum: 6,
      title: "International Widows' Day",
      title_rw: "Umunsi w'Abapfakazi",
      title_fr: "Journée Internationale des Veuves",
      sub: 'Community Support & History • 23 June 2025',
      type: 'international', important: false
    },
    {
      day: '04', month: 'JUL', monthNum: 7,
      title: 'Liberation Day',
      title_rw: 'Umunsi w\'Ubwigenge',
      title_fr: "Jour de la Libération",
      sub: 'National Celebration • 4 July 2025',
      type: 'national', important: true
    },
    {
      day: '09', month: 'AUG', monthNum: 8,
      title: 'Day of Indigenous Peoples',
      title_rw: "Umunsi w'Abaturage b'Imvano",
      title_fr: "Journée des Peuples Autochtones",
      sub: 'Global Heritage Preservation • 9 August 2025',
      type: 'international', important: false
    },
    {
      day: '15', month: 'AUG', monthNum: 8,
      title: 'Assumption Day',
      title_rw: "Umunsi w'Amajana",
      title_fr: "Fête de l'Assomption",
      sub: 'National Holiday • 15 August 2025',
      type: 'national', important: false
    },
    {
      day: '17', month: 'OCT', monthNum: 10,
      title: 'Umuganura – Harvest Festival',
      title_rw: 'Umuganura – Umunsi w\'Imyaka',
      title_fr: 'Umuganura – Fête des Récoltes',
      sub: 'Traditional Celebration • August 2025',
      type: 'cultural', important: true
    }
  ];

  await Promise.all(events.map(e => db.calendar.insert(e)));
  console.log('✓ Calendar data seeded');
}

// Seed audio/listen content
async function seedListenContent() {
  const count = await db.collections.count({ type: 'audio' });
  if (count > 0) return;

  const items = [
    {
      type: 'audio',
      genre: 'Epic',
      title: 'The Song of Ruganzu II: The King\'s Return',
      title_rw: 'Indirimbo ya Ruganzu II: Kugaruka kw\'Umwami',
      title_fr: 'La Chanson de Ruganzu II: Le Retour du Roi',
      narrator: 'Mzee Silas',
      duration: '45:00',
      durationSec: 2700,
      image: '/assets/listen/ruganzu.png',
      featured: true,
      desc: 'A legendary oral recitation depicting the mythical homecoming of the great King Ruganzu Ndoli.',
      tags: ['epic', 'royalty', 'oral-tradition'],
      createdAt: new Date().toISOString()
    },
    {
      type: 'audio',
      genre: 'Migani',
      title: 'Why the Crane has a Crown',
      title_rw: 'Ubutumwa bw\'Inzobe',
      title_fr: 'Pourquoi la Grue a une Couronne',
      narrator: "Jean d'Amour",
      duration: '12:40',
      durationSec: 760,
      image: '/assets/listen/crane-story.jpg',
      featured: false,
      desc: 'A beloved Rwandan fable about the crane\'s crown and the wisdom hidden in nature.',
      tags: ['fable', 'nature', 'wisdom'],
      createdAt: new Date().toISOString()
    },
    {
      type: 'audio',
      genre: 'Migani',
      title: 'The Man on the Moon',
      title_rw: 'Umugabo wo ku Kwezi',
      title_fr: "L'Homme sur la Lune",
      narrator: 'Beatrice U.',
      duration: '15:15',
      durationSec: 915,
      image: '/assets/listen/moon-story.jpg',
      featured: false,
      desc: 'A timeless tale about the origins of the moon and its connection to ancestral spirits.',
      tags: ['myth', 'moon', 'ancestors'],
      createdAt: new Date().toISOString()
    }
  ];

  await Promise.all(items.map(item => db.collections.insert(item)));
  console.log('✓ Listen/audio content seeded');
}

async function initDB() {
  await seedHeritage();
  await seedCalendar();
  await seedListenContent();
  console.log('✓ Database initialized');
}

export { db, initDB };