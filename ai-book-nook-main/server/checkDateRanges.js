import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

async function checkDateRanges() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB Atlas\n');

        const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false }));

        // Get all delivered orders with dates
        const deliveredOrders = await Order.find({ status: 'Delivered' })
            .select('createdAt totalPrice')
            .sort({ createdAt: 1 });

        console.log('=== DELIVERED ORDERS BY DATE ===');
        console.log('Total Delivered Orders:', deliveredOrders.length);
        console.log('Total Revenue: ₹' + deliveredOrders.reduce((sum, o) => sum + o.totalPrice, 0).toFixed(2));

        if (deliveredOrders.length > 0) {
            console.log('\nOldest Order:', deliveredOrders[0].createdAt.toISOString().split('T')[0]);
            console.log('Newest Order:', deliveredOrders[deliveredOrders.length - 1].createdAt.toISOString().split('T')[0]);
        }

        // Check last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        thirtyDaysAgo.setHours(0, 0, 0, 0);

        const last30Days = await Order.find({
            status: 'Delivered',
            createdAt: { $gte: thirtyDaysAgo }
        }).select('createdAt totalPrice');

        console.log('\n=== LAST 30 DAYS ===');
        console.log('Orders in last 30 days:', last30Days.length);
        console.log('Revenue (last 30 days): ₹' + last30Days.reduce((sum, o) => sum + o.totalPrice, 0).toFixed(2));

        // Check orders by month
        const ordersByMonth = await Order.aggregate([
            { $match: { status: 'Delivered' } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    count: { $sum: 1 },
                    revenue: { $sum: "$totalPrice" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        console.log('\n=== ORDERS BY MONTH ===');
        ordersByMonth.forEach(m => {
            console.log(`${m._id}: ${m.count} orders, ₹${m.revenue.toFixed(2)}`);
        });

        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

checkDateRanges();
