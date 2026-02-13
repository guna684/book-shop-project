import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Book from '../models/Book.js';
import { getDeliveredFilter, getDeliveredDateRangeFilter } from '../utils/orderFilters.js';

// Helper function to get date range filter with default 30 days
// NOW USES SHARED DELIVERED FILTER UTILITY
const getDateRangeFilter = (startDate, endDate) => {
    return getDeliveredDateRangeFilter(startDate, endDate, false);
};

// @desc    Get sales data (Daily/Monthly)
// @route   GET /api/analytics/sales
// @access  Private/Admin
const getSalesData = asyncHandler(async (req, res) => {
    const { period = 'daily' } = req.query;

    // Default to last 30 days for daily, last 12 months for monthly
    const today = new Date();
    let startDate = new Date();
    let dateFormat = "%Y-%m-%d";

    if (period === 'monthly') {
        startDate.setMonth(today.getMonth() - 11);
        startDate.setDate(1);
        dateFormat = "%Y-%m";
    } else if (period === 'yearly') {
        startDate.setFullYear(today.getFullYear() - 4); // Last 5 years
        startDate.setMonth(0);
        startDate.setDate(1);
        dateFormat = "%Y";
    } else {
        startDate.setDate(today.getDate() - 30);
    }

    const sales = await Order.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate },
                ...getDeliveredFilter()
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
                totalSales: { $sum: "$totalPrice" },
                orderCount: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    res.json(sales);
});

// @desc    Get category-wise sales
// @route   GET /api/analytics/category-sales
// @access  Private/Admin
const getCategorySales = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const dateFilter = getDateRangeFilter(startDate, endDate);

    const categorySales = await Order.aggregate([
        { $match: dateFilter },
        { $unwind: "$orderItems" },
        {
            $lookup: {
                from: "books",
                localField: "orderItems.product",
                foreignField: "_id",
                as: "bookData"
            }
        },
        { $unwind: "$bookData" },
        {
            $group: {
                _id: "$bookData.category",
                sales: { $sum: { $multiply: ["$orderItems.price", "$orderItems.qty"] } },
                count: { $sum: "$orderItems.qty" }
            }
        },
        { $sort: { sales: -1 } },
        { $limit: 10 }
    ]);

    res.json(categorySales);
});

// @desc    Get orders statistics
// @route   GET /api/analytics/orders
// @access  Private/Admin
const getOrdersStats = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const dateFilter = getDateRangeFilter(startDate, endDate);

    const orders = await Order.aggregate([
        { $match: dateFilter },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                orders: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    res.json(orders);
});

// @desc    Get stock overview
// @route   GET /api/analytics/stock
// @access  Private/Admin
const getStockData = asyncHandler(async (req, res) => {
    // Get books with low stock
    const stock = await Book.find({}).select('title countInStock category').sort({ countInStock: 1 }).limit(10);
    res.json(stock);
});

// @desc    Get user growth statistics
// @route   GET /api/analytics/users
// @access  Private/Admin
const getUserStats = asyncHandler(async (req, res) => {
    // Group users by join date
    const users = await User.aggregate([
        {
            $match: { isAdmin: false }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                newUsers: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } },
        { $limit: 30 }
    ]);

    const totalUsers = await User.countDocuments({ isAdmin: false });

    res.json({ timeline: users, total: totalUsers });
});

// @desc    Get order status breakdown
// @route   GET /api/analytics/order-status
// @access  Private/Admin
const getOrderStatusStats = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const dateFilter = getDateRangeFilter(startDate, endDate);

    const stats = await Order.aggregate([
        { $match: dateFilter },
        {
            $group: {
                _id: "$status",
                value: { $sum: 1 }
            }
        }
    ]);
    res.json(stats);
});

// @desc    Get payment status breakdown
// @route   GET /api/analytics/payment-status
// @access  Private/Admin
const getPaymentStatusStats = asyncHandler(async (req, res) => {
    const stats = await Order.aggregate([
        {
            $group: {
                _id: "$isPaid",
                value: { $sum: 1 }
            }
        }
    ]);

    // Map boolean to string
    const formattedStats = stats.map(item => ({
        name: item._id ? 'Paid' : 'Unpaid',
        value: item.value
    }));

    res.json(formattedStats);
});

