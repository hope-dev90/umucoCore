import AudioModel from "../models/audioModel.js";

const VOICE_PROFILES = [
  {
    id: 0,
    name: "Umutoni",
    label: "Female, soft",
    preferredVoiceHints: ["female", "samantha", "zira", "google uk english female"],
    rate: 0.92,
    pitch: 1.08,
    lang: "en-GB",
  },
  {
    id: 1,
    name: "Kamanzi",
    label: "Male, deep",
    preferredVoiceHints: ["male", "daniel", "david", "google uk english male"],
    rate: 0.88,
    pitch: 0.82,
    lang: "en-GB",
  },
  {
    id: 2,
    name: "Ineza",
    label: "Clear youth voice",
    preferredVoiceHints: ["female", "google us english", "zira"],
    rate: 1,
    pitch: 1,
    lang: "en-US",
  },
];

const normalizeVoiceId = (voice) => {
  const id = Number(voice);
  return VOICE_PROFILES.some((profile) => profile.id === id) ? id : 0;
};

const buildNarrationText = (audio) => {
  const parts = [
    audio.title,
    audio.description,
    audio.category ? `Category: ${audio.category}.` : "",
  ].filter(Boolean);

  return parts.join(". ");
};

export const getAllAudio = async (req, res) => {
  try {
    const { category } = req.query;
    const audio = await AudioModel.getAll({ category });
    res.json({ audio, total: audio.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch audio content" });
  }
};

export const getFeaturedAudio = async (req, res) => {
  try {
    const audio = await AudioModel.getFeatured();
    res.json({ audio });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch featured audio" });
  }
};

export const getAudioById = async (req, res) => {
  try {
    const { id } = req.params;
    const audio = await AudioModel.getById(id);
    if (!audio) {
      return res.status(404).json({ error: "Audio content not found" });
    }
    res.json(audio);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch audio content" });
  }
};

export const getVoiceProfiles = async (_req, res) => {
  res.json({ voices: VOICE_PROFILES });
};

export const getAudioNarration = async (req, res) => {
  try {
    const { id } = req.params;
    const audio = await AudioModel.getById(id);
    if (!audio) {
      return res.status(404).json({ error: "Audio content not found" });
    }

    const voiceId = normalizeVoiceId(req.query.voice);
    const voice = VOICE_PROFILES.find((profile) => profile.id === voiceId);

    if (audio.audio_url) {
      return res.json({
        mode: "audio",
        audioUrl: audio.audio_url,
        voice,
        title: audio.title,
      });
    }

    const text = buildNarrationText(audio);
    if (!text.trim()) {
      return res.status(422).json({ error: "No narration text available" });
    }

    res.json({
      mode: "speech-synthesis",
      text,
      voice,
      title: audio.title,
      estimatedDuration: Math.max(20, Math.round(text.split(/\s+/).length / 2.4)),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to prepare narration" });
  }
};

export const createAudio = async (req, res) => {
  try {
    const created_by = req.user?.id;
    const audio = await AudioModel.create({ ...req.body, created_by });
    res.status(201).json(audio);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create audio content" });
  }
};

export const updateAudio = async (req, res) => {
  try {
    const { id } = req.params;
    const audio = await AudioModel.update(id, req.body);
    if (!audio) {
      return res.status(404).json({ error: "Audio content not found" });
    }
    res.json(audio);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update audio content" });
  }
};

export const deleteAudio = async (req, res) => {
  try {
    const { id } = req.params;
    const audio = await AudioModel.delete(id);
    if (!audio) {
      return res.status(404).json({ error: "Audio content not found" });
    }
    res.json({ message: "Audio content deleted successfully", audio });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete audio content" });
  }
};
