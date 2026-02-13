import express from 'express';
const router = express.Router();
import { createPaymentSession, verifyPayment } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

router.post('/create-session', protect, createPaymentSession);
router.post('/verify', protect, verifyPayment);

export default router;
