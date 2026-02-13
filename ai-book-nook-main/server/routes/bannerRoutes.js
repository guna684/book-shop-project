import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
    getActiveBanner,
    getBannerSettings,
    updateBanner
} from '../controllers/bannerController.js';

const router = express.Router();

router.get('/', getActiveBanner);
router.get('/admin', protect, admin, getBannerSettings);
router.post('/', protect, admin, updateBanner);

export default router;
