import express from 'express';
const router = express.Router();
import { authUser, registerUser, getUserProfile, updateUserProfile, getWishlist, addToWishlist, removeFromWishlist, forgotPassword, verifyOTP, resetPassword, getUsers, deleteUser, getUserById, updateUser, checkUserExists } from '../controllers/userController.js';

import { protect, admin } from '../middleware/authMiddleware.js';

router.post('/login', authUser);
router.post('/', registerUser);
router.post('/check-email', checkUserExists);
router.post('/forgotpassword', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.put('/resetpassword/:resetToken', resetPassword);
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);
router.route('/wishlist').get(protect, getWishlist).post(protect, addToWishlist);
router.route('/wishlist/:id').delete(protect, removeFromWishlist);

router.route('/').get(protect, admin, getUsers);
router
    .route('/:id')
    .delete(protect, admin, deleteUser)
    .get(protect, admin, getUserById)
    .put(protect, admin, updateUser);

export default router;
