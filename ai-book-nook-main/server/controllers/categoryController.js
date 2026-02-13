import asyncHandler from 'express-async-handler';
import Category from '../models/Category.js';
import Book from '../models/Book.js';

// @desc    Get all categories with dynamic book counts
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
    // Get all categories
    const categories = await Category.find({}).lean();

    // Compute book counts dynamically for each category
    const categoriesWithCounts = await Promise.all(
        categories.map(async (category) => {
            // Count books in this category with stock > 0
            const bookCount = await Book.countDocuments({
                category: category.name,
                stock: { $gt: 0 }
            });

            return {
                ...category,
                bookCount
            };
        })
    );

    res.json(categoriesWithCounts);
});

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
    const { name, slug, icon, description } = req.body;

    const categoryExists = await Category.findOne({ name });

    if (categoryExists) {
        res.status(400);
        throw new Error('Category already exists');
    }

    const category = await Category.create({
        name,
        slug,
        icon: icon || '📚',
        description
        // bookCount is computed dynamically, not stored
    });

    if (category) {
        res.status(201).json(category);
    } else {
        res.status(400);
        throw new Error('Invalid category data');
    }
});

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);

    if (category) {
        await category.deleteOne();
        res.json({ message: 'Category removed' });
    } else {
        res.status(404);
        throw new Error('Category not found');
    }
});

export { getCategories, createCategory, deleteCategory };
