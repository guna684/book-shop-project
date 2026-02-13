import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import analyticsRoutes from './routes/analyticsRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

dotenv.config();

const app = express();
app.use(express.json());

// Mock auth middleware for testing
app.use((req, res, next) => {
    req.user = { _id: 'test-user', isAdmin: true };
    next();
});

app.use('/api/analytics', analyticsRoutes);
app.use('/api/orders', orderRoutes);

async function testAPI() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB Atlas\n');

        const server = app.listen(5001, () => {
            console.log('🚀 Test server running on port 5001\n');

            // Test the dashboard overview endpoint
            console.log('Testing: GET /api/analytics/dashboard-overview');
            fetch('http://localhost:5001/api/analytics/dashboard-overview')
                .then(res => res.json())
                .then(data => {
                    console.log('\n=== API RESPONSE ===');
                    console.log(JSON.stringify(data, null, 2));
                    console.log('\n=== KEY METRICS ===');
                    console.log('Total Orders:', data.totalOrders);
                    console.log('Total Revenue: ₹' + data.totalRevenue);
                    console.log('Total Users:', data.totalUsers);
                    console.log('Total Books:', data.totalBooks);

                    server.close();
                    mongoose.connection.close();
                    process.exit(0);
                })
                .catch(err => {
                    console.error('❌ API Error:', err.message);
                    server.close();
                    mongoose.connection.close();
                    process.exit(1);
                });
        });
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

testAPI();
