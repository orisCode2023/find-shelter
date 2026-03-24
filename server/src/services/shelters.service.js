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