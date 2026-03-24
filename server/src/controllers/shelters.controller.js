import { getAllShelters, getNearestShelters } from "../services/shelters.service.js";

export async function getShelters (req, res) {
    try {
        const shelters = await getAllShelters();
        if (shelters.length === 0) {
            res.status(500).json({
                message: "no shelters are found"
            })
        }
        res.status(200).json(shelters);
    } catch (error) {
        console.error("Controller Error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal Server Error" 
        });
    }
};

export async function findNearby(req, res) {
    try {
        const { lat, lon } = req.body;

        if (!lat || !lon) {
            return res.status(400).json({ message: "Latitude and Longitude are required" });
        }
        const shelters = await getNearestShelters(Number(lat), Number(lon));
        res.status(200).json(shelters);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};