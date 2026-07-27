import CalendarModel from "../models/calendarModel.js";

export const getAllEvents = async (req, res) => {
  try {
    const { event_type, month, year } = req.query;
    const events = await CalendarModel.getAll({ event_type, month, year });
    res.json({ events, total: events.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch calendar events" });
  }
};

export const getUpcomingEvents = async (req, res) => {
  try {
    const events = await CalendarModel.getUpcoming();
    res.json({ events });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch upcoming events" });
  }
};

export const getTodayEvents = async (req, res) => {
  try {
    const events = await CalendarModel.getToday();
    res.json({ events, hasEvents: events.length > 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to check today's events" });
  }
};

export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await CalendarModel.getById(id);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch event" });
  }
};

export const createEvent = async (req, res) => {
  try {
    const created_by = req.user?.id;
    const event = await CalendarModel.create({ ...req.body, created_by });
    res.status(201).json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create event" });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await CalendarModel.update(id, req.body);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update event" });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await CalendarModel.delete(id);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.json({ message: "Event deleted successfully", event });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete event" });
  }
};
