import { getDB } from "../db/mongo.js";

export const alertsService = {
    async createAlert(alertData) {
        const db = getDB();
        const alert = {
            title: alertData.title,
            description: alertData.description,
            location: {
                type: "Point",
                coordinates: [parseFloat(alertData.lng), parseFloat(alertData.lat)]
            },
            createdAt: new Date() 
        };
        return await db.collection('alerts').insertOne(alert);
    },

    async getAlertsByLocation(lng, lat, radiusInMeters = 5000) {
        const db = getDB();
        return await db.collection('alerts').find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: parseInt(radiusInMeters)
                }
            }
        }).toArray();
    }
};