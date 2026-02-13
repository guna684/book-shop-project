import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './models/Order.js';
import connectDB from './config/db.js';

dotenv.config();

const cleanupAnalytics = async () => {
    try {
        await connectDB();

        console.log('Cleaning up mock analytics data...');

        // Count before
        const beforeCount = await Order.countDocuments({});
        console.log(`Total Orders Before: ${beforeCount}`);

        // Delete orders with the specific mock address
        const result = await Order.deleteMany({
            'shippingAddress.address': '123 Test St',
            'shippingAddress.city': 'Test City'
        });

        console.log(`Deleted ${result.deletedCount} mock orders.`);

        // Count after
        const afterCount = await Order.countDocuments({});
        console.log(`Total Orders After: ${afterCount}`);

        process.exit();
    } catch (error) {
        console.error('Error cleaning up:', error);
        process.exit(1);
    }
};

cleanupAnalytics();
