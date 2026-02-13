import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './models/Order.js';
import connectDB from './config/db.js';

dotenv.config();

const inspectData = async () => {
    try {
        await connectDB();

        console.log('--- Database Inspection ---');
        console.log(`URI: ${process.env.MONGO_URI}`);

        const totalCount = await Order.countDocuments({});
        console.log(`Total Orders: ${totalCount}`);

        const paidCount = await Order.countDocuments({ isPaid: true });
        console.log(`Paid Orders: ${paidCount}`);

        console.log('\n--- Last 5 Orders ---');
        const orders = await Order.find({}).sort({ createdAt: -1 }).limit(5);

        orders.forEach(order => {
            console.log(JSON.stringify({
                id: order._id,
                isPaid: order.isPaid,
                paidAt: order.paidAt,
                status: order.status,
                totalPrice: order.totalPrice,
                createdAt: order.createdAt,
                orderItemsCount: order.orderItems.length
            }, null, 2));
        });

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

inspectData();
