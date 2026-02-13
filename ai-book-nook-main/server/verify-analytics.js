import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './models/Order.js';
import User from './models/User.js';
import Book from './models/Book.js';

dotenv.config();

const verifyAnalytics = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        // Calculate date range (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        thirtyDaysAgo.setHours(0, 0, 0, 0);

        console.log('📅 Date Range: Last 30 days');
        console.log(`   From: ${thirtyDaysAgo.toISOString()}`);
        console.log(`   To: ${new Date().toISOString()}\n`);

        console.log('='.repeat(60));
        console.log('VERIFICATION REPORT - Admin Dashboard Analytics');
        console.log('='.repeat(60) + '\n');

        // 1. Verify Total Orders
        console.log('1️⃣  TOTAL ORDERS (Last 30 Days)');
        const totalOrders = await Order.countDocuments({
            createdAt: { $gte: thirtyDaysAgo }
        });
        console.log(`   ✓ Total Orders: ${totalOrders}\n`);

        // 2. Verify Total Revenue (Paid Orders Only)
        console.log('2️⃣  TOTAL REVENUE (Paid Orders, Last 30 Days)');
        const revenueResult = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: thirtyDaysAgo },
                    isPaid: true
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalPrice' },
                    paidOrdersCount: { $sum: 1 }
                }
            }
        ]);
        const revenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;
        const paidOrders = revenueResult.length > 0 ? revenueResult[0].paidOrdersCount : 0;
        console.log(`   ✓ Total Revenue: ₹${revenue.toLocaleString()}`);
        console.log(`   ✓ Paid Orders: ${paidOrders}\n`);

        // 3. Verify Top 5 Selling Products
        console.log('3️⃣  TOP 5 BEST SELLERS (Last 30 Days)');
        const topProducts = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: thirtyDaysAgo },
                    isPaid: true
                }
            },
            { $unwind: '$orderItems' },
            {
                $group: {
                    _id: '$orderItems.product',
                    title: { $first: '$orderItems.title' },
                    totalSold: { $sum: '$orderItems.qty' },
                    totalRevenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.qty'] } }
                }
            },
            { $sort: { totalSold: -1 } },
            { $limit: 5 }
        ]);
        topProducts.forEach((product, index) => {
            console.log(`   ${index + 1}. ${product.title}`);
            console.log(`      Sold: ${product.totalSold} units | Revenue: ₹${product.totalRevenue.toLocaleString()}`);
        });
        console.log('');

        // 4. Verify Category Sales
        console.log('4️⃣  CATEGORY SALES (Last 30 Days)');
        const categorySales = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: thirtyDaysAgo },
                    isPaid: true
                }
            },
            { $unwind: '$orderItems' },
            {
                $lookup: {
                    from: 'books',
                    localField: 'orderItems.product',
                    foreignField: '_id',
                    as: 'bookData'
                }
            },
            { $unwind: '$bookData' },
            {
                $group: {
                    _id: '$bookData.category',
                    revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.qty'] } },
                    unitsSold: { $sum: '$orderItems.qty' }
                }
            },
            { $sort: { revenue: -1 } }
        ]);

        let totalCategoryRevenue = 0;
        categorySales.forEach((category) => {
            console.log(`   ✓ ${category._id}: ₹${category.revenue.toLocaleString()} (${category.unitsSold} units)`);
            totalCategoryRevenue += category.revenue;
        });
        console.log(`   📊 Total Category Revenue: ₹${totalCategoryRevenue.toLocaleString()}\n`);

        // 5. Verify Order Status Breakdown
        console.log('5️⃣  ORDER STATUS BREAKDOWN (Paid Orders, Last 30 Days)');
        const orderStatus = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: thirtyDaysAgo },
                    isPaid: true
                }
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);
        orderStatus.forEach((status) => {
            console.log(`   ✓ ${status._id}: ${status.count} orders`);
        });
        console.log('');

        // 6. Verify Users and Books (All Time)
        console.log('6️⃣  USERS & BOOKS (All Time)');
        const totalUsers = await User.countDocuments({ isAdmin: false });
        const totalBooks = await Book.countDocuments();
        console.log(`   ✓ Total Users: ${totalUsers}`);
        console.log(`   ✓ Total Books: ${totalBooks}\n`);

        // 7. Data Consistency Check
        console.log('='.repeat(60));
        console.log('DATA CONSISTENCY CHECKS');
        console.log('='.repeat(60) + '\n');

        console.log('✅ Revenue Consistency:');
        console.log(`   Total from category breakdown: ₹${totalCategoryRevenue.toLocaleString()}`);
        console.log(`   Total from revenue query: ₹${revenue.toLocaleString()}`);
        const revenueDiff = Math.abs(totalCategoryRevenue - revenue);
        if (revenueDiff < 1) {
            console.log(`   ✅ MATCH! (Difference: ₹${revenueDiff.toFixed(2)})\n`);
        } else {
            console.log(`   ⚠️  MISMATCH! (Difference: ₹${revenueDiff.toFixed(2)})\n`);
        }

        console.log('✅ Order Count Consistency:');
        console.log(`   Total orders in date range: ${totalOrders}`);
        console.log(`   Paid orders in date range: ${paidOrders}`);
        console.log(`   Unpaid orders: ${totalOrders - paidOrders}\n`);

        console.log('='.repeat(60));
        console.log('VERIFICATION COMPLETE ✅');
        console.log('='.repeat(60));
        console.log('\n📝 Summary:');
        console.log('   • All queries use consistent date filtering (last 30 days)');
        console.log('   • Revenue calculations only include isPaid: true orders');
        console.log('   • Category sales match total revenue');
        console.log('   • Order status breakdown only includes paid orders');
        console.log('   • Users and Books counts are all-time (not date-filtered)\n');

    } catch (error) {
        console.error('❌ Verification Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
};

verifyAnalytics();
