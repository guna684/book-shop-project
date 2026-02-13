import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './models/Order.js';
import Book from './models/Book.js';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();

const seedAnalytics = async () => {
    try {
        await connectDB();

        console.log('Fetching books and users...');
        const books = await Book.find({});
        const users = await User.find({});

        if (books.length === 0 || users.length === 0) {
            console.log('No books or users found. Cannot seed orders.');
            process.exit();
        }

        const orders = [];
        const statuses = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];

        // Generate 50 mock orders over last 30 days
        for (let i = 0; i < 50; i++) {
            const randomBook = books[Math.floor(Math.random() * books.length)];
            const randomUser = users[Math.floor(Math.random() * users.length)];
            const qty = Math.floor(Math.random() * 3) + 1;

            // Random date in last 30 days
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 30));

            const isPaid = Math.random() > 0.2; // 80% paid
            const status = statuses[Math.floor(Math.random() * statuses.length)];

            const order = {
                user: randomUser._id,
                orderItems: [{
                    title: randomBook.title,
                    qty: qty,
                    image: randomBook.coverImage,
                    price: randomBook.price,
                    product: randomBook._id
                }],
                shippingAddress: {
                    address: '123 Test St',
                    city: 'Test City',
                    postalCode: '12345',
                    country: 'India'
                },
                paymentMethod: 'Razorpay',
                itemsPrice: randomBook.price * qty,
                taxPrice: (randomBook.price * qty) * 0.18,
                shippingPrice: 50,
                totalPrice: (randomBook.price * qty) * 1.18 + 50,
                isPaid: isPaid,
                paidAt: isPaid ? date : null,
                isDelivered: status === 'Delivered',
                deliveredAt: status === 'Delivered' ? new Date(date.getTime() + 86400000) : null,
                status: status,
                createdAt: date, // Manually set createdAt for analytics
                updatedAt: date
            };

            orders.push(order);
        }

        await Order.insertMany(orders);
        console.log('Successfully seeded 50 mock orders for analytics!');

        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedAnalytics();
