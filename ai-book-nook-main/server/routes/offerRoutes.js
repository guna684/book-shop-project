import express from 'express';
const router = express.Router();
import { validateOffer, createOffer, getOffers } from '../controllers/offerController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.post('/validate', protect, validateOffer);
router.route('/').post(protect, admin, createOffer).get(protect, admin, getOffers);

export default router;
