import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Book from './models/Book.js';

dotenv.config();

const resetReviews = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Update all books to have reviewCount = 0 and clear reviews array
        const result = await Book.updateMany(
            {},
            {
                $set: {
                    reviewCount: 0,
                    reviews: []
                }
            }
        );

        console.log(`✅ Successfully reset reviews for ${result.modifiedCount} books`);
        console.log('All books now have 0 reviews');

        process.exit(0);
    } catch (error) {
        console.error('Error resetting reviews:', error);
        process.exit(1);
    }
};

resetReviews();
