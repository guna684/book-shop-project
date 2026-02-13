import express from 'express';
const router = express.Router();
import {
    getBooks,
    getBookById,
    deleteBook,
    updateBook,
    createBook,
    createProductReview
} from '../controllers/bookController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.route('/').get(getBooks).post(protect, admin, createBook);
router.route('/:id/reviews').post(protect, createProductReview);
router
    .route('/:id')
    .get(getBookById)
    .delete(protect, admin, deleteBook)
    .put(protect, admin, updateBook);

export default router;
