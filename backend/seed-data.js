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
        title: "The Song of Ruganzu II: The King's Return",
        description:
          "A legendary oral recitation by Mzee Silas, depicting the mythical homecoming of the great King Ruganzu Ndoli.",
        audio_url: "",
        thumbnail_url: "",
        duration: 360,
        category: "Oral Tradition",
        is_featured: true,
      });
      await AudioModel.create({
        title: "Why the Crane has a Crown",
        description:
          "A traditional Rwandan fable narrated with musical accompaniment.",
        audio_url: "",
        thumbnail_url: "",
        duration: 180,
        category: "Fables & Myths",
        is_featured: true,
      });
      await AudioModel.create({
        title: "The Man on the Moon",
        description:
          "A classic Rwandan folk tale about the man who lives on the moon.",
        audio_url: "",
        thumbnail_url: "",
        duration: 240,
        category: "Fables & Myths",
        is_featured: false,
      });
      console.log("Audio content seeded successfully!");
    } else {
      console.log("Audio content already exists, skipping...");
    }

    // Seed video content
    const checkVideo = await pool.query("SELECT COUNT(*) FROM video_content");
    if (parseInt(checkVideo.rows[0].count) === 0) {
      await VideoModel.create({
        title: "Intore Dance Performance",
        description:
          "Traditional Rwandan Intore dance performance showcasing warrior traditions.",
        video_url: "",
        thumbnail_url: "",
        duration: 480,
        category: "Performance",
        is_featured: true,
      });
      await VideoModel.create({
        title: "Agaseke Weaving Tutorial",
        description:
          "Learn how to weave the iconic Rwandan peace basket step by step.",
        video_url: "",
        thumbnail_url: "",
        duration: 720,
        category: "Crafts",
        is_featured: true,
      });
      await VideoModel.create({
        title: "Imigongo Art Creation",
        description:
          "Watch master artists create beautiful imigongo geometric patterns.",
        video_url: "",
        thumbnail_url: "",
        duration: 600,
        category: "Art",
        is_featured: false,
      });
      console.log("Video content seeded successfully!");
    } else {
      console.log("Video content already exists, skipping...");
    }

    console.log("All data seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding data:", err);
    process.exit(1);
  }
};

seedData();
