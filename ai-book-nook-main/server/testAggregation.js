import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './models/Order.js';
import connectDB from './config/db.js';

dotenv.config();

const testAggregation = async () => {
    try {
        await connectDB();

        console.log('Testing Sales Aggregation...');

        const today = new Date();
        const startDate = new Date();
        startDate.setDate(today.getDate() - 30);

        console.log('Date Filter:', {
            today,
            startDate
        });

        const sales = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    isPaid: true
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    totalSales: { $sum: "$totalPrice" },
                    orderCount: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        console.log('Aggregation Result:', JSON.stringify(sales, null, 2));

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

testAggregation();
