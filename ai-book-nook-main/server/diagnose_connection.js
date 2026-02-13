import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Replicate server startup environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env from the server directory
const envPath = path.join(__dirname, '.env');
dotenv.config({ path: envPath });

const diagnose = async () => {
    console.log('--- Diagnostic Start ---');
    console.log(`Loading .env from: ${envPath}`);

    const uri = process.env.MONGO_URI;
    if (!uri) {
        console.error('CRITICAL: MONGO_URI is undefined in process.env');
        console.log('Environment variables loaded:', Object.keys(process.env));
        process.exit(1);
    }

    // Mask password for safe logging
    const maskedUri = uri.replace(/:([^:@]+)@/, ':****@');
    console.log(`MONGO_URI found: ${maskedUri}`);

    try {
        console.log('Attempting mongoose.connect()...');
        const conn = await mongoose.connect(uri);
        console.log('✅ Connection SUCCESS!');
        console.log(`Host: ${conn.connection.host}`);
        console.log(`Database: ${conn.connection.db.databaseName}`);

        // Check for data safely
        const collections = await conn.connection.db.listCollections().toArray();
        console.log(`Collections found: ${collections.length}`);
        collections.forEach(c => console.log(` - ${c.name}`));

    } catch (error) {
        console.error('❌ Connection FAILED');
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
        if (error.cause) console.error('Cause:', error.cause);
    } finally {
        console.log('--- Diagnostic End ---');
        // Close connection if open, then exit
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
        process.exit(0);
    }
};

diagnose();
