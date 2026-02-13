import express from 'express';
const router = express.Router();
import {
    getSalesData,
    getCategorySales,
    getOrdersStats,
    getStockData,
    getUserStats,
    getOrderStatusStats,
    getPaymentStatusStats,
    getTopProducts,
    getStockByCategory,
    getStockStatus,
    getMonthlySalesTrends,
    getRevenueByProduct,
    getLowStockAlerts,
    getDashboardOverview
} from '../controllers/analyticsController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.get('/sales', protect, admin, getSalesData);
router.get('/category-sales', protect, admin, getCategorySales);
router.get('/orders', protect, admin, getOrdersStats);
router.get('/stock', protect, admin, getStockData);
router.get('/users', protect, admin, getUserStats);
router.get('/order-status', protect, admin, getOrderStatusStats);
router.get('/payment-status', protect, admin, getPaymentStatusStats);
router.get('/top-products', protect, admin, getTopProducts);
router.get('/stock-by-category', protect, admin, getStockByCategory);
router.get('/stock-status', protect, admin, getStockStatus);
router.get('/monthly-trends', protect, admin, getMonthlySalesTrends);
router.get('/revenue-by-product', protect, admin, getRevenueByProduct);
router.get('/low-stock-alerts', protect, admin, getLowStockAlerts);
router.get('/dashboard-overview', protect, admin, getDashboardOverview);

export default router;
