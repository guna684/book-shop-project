import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './models/Order.js';
import connectDB from './config/db.js';

dotenv.config();

const checkData = async () => {
    try {
        await connectDB();

        const totalOrders = await Order.countDocuments({});
        const paidOrders = await Order.countDocuments({ isPaid: true });

        console.log(`Total Orders: ${totalOrders}`);
        console.log(`Paid Orders: ${paidOrders}`);

        if (paidOrders === 0) {
            console.log("No paid orders found. Charts filtering by 'isPaid: true' will be empty.");
        }

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkData();
