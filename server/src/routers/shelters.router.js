import express from 'express';
import { getShelters, findNearby } from '../controllers/shelters.controller.js';

const router = express.Router();

router.get('/', getShelters);
router.post('/nearby', findNearby)

export default router;