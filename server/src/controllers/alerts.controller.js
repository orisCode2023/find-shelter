import { alertsService } from "../services/alerts.service.js";

export const alertsController = {
    async addAlert(req, res) {
        try {
            const { title, lat, lng } = req.body;
            if (!title || !lat || !lng) {
                return res.status(400).json({ error: "Missing required fields: title, lat, lng" });
            }
            const result = await alertsService.createAlert(req.body);
            res.status(201).json({ success: true, id: result.insertedId });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getNearbyAlerts(req, res) {
        try {
            const { lng, lat, radius } = req.query;
            if (!lng || !lat) {
                return res.status(400).json({ error: "Coordinates (lng, lat) are required" });
            }
            const alerts = await alertsService.getAlertsByLocation(lng, lat, radius);
            res.json(alerts);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};