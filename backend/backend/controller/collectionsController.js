import CollectionsModel from "../models/collectionsModel.js";

export const getAllCollections = async (req, res) => {
  try {
    const { category } = req.query;
    const collections = await CollectionsModel.getAll({ category });
    res.json({ collections, total: collections.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch collections" });
  }
};

export const getCollectionById = async (req, res) => {
  try {
    const { id } = req.params;
    const collection = await CollectionsModel.getById(id);
    if (!collection) {
      return res.status(404).json({ error: "Collection not found" });
    }
    res.json(collection);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch collection" });
  }
};

export const createCollection = async (req, res) => {
  try {
    const collection = await CollectionsModel.create(req.body);
    res.status(201).json(collection);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create collection" });
  }
};

export const updateCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const collection = await CollectionsModel.update(id, req.body);
    if (!collection) {
      return res.status(404).json({ error: "Collection not found" });
    }
    res.json(collection);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update collection" });
  }
};

export const deleteCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const collection = await CollectionsModel.delete(id);
    if (!collection) {
      return res.status(404).json({ error: "Collection not found" });
    }
    res.json({ message: "Collection deleted successfully", collection });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete collection" });
  }
};
