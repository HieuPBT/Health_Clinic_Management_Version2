import express from 'express';
import { getStatsData } from '../controllers/statsController.js'

const router = express.Router();

router.get('/', getStatsData);

router.get('/view', (req, res) => {
    res.render('stats')
});

export default router;
