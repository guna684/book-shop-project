import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly point to .env file
dotenv.config({ path: path.join(__dirname, '.env') });

const debugData = async () => {
    try {
        console.log('Trying to connect...');
        // Print partial URI to verify it loaded (hide password)
        const uri = process.env.MONGO_URI || '';
        console.log(`URI loaded: ${uri.substring(0, 15)}...`);

        if (!uri) {
            throw new Error('MONGO_URI is missing in .env');
        }

        const conn = await mongoose.connect(uri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        console.log(`Database Name: ${conn.connection.db.databaseName}`);

        // List all collections
        const collections = await conn.connection.db.listCollections().toArray();
        console.log('--- Collections found ---');
        collections.forEach(col => console.log(` - ${col.name}`));

        // Count specific collections
        const ordersCount = await conn.connection.db.collection('orders').countDocuments();
        const usersCount = await conn.connection.db.collection('users').countDocuments();
        const booksCount = await conn.connection.db.collection('books').countDocuments();

        console.log('--- Raw Counts ---');
        console.log(`orders: ${ordersCount}`);
        console.log(`users: ${usersCount}`);
        console.log(`books: ${booksCount}`);

        // Allow time for logs to flush
        setTimeout(() => process.exit(0), 1000);

    } catch (error) {
        console.error('Connection Error:', error);
        process.exit(1);
    }
};

debugData();
