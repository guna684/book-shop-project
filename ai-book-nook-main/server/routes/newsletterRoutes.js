import express from 'express';
const router = express.Router();
import { subscribeToNewsletter, sendNewsletter } from '../controllers/newsletterController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.post('/subscribe', subscribeToNewsletter);
router.post('/send', protect, admin, sendNewsletter);

export default router;
