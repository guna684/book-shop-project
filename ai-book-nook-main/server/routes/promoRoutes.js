import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
    validatePromoCode,
    getPromoCodes,
    createPromoCode,
    updatePromoCode,
    deletePromoCode,
    getPromoCodeStats
} from '../controllers/promoController.js';

const router = express.Router();

// Customer routes
router.post('/validate', protect, validatePromoCode);

// Admin routes
router.route('/admin')
    .get(protect, admin, getPromoCodes)
    .post(protect, admin, createPromoCode);

router.route('/admin/:id')
    .put(protect, admin, updatePromoCode)
    .delete(protect, admin, deletePromoCode);

router.get('/admin/:id/stats', protect, admin, getPromoCodeStats);

export default router;
