import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

async function checkOrders() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB Atlas');

        const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false }));

        // Get all orders
        const allOrders = await Order.find({}).select('status totalPrice isPaid createdAt').sort({ createdAt: -1 }).limit(10);
        console.log('\n=== RECENT ORDERS ===');
        allOrders.forEach((o, i) => {
            console.log(`${i + 1}. Status: ${o.status}, Price: ₹${o.totalPrice}, isPaid: ${o.isPaid}, Date: ${o.createdAt.toISOString().split('T')[0]}`);
        });

        // Get delivered orders
        const deliveredOrders = await Order.find({ status: 'Delivered' }).select('status totalPrice isPaid');
        console.log('\n=== DELIVERED ORDERS ===');
        console.log('Count:', deliveredOrders.length);
        const totalRevenue = deliveredOrders.reduce((sum, o) => sum + o.totalPrice, 0);
        console.log('Total Revenue: ₹' + totalRevenue.toFixed(2));

        // Status breakdown
        const statusCounts = await Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
        console.log('\n=== STATUS BREAKDOWN ===');
        statusCounts.forEach(s => console.log(`${s._id}: ${s.count}`));

        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

checkOrders();
