import { getAllShelters } from "../services/shelters.service.js";

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