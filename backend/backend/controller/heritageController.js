import HeritageModel from "../models/heritageModel.js";

export const getAllHeritage = async (req, res) => {
  try {
    const { category, location, region } = req.query;
    const items = await HeritageModel.getAll({ category, location, region });
    res.json({ items, total: items.length, page: 1, pages: 1 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch heritage items" });
  }
};

export const getHeritageById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await HeritageModel.getById(id);
    if (!item) {
      return res.status(404).json({ error: "Heritage item not found" });
    }
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch heritage item" });
  }
};

export const createHeritage = async (req, res) => {
  try {
    const created_by = req.user?.id;
    const item = await HeritageModel.create({ ...req.body, created_by });
    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create heritage item" });
  }
};

export const updateHeritage = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await HeritageModel.update(id, req.body);
    if (!item) {
      return res.status(404).json({ error: "Heritage item not found" });
    }
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update heritage item" });
  }
};

export const deleteHeritage = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await HeritageModel.delete(id);
    if (!item) {
      return res.status(404).json({ error: "Heritage item not found" });
    }
    res.json({ message: "Heritage item deleted successfully", item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete heritage item" });
  }
};
