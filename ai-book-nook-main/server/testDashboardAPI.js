import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { getDeliveredDateRangeFilter } from './utils/orderFilters.js';

dotenv.config();

async function testDashboardAPI() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB Atlas\n');

        const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false }));

        // Simulate the dashboard API call
        const dateFilter = getDeliveredDateRangeFilter(null, null, false);

        console.log('📊 Testing Dashboard Overview API Logic:');
        console.log('Date Filter:', JSON.stringify(dateFilter, null, 2));

        // Count delivered orders
        const ordersCount = await Order.countDocuments(dateFilter);
        console.log('\nTotal Delivered Orders (countDocuments):', ordersCount);

        // Get revenue
        const revenueData = await Order.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$totalPrice" },
                    paidOrdersCount: { $sum: 1 }
                }
            }
        ]);

        console.log('\nRevenue Aggregation Result:', revenueData);
        const revenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;
        const paidOrders = revenueData.length > 0 ? revenueData[0].paidOrdersCount : 0;

        console.log('\n=== FINAL RESULTS ===');
        console.log('Total Orders:', ordersCount);
        console.log('Total Revenue: ₹' + revenue.toFixed(2));
        console.log('Paid Orders:', paidOrders);

        // Compare with direct query
        console.log('\n=== VERIFICATION (Direct Query) ===');
        const directDelivered = await Order.find({ status: 'Delivered' }).select('totalPrice');
        console.log('Direct Delivered Count:', directDelivered.length);
        console.log('Direct Revenue: ₹' + directDelivered.reduce((sum, o) => sum + o.totalPrice, 0).toFixed(2));

        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        console.error(err.stack);
        process.exit(1);
    }
}

testDashboardAPI();