// @desc    Get top 5 selling products
// @route   GET /api/analytics/top-products
// @access  Private/Admin
const getTopProducts = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const dateFilter = getDateRangeFilter(startDate, endDate);

    const topProducts = await Order.aggregate([
        { $match: dateFilter },
        { $unwind: "$orderItems" },
        {
            $group: {
                _id: "$orderItems.product",
                title: { $first: "$orderItems.title" },
                totalSold: { $sum: "$orderItems.qty" },
                totalRevenue: { $sum: { $multiply: ["$orderItems.price", "$orderItems.qty"] } }
            }
        },
        { $sort: { totalSold: -1 } },
        { $limit: 5 }
    ]);
    res.json(topProducts);
});

// @desc    Get stock by category
// @route   GET /api/analytics/stock-by-category
// @access  Private/Admin
const getStockByCategory = asyncHandler(async (req, res) => {
    const stockByCategory = await Book.aggregate([
        {
            $group: {
                _id: "$category",
                totalStock: { $sum: "$countInStock" },
                bookCount: { $sum: 1 }
            }
        },
        { $sort: { totalStock: -1 } }
    ]);
    res.json(stockByCategory);
});

// @desc    Get stock status summary (In Stock vs Out of Stock)
// @route   GET /api/analytics/stock-status
// @access  Private/Admin
const getStockStatus = asyncHandler(async (req, res) => {
    const stockStatus = await Book.aggregate([
        {
            $group: {
                _id: null,
                inStock: {
                    $sum: { $cond: [{ $gt: ["$countInStock", 0] }, 1, 0] }
                },
                outOfStock: {
                    $sum: { $cond: [{ $lte: ["$countInStock", 0] }, 1, 0] }
                }
            }
        }
    ]);

    // Format for Pie Chart
    const result = stockStatus.length > 0 ? [
        { name: 'In Stock', value: stockStatus[0].inStock },
        { name: 'Out of Stock', value: stockStatus[0].outOfStock }
    ] : [];

    res.json(result);
});

// @desc    Get monthly sales trends (last 12 months)
// @route   GET /api/analytics/monthly-trends
// @access  Private/Admin
const getMonthlySalesTrends = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;

    let matchCondition = getDeliveredFilter();

    // Apply date filtering if provided
    if (startDate || endDate) {
        matchCondition.createdAt = {};
        if (startDate) matchCondition.createdAt.$gte = new Date(startDate);
        if (endDate) matchCondition.createdAt.$lte = new Date(endDate);
    } else {
        // Default to last 12 months
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
        twelveMonthsAgo.setDate(1);
        matchCondition.createdAt = { $gte: twelveMonthsAgo };
    }

    const monthlyTrends = await Order.aggregate([
        { $match: matchCondition },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                revenue: { $sum: "$totalPrice" },
                orders: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    res.json(monthlyTrends);
});

// @desc    Get revenue by product (top 10)
// @route   GET /api/analytics/revenue-by-product
// @access  Private/Admin
const getRevenueByProduct = asyncHandler(async (req, res) => {
    const { startDate, endDate, category } = req.query;

    let matchCondition = getDeliveredFilter();

    // Apply date filtering if provided
    if (startDate || endDate) {
        matchCondition.createdAt = {};
        if (startDate) matchCondition.createdAt.$gte = new Date(startDate);
        if (endDate) matchCondition.createdAt.$lte = new Date(endDate);
    }

    const pipeline = [
        { $match: matchCondition },
        { $unwind: "$orderItems" },
        {
            $lookup: {
                from: "books",
                localField: "orderItems.product",
                foreignField: "_id",
                as: "bookData"
            }
        },
        { $unwind: "$bookData" }
    ];

    // Add category filter if provided
    if (category) {
        pipeline.push({ $match: { "bookData.category": category } });
    }

    pipeline.push(
        {
            $group: {
                _id: "$orderItems.product",
                title: { $first: "$orderItems.title" },
                category: { $first: "$bookData.category" },
                totalRevenue: { $sum: { $multiply: ["$orderItems.price", "$orderItems.qty"] } },
                unitsSold: { $sum: "$orderItems.qty" }
            }
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: 10 }
    );

    const revenueByProduct = await Order.aggregate(pipeline);
    res.json(revenueByProduct);
});

