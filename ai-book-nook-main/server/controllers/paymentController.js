import Razorpay from 'razorpay';
import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import dotenv from 'dotenv';
dotenv.config();

// Initialize Razorpay instance
let razorpayInstance = null;

const initializeRazorpay = () => {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        console.warn('⚠️ Razorpay credentials not configured. Payment features will be disabled.');
        return null;
    }

    if (!razorpayInstance) {
        razorpayInstance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });
        console.log('✅ Razorpay SDK initialized successfully');
    }

    return razorpayInstance;
};

// @desc    Generate Razorpay Order
// @route   POST /api/payment/create-session
// @access  Private
const createPaymentSession = asyncHandler(async (req, res) => {
    const { orderId } = req.body;
    const order = await Order.findById(orderId).populate('user');

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    // Initialize Razorpay
    const razorpay = initializeRazorpay();
    if (!razorpay) {
        res.status(503);
        throw new Error('Payment service not configured');
    }

    try {
        const options = {
            amount: Math.round(order.totalPrice * 100), // Amount in paise
            currency: "INR",
            receipt: order._id.toString(),
            payment_capture: 1
        };

        console.log('📝 Creating Razorpay order:', {
            orderId: order._id,
            amount: options.amount,
            currency: options.currency
        });

        // Create order using Razorpay SDK
        const razorpayOrder = await razorpay.orders.create(options);

        console.log('✅ Razorpay order created:', razorpayOrder.id);

        res.json({
            order_id: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key: process.env.RAZORPAY_KEY_ID
        });

    } catch (error) {
        console.error('❌ Razorpay order creation failed:', error.error || error.message);
        res.status(500);
        throw new Error(error.error?.description || 'Razorpay order creation failed');
    }
});

// @desc    Verify Payment Status
// @route   POST /api/payment/verify
// @access  Private
const verifyPayment = asyncHandler(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    if (!process.env.RAZORPAY_KEY_SECRET) {
        res.status(503);
        throw new Error('Payment verification service not configured');
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

    console.log('🔐 Payment Verification:', {
        orderId,
        razorpay_order_id,
        razorpay_payment_id,
        signatureMatch: expectedSignature === razorpay_signature
    });

    if (expectedSignature === razorpay_signature) {
        // Use findByIdAndUpdate for atomic robust update
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            {
                isPaid: true,
                paidAt: Date.now(),
                paymentResult: {
                    id: razorpay_payment_id,
                    status: 'success',
                    update_time: Date.now().toString(),
                    email_address: ""
                }
            },
            { new: true } // Return the updated doc
        );

        if (updatedOrder) {
            console.log(`✅ Payment verified successfully for Order ${orderId}`);
            res.json({ message: "Payment Verified", verified: true });
        } else {
            console.error(`❌ Order not found during update: ${orderId}`);
            res.status(404);
            throw new Error("Order not found");
        }
    } else {
        console.error('❌ Payment verification failed: Signature mismatch');
        res.status(400);
        throw new Error("Invalid signature");
    }
});

export { createPaymentSession, verifyPayment };
