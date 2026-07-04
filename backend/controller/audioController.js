import AudioModel from "../models/audioModel.js";

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