// @desc    Get low stock alerts
// @route   GET /api/analytics/low-stock-alerts
// @access  Private/Admin
const getLowStockAlerts = asyncHandler(async (req, res) => {
    const { threshold = 10, category } = req.query;

    let matchCondition = {
        stock: { $lte: parseInt(threshold) },
        stock: { $gte: 0 } // Exclude negative stock
    };

    // Add category filter if provided
    if (category) {
        matchCondition.category = category;
    }

    const lowStockItems = await Book.find(matchCondition)
        .select('title category stock price')
        .sort({ stock: 1 })
        .limit(20);

    res.json(lowStockItems);
});

// @desc    Get comprehensive dashboard overview with all KPIs
// @route   GET /api/analytics/dashboard-overview
// @access  Private/Admin
const getDashboardOverview = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const dateFilter = getDateRangeFilter(startDate, endDate);

    // Run all queries in parallel for better performance
    const [
        ordersData,
        revenueData,
        topProductsData,
        categorySalesData,
        orderStatusData,
        totalUsers,
        totalBooks
    ] = await Promise.all([
        // Total delivered orders in date range (using shared filter)
        Order.countDocuments(dateFilter),

        // Total revenue from delivered orders in date range (using shared filter)
        Order.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$totalPrice" },
                    paidOrdersCount: { $sum: 1 }
                }
            }
        ]),

        // Top 5 selling products in date range (using shared filter)
        Order.aggregate([
            { $match: dateFilter },
            { $unwind: "$orderItems" },
            {
                $group: {
                    _id: "$orderItems.product",
                    title: { $first: "$orderItems.title" },
                    totalSold: { $sum: "$orderItems.qty" },
                    totalRevenue: { $sum: { $multiply: ["$orderItems.price", "$orderItems.qty"] } }
                }
            },
            { $sort: { totalSold: -1 } },
            { $limit: 5 }
        ]),

        // Category-wise sales in date range (using shared filter)
        Order.aggregate([
            { $match: dateFilter },
            { $unwind: "$orderItems" },
            {
                $lookup: {
                    from: "books",
                    localField: "orderItems.product",
                    foreignField: "_id",
                    as: "bookData"
                }
            },
            { $unwind: "$bookData" },
            {
                $group: {
                    _id: "$bookData.category",
                    sales: { $sum: { $multiply: ["$orderItems.price", "$orderItems.qty"] } },
                    count: { $sum: "$orderItems.qty" }
                }
            },
            { $sort: { sales: -1 } }
        ]),

        // Order status breakdown in date range (using shared filter)
        Order.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: "$status",
                    value: { $sum: 1 }
                }
            }
        ]),

        // Total users (all time, not date-filtered)
        User.countDocuments({ isAdmin: false }),

        // Total books (all time, not date-filtered)
        Book.countDocuments()
    ]);

    // Extract revenue and paid orders count
    const revenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;
    const paidOrders = revenueData.length > 0 ? revenueData[0].paidOrdersCount : 0;

    // Debug logging
    console.log('📊 Dashboard Overview Calculation:');
    console.log('   Date Filter:', dateFilter);
    console.log('   Total Delivered Orders:', ordersData);
    console.log('   Total Revenue:', revenue);
    console.log('   Revenue Data:', revenueData);

    res.json({
        totalOrders: ordersData,
        totalRevenue: revenue,
        totalPaidOrders: paidOrders,
        totalUsers: totalUsers,
        totalBooks: totalBooks,
        topProducts: topProductsData,
        categorySales: categorySalesData,
        orderStatusBreakdown: orderStatusData,
        dateRange: {
            start: startDate || 'Last 30 days',
            end: endDate || 'Today'
        }
    });
});

export {
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
};
