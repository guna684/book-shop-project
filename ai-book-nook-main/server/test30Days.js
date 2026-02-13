import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

async function directQuery() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected\n');

        const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false }));

        // Test the EXACT filter that should be used
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        thirtyDaysAgo.setHours(0, 0, 0, 0);

        const filter = {
            createdAt: { $gte: thirtyDaysAgo },
            status: 'Delivered'
        };

        console.log('Filter:', filter);
        console.log('30 days ago:', thirtyDaysAgo.toISOString());
        console.log('Today:', new Date().toISOString(), '\n');

        const orders = await Order.find(filter).select('createdAt totalPrice status');

        console.log('=== RESULTS ===');
        console.log('Count:', orders.length);
        console.log('Total Revenue: ₹' + orders.reduce((sum, o) => sum + o.totalPrice, 0).toFixed(2));

        console.log('\n=== ORDER DETAILS ===');
        orders.forEach((o, i) => {
            console.log(`${i + 1}. Date: ${o.createdAt.toISOString().split('T')[0]}, Price: ₹${o.totalPrice}, Status: ${o.status}`);
        });

        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

directQuery();
