import express from 'express';
import { getShelters } from '../controllers/shelters.controller.js';

const router = express.Router();

router.get('/', getShelters);

export default router;