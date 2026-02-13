import express from 'express';
const router = express.Router();
import upload from '../middleware/upload.js';
import { protect, admin } from '../middleware/authMiddleware.js';

// @desc    Upload book image
// @route   POST /api/upload/book-image
// @access  Private/Admin
router.post('/book-image', protect, admin, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            res.status(400);
            throw new Error('No file uploaded');
        }

        // Return the file path relative to the server
        const filePath = `/uploads/books/${req.file.filename}`;

        res.json({
            message: 'Image uploaded successfully',
            filePath: filePath
        });
    } catch (error) {
        res.status(400).json({
            message: error.message || 'File upload failed'
        });
    }
});

export default router;
