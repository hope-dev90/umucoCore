import KwibukaModel from "../models/kwibukaModel.js";

export const getAllKwibuka = async (req, res) => {
  try {
    const { type } = req.query;
    const content = await KwibukaModel.getAll({ type });
    res.json({ content, total: content.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch Kwibuka content" });
  }
};

export const getFeaturedKwibuka = async (req, res) => {
  try {
    const content = await KwibukaModel.getFeatured();
    res.json({ content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch featured Kwibuka content" });
  }
};

export const getKwibukaById = async (req, res) => {
  try {
    const { id } = req.params;
    const content = await KwibukaModel.getById(id);
    if (!content) {
      return res.status(404).json({ error: "Kwibuka content not found" });
    }
    res.json(content);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch Kwibuka content" });
  }
};

export const createKwibuka = async (req, res) => {
  try {
    const content = await KwibukaModel.create(req.body);
    res.status(201).json(content);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create Kwibuka content" });
  }
};

export const updateKwibuka = async (req, res) => {
  try {
    const { id } = req.params;
    const content = await KwibukaModel.update(id, req.body);
    if (!content) {
      return res.status(404).json({ error: "Kwibuka content not found" });
    }
    res.json(content);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update Kwibuka content" });
  }
};

export const deleteKwibuka = async (req, res) => {
  try {
    const { id } = req.params;
    const content = await KwibukaModel.delete(id);
    if (!content) {
      return res.status(404).json({ error: "Kwibuka content not found" });
    }
    res.json({ message: "Kwibuka content deleted successfully", content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete Kwibuka content" });
  }
};
