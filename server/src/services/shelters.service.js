import { getDB } from "../db/mongo.js";
export async function getAllShelters () {
    try {
        const db = getDB();
        const shelters = await db.collection('shelters').find({}).limit(20).toArray();
        return shelters;
    } catch (error) {
        throw new Error(`failed to fetch shelters: ${error.message}`);
    }
};

export async function getNearestShelters(lat, lon) {
    try {
        const db = getDB();
        const collection = db.collection('shelters');

        const uLat = parseFloat(lat);
        const uLon = parseFloat(lon);
        const maxDistanceDegrees = 3 / 111;

        const nearest = await collection.aggregate([
            {
                $addFields: {
                    distanceSq: {
                        $add: [
                            { $pow: [{ $subtract: ["$lat", uLat] }, 2] },
                            { $pow: [{ $subtract: ["$lon", uLon] }, 2] }
                        ]
                    }
                }
            },
            {
                $match: {
                    distanceSq: { $lte: Math.pow(maxDistanceDegrees, 2) }
                }
            },
            {
                $addFields: {
                    distanceInMeters: {
                        $multiply: [{ $sqrt: "$distanceSq" }, 111000]
                    }
                }
            },
            {
                $project: {
                    distanceInMeters: { $round: ["$distanceInMeters", 0] },
                    lat: 1,
                    lon: 1,
                }
            },
            { $sort: { distanceInMeters: 1 } },
            { $limit: 15 }
        ]).toArray();

        return nearest;
    } catch (error) {
        throw new Error(`Error finding shelters: ${error.message}`);
    }
}
