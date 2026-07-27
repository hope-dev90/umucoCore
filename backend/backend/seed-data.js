import { connectDB } from "./config/db.js";
import HeritageModel from "./models/heritageModel.js";
import CollectionsModel from "./models/collectionsModel.js";
import KwibukaModel from "./models/kwibukaModel.js";
import CalendarModel from "./models/calendarModel.js";
import AudioModel from "./models/audioModel.js";
import VideoModel from "./models/videoModel.js";
import pool from "./config/db.js";

const seedData = async () => {
  try {
    await connectDB();

    console.log("Seeding heritage items...");

    // Check existing data
    const checkHeritage = await pool.query(
      "SELECT COUNT(*) FROM heritage_items",
    );
    if (parseInt(checkHeritage.rows[0].count) === 0) {
      await HeritageModel.create({
        title: "The King's Palace",
        category: "Architecture",
        location: "Nyanza",
        lat: -2.358,
        lng: 29.546,
        description:
          "Discover the majestic dome-shaped structures that served as the heart of pre-colonial Rwanda.",
        image_url: "",
        era: "Pre-colonial",
        region: "South",
        is_active: true,
      });

      await HeritageModel.create({
        title: "Buhanga Eco-Park",
        category: "History",
        location: "Musanze",
        lat: -1.507,
        lng: 29.632,
        description:
          "An ancient forest where kings were consecrated, preserving both the ecological and spiritual heritage of the nation.",
        image_url: "",
        era: "Pre-colonial",
        region: "North",
        is_active: true,
      });

      await HeritageModel.create({
        title: "Intore Rituals",
        category: "Performance",
        location: "National",
        lat: -1.97,
        lng: 30.104,
        description:
          "The dance of heroes, characterized by rhythmic movements, traditional drums, and warrior symbolism.",
        image_url: "",
        era: "Pre-colonial",
        region: "",
        is_active: true,
      });

      await HeritageModel.create({
        title: "Agaseke Weaving",
        category: "Crafts",
        location: "Gitarama",
        lat: -2.073,
        lng: 29.752,
        description:
          "The iconic peace basket, a symbol of reconciliation and intricate craftsmanship passed down through generations.",
        image_url: "",
        era: "Post-1994",
        region: "South",
        is_active: true,
      });

      await HeritageModel.create({
        title: "Imigongo Geometry",
        category: "Art",
        location: "Kibungo",
        lat: -2.237,
        lng: 30.456,
        description:
          "Explore the rhythmic patterns of imigongo, a unique art form using natural pigments and relief structures.",
        image_url: "",
        era: "Pre-colonial",
        region: "East",
        is_active: true,
      });

      await HeritageModel.create({
        title: "Earthenware Legacy",
        category: "Artifacts",
        location: "Rubavu",
        lat: -1.703,
        lng: 29.27,
        description:
          "Centuries of functional art, from milk jars to communal cooking vessels, reflecting the daily lives of ancestors.",
        image_url: "",
        era: "Pre-colonial",
        region: "West",
        is_active: true,
      });

      console.log("Heritage items seeded successfully!");
    } else {
      console.log("Heritage items already exist, skipping...");
    }

    const checkKwibuka = await pool.query(
      "SELECT COUNT(*) FROM kwibuka_content",
    );
    if (parseInt(checkKwibuka.rows[0].count) === 0) {
      await KwibukaModel.create({
        title: "Memory is the Seed of Future Peace",
        type: "Reflection",
        content:
          "Memory is not just about the past; it is the seed of our future peace.",
        media_url: "",
        date: "2025-04-07",
        is_featured: true,
      });
      console.log("Kwibuka content seeded successfully!");
    } else {
      console.log("Kwibuka content already exists, skipping...");
    }

    const checkCollections = await pool.query(
      "SELECT COUNT(*) FROM collections",
    );
    if (parseInt(checkCollections.rows[0].count) === 0) {
      await CollectionsModel.create({
        title: "The Inanga Tradition",
        description:
          "A deep dive into the evolution of Rwanda's premier string instrument.",
        category: "Oral Tradition",
        image_url: "",
        curated_by: "Dr. Aimé N.",
        is_active: true,
      });
      await CollectionsModel.create({
        title: "Royal Court Rituals",
        description:
          "Preserving the rhythmic essence of the Umuganura festival and its sacred ceremonial protocols.",
        category: "History",
        image_url: "",
        curated_by: "",
        is_active: true,
      });
      console.log("Collections seeded successfully!");
    } else {
      console.log("Collections already exist, skipping...");
    }

    const checkCalendar = await pool.query(
      "SELECT COUNT(*) FROM calendar_events",
    );
    if (parseInt(checkCalendar.rows[0].count) === 0) {
      await CalendarModel.create({
        title: "Umuganura: The National Harvest Festival",
        description:
          "Celebrating the first fruits and the spirit of shared prosperity across the land.",
        event_date: "2025-08-18",
        event_type: "National",
        location: "National",
        is_featured: true,
      });
      await CalendarModel.create({
        title: "Cultural Diversity Day",
        description:
          "Dialogue and Development celebrating Rwanda's rich cultural heritage.",
        event_date: "2025-05-21",
        event_type: "International",
        location: "Kigali",
        is_featured: true,
      });
      console.log("Calendar events seeded successfully!");
    } else {
      console.log("Calendar events already exist, skipping...");
    }

    // Seed audio content
    const checkAudio = await pool.query("SELECT COUNT(*) FROM audio_content");
    if (parseInt(checkAudio.rows[0].count) === 0) {
      await AudioModel.create({
        title: "Royal Drum Rhythms of Rwanda",
        description:
          "Historic drumming performance by the Royal Drummers of Mwami, recorded in Nyanza, 1952. A foundational sound of Rwandan kingship.",
        audio_url: "https://samap.ukzn.ac.za/sites/default/files/audio/ILAM/AC1236-F3T4.mp3",
        thumbnail_url: "",
        duration: 180,
        category: "Traditional Music",
        is_featured: true,
      });
      await AudioModel.create({
        title: "Lama — Love Song from the Court",
        description:
          "A traditional Tutsi love song performed by Tutsi singers, composed by Leonard Ndengabaganizi. Recorded in Rwanda, 1952.",
        audio_url: "https://samap.ukzn.ac.za/sites/default/files/audio/ILAM/AC1228-F3U9.mp3",
        thumbnail_url: "",
        duration: 210,
        category: "Traditional Music",
        is_featured: true,
      });
      await AudioModel.create({
        title: "Nimuze tugweragwere — Chief's Honor Song",
        description:
          "A Watutsi song composed in honour of Omwami, performed by Ladies of the Omwami's Court with Leonard Ndengabaganizi and Michel Rwagasana. Recorded in Rwanda, 1952.",
        audio_url: "https://samap.ukzn.ac.za/sites/default/files/audio/ILAM/AC1228-F3U3.mp3",
        thumbnail_url: "",
        duration: 240,
        category: "Traditional Music",
        is_featured: true,
      });
      console.log("Audio content seeded successfully!");
    } else {
      console.log("Audio content already exists, skipping...");
    }

    // Seed video content
    const checkVideo = await pool.query("SELECT COUNT(*) FROM video_content");
    if (parseInt(checkVideo.rows[0].count) === 0) {
      await VideoModel.create({
        title: "Jamafest Rwanda & Uganda Traditional Dances",
        description:
          "Traditional Rwandan and Ugandan dance performances from the Jamafest cultural festival, showcasing Intore and other heritage dances.",
        video_url: "https://archive.org/download/FOCUSONAFRICA-CULTURALMUSICANDDANCEDVLV2018/JamafestRwandaUgandaTraditionalDances.mp4",
        thumbnail_url: "",
        duration: 840,
        category: "Performance",
        is_featured: true,
      });
      console.log("Video content seeded successfully!");
    } else {
      console.log("Video content already exists, skipping...");
    }

    const checkProverbs = await pool.query("SELECT COUNT(*) FROM proverbs");
    if (parseInt(checkProverbs.rows[0].count) === 0) {
      await pool.query(
        `INSERT INTO proverbs (text, translation, language, category, source, is_featured) VALUES
        ($1, $2, $3, $4, $5, $6),
        ($7, $8, $9, $10, $11, $12),
        ($13, $14, $15, $16, $17, $18),
        ($19, $20, $21, $22, $23, $24),
        ($25, $26, $27, $28, $29, $30),
        ($31, $32, $33, $34, $35, $36),
        ($37, $38, $39, $40, $41, $42),
        ($43, $44, $45, $46, $47, $48)`,
        [
          "Urukwavu rurinda rukuze rukonshwa n'imbwa.",
          "The hyena guards the old cow only to be beaten by a dog.",
          "Kinyarwanda",
          "Wisdom",
          "Rwandan oral tradition",
          true,
          "Abari bose ntabwo ari abagabo.",
          "Not all who carry spears are men.",
          "Kinyarwanda",
          "Wisdom",
          "Rwandan oral tradition",
          true,
          "Inzara y'umuntu ni uko abandi bitwa.",
          "A person's hunger is determined by how others behave.",
          "Kinyarwanda",
          "Social",
          "Rwandan oral tradition",
          true,
          "Gusaba ntibura, gutanga ntigushira.",
          "To ask never ends; to give never finishes.",
          "Kinyarwanda",
          "Generosity",
          "Rwandan oral tradition",
          true,
          "Umutwe ni wo utuma umuntu atera amabuye.",
          "It is the mind that makes a person throw stones.",
          "Kinyarwanda",
          "Wisdom",
          "Rwandan oral tradition",
          true,
          "Igituba cy'umugabo ni inka.",
          "A man's wealth is measured in cattle.",
          "Kinyarwanda",
          "Prosperity",
          "Rwandan oral tradition",
          true,
          "Nta mugabo ujya gushaka inka y'umukwe.",
          "No man goes to look for his son-in-law's cattle.",
          "Kinyarwanda",
          "Social",
          "Rwandan oral tradition",
          true,
          "Uwemera agenda, uwanga kuremwa.",
          "He who accepts advice moves forward; he who rejects it is left behind.",
          "Kinyarwanda",
          "Wisdom",
          "Rwandan oral tradition",
          true,
        ]
      );
      console.log("Proverbs seeded successfully!");
    } else {
      console.log("Proverbs already exist, skipping...");
    }

    console.log("All data seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding data:", err);
    process.exit(1);
  }
};

seedData();
