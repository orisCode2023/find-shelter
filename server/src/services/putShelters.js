import { getDB } from "../db/mongo.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function createShelters() {
    try {
        const db = getDB();
        const sheltersCollection = db.collection('shelters');
        
        const count = await sheltersCollection.countDocuments();
        if (count > 0) {
            console.log('Data already exists');
            return;     
        }
        
        const jsonPath = path.join(__dirname, 'shelters.json');

        const rawData = fs.readFileSync(jsonPath, 'utf-8');
        const jsonData = JSON.parse(rawData);

        const result = await sheltersCollection.insertMany(jsonData);
        console.log(`All shelters are entered, total: ${result.insertedCount}`);

    } catch (error) {
        console.error('Error in entering data:', error);
    }
}