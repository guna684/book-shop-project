import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './models/Order.js';
import Book from './models/Book.js';
import User from './models/User.js';

dotenv.config();

const createSampleOrders = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Get some books and a user
        const books = await Book.find().limit(15);
        const user = await User.findOne({ isAdmin: false });

        if (!user) {
            console.log('No user found. Please run seed.js first to create users.');
            process.exit(1);
        }

        if (books.length === 0) {
            console.log('No books found. Please run seed.js first to create books.');
            process.exit(1);
        }

        console.log(`Found ${books.length} books and user: ${user.name}`);

        // Delete existing orders to start fresh (optional)
        // await Order.deleteMany({});
        // console.log('Cleared existing orders');

        // Create sample orders over the last 6 months
        const sampleOrders = [];
        const now = new Date();

        // Create 30 sample orders
        for (let i = 0; i < 30; i++) {
            // Random date within last 6 months
            const daysAgo = Math.floor(Math.random() * 180);
            const orderDate = new Date(now);
            orderDate.setDate(orderDate.getDate() - daysAgo);

            // Random number of items (1-4)
            const numItems = Math.floor(Math.random() * 4) + 1;
            const orderItems = [];
            let itemsPrice = 0;

            for (let j = 0; j < numItems; j++) {
                const randomBook = books[Math.floor(Math.random() * books.length)];
                const qty = Math.floor(Math.random() * 3) + 1;
                const price = randomBook.price;

                orderItems.push({
                    title: randomBook.title,
                    qty: qty,
                    image: randomBook.coverImage,
                    price: price,
                    product: randomBook._id
                });

                itemsPrice += price * qty;
            }

            const shippingPrice = itemsPrice > 500 ? 0 : 50;
            const taxPrice = itemsPrice * 0.18; // 18% GST
            const totalPrice = itemsPrice + shippingPrice + taxPrice;

            const order = {
                user: user._id,
                orderItems: orderItems,
                shippingAddress: {
                    address: '123 Main Street',
                    city: 'Chennai',
                    postalCode: '600001',
                    country: 'India'
                },
                paymentMethod: 'Cash on Delivery',
                itemsPrice: itemsPrice,
                taxPrice: taxPrice,
                shippingPrice: shippingPrice,
                totalPrice: totalPrice,
                isPaid: true, // Mark as paid so it shows in analytics
                paidAt: orderDate,
                isDelivered: Math.random() > 0.3, // 70% delivered
                deliveredAt: Math.random() > 0.3 ? orderDate : null,
                status: Math.random() > 0.3 ? 'Delivered' : 'Processing',
                createdAt: orderDate,
                updatedAt: orderDate
            };

            sampleOrders.push(order);
        }

        // Insert all orders
        await Order.insertMany(sampleOrders);
        console.log(`✅ Created ${sampleOrders.length} sample orders`);

        // Show summary
        const totalOrders = await Order.countDocuments();
        const paidOrders = await Order.countDocuments({ isPaid: true });
        const totalRevenue = await Order.aggregate([
            { $match: { isPaid: true } },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]);

        console.log('\n📊 Database Summary:');
        console.log(`Total Orders: ${totalOrders}`);
        console.log(`Paid Orders: ${paidOrders}`);
        console.log(`Total Revenue: ₹${totalRevenue[0]?.total.toFixed(2) || 0}`);

        mongoose.connection.close();
        console.log('\n✅ Sample data created successfully!');
        console.log('🔄 Refresh your admin dashboard to see the analytics charts populated with data.');
    } catch (error) {
        console.error('Error creating sample orders:', error);
        process.exit(1);
    }
};

createSampleOrders();
