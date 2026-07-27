import VideoModel from "../models/videoModel.js";

export const getAllVideo = async (req, res) => {
  try {
    const { category } = req.query;
    const video = await VideoModel.getAll({ category });
    res.json({ video, total: video.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch video content" });
  }
};

export const getFeaturedVideo = async (req, res) => {
  try {
    const video = await VideoModel.getFeatured();
    res.json({ video });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch featured video" });
  }
};

export const getVideoById = async (req, res) => {
  try {
    const { id } = req.params;
    const video = await VideoModel.getById(id);
    if (!video) {
      return res.status(404).json({ error: "Video content not found" });
    }
    res.json(video);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch video content" });
  }
};

export const createVideo = async (req, res) => {
  try {
    const created_by = req.user?.id;
    const video = await VideoModel.create({ ...req.body, created_by });
    res.status(201).json(video);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create video content" });
  }
};

export const updateVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const video = await VideoModel.update(id, req.body);
    if (!video) {
      return res.status(404).json({ error: "Video content not found" });
    }
    res.json(video);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update video content" });
  }
};

export const deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const video = await VideoModel.delete(id);
    if (!video) {
      return res.status(404).json({ error: "Video content not found" });
    }
    res.json({ message: "Video content deleted successfully", video });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete video content" });
  }
};
