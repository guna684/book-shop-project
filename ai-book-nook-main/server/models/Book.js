import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    title_ta: { type: String }, // Tamil Title
    author: { type: String, required: true },
    author_ta: { type: String }, // Tamil Author
    description: { type: String, required: true },
    description_ta: { type: String }, // Tamil Description
    price: { type: Number, required: true },
    category: { type: String, required: true },
    category_ta: { type: String }, // Tamil Category
    stock: { type: Number, required: true, default: 0 },
    rating: { type: Number, required: true, default: 0 },
    reviewCount: { type: Number, default: 0 },
    coverImage: { type: String }, // Optional: can use uploaded file, static path, or image_url
    image_url: { type: String }, // Dynamic image URL from database
    originalPrice: { type: Number },
    genre: { type: String },
    isbn: { type: String },
    pages: { type: Number },
    language: { type: String },
    publishedDate: { type: Date },
    featured: { type: Boolean, default: false },
    bestseller: { type: Boolean, default: false },
    reviews: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            name: { type: String },
            rating: { type: Number, required: true },
            comment: { type: String, required: true },
        },
    ],
}, {
    timestamps: true,
});

const Book = mongoose.model('Book', bookSchema);
export default Book;
