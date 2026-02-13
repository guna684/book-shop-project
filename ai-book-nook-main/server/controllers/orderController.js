import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Book from '../models/Book.js';
import sendEmail from '../utils/sendEmail.js';
import { generateInvoiceTemplate } from '../utils/invoiceTemplate.js';
import PromoCode from '../models/PromoCode.js';
import PromoCodeUsage from '../models/PromoCodeUsage.js';
import { getDeliveredDateRangeFilter } from '../utils/orderFilters.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
    const {
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        promoCodeId,
        discountAmount
    } = req.body;

    if (orderItems && orderItems.length === 0) {
        res.status(400);
        throw new Error('No order items');
    } else {
        // If promo code is provided, re-validate it
        let validatedPromoCode = null;
        let validatedDiscount = 0;

        if (promoCodeId) {
            const promoCode = await PromoCode.findById(promoCodeId);

            if (!promoCode) {
                res.status(400);
                throw new Error('Invalid promo code');
            }

            // Re-validate promo code
            if (!promoCode.isActive) {
                res.status(400);
                throw new Error('Promo code is no longer active');
            }

            if (promoCode.expiryDate < new Date()) {
                res.status(400);
                throw new Error('Promo code has expired');
            }

            if (promoCode.usedCount >= promoCode.usageLimit) {
                res.status(400);
                throw new Error('Promo code usage limit reached');
            }

            // Check user usage
            const userUsageCount = await PromoCodeUsage.getUserUsageCount(
                promoCode._id,
                req.user._id
            );

            if (userUsageCount >= promoCode.perUserLimit) {
                res.status(400);
                throw new Error('You have already used this promo code');
            }

            // Calculate and verify discount
            const discountResult = promoCode.calculateDiscount(itemsPrice + taxPrice + shippingPrice);

            if (!discountResult.valid) {
                res.status(400);
                throw new Error(discountResult.message);
            }

            validatedPromoCode = promoCode;
            validatedDiscount = discountResult.discount;
        }

        // Check stock and deduct
        for (const item of orderItems) {
            const book = await Book.findById(item.product);
            if (!book) {
                res.status(404);
                throw new Error(`Book not found: ${item.title}`);
            }
            if (book.stock < item.qty) {
                res.status(400);
                throw new Error(`Not enough stock for ${item.title}`);
            }
            book.stock -= item.qty;
            await book.save();
        }

        const order = new Order({
            orderItems,
            user: req.user._id,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            promoCode: validatedPromoCode ? validatedPromoCode._id : null,
            discountAmount: validatedDiscount
        });

        const createdOrder = await order.save();

        // If promo code was used, record usage and increment count
        if (validatedPromoCode) {
            // Create usage record
            await PromoCodeUsage.create({
                promoCode: validatedPromoCode._id,
                user: req.user._id,
                order: createdOrder._id,
                discountAmount: validatedDiscount
            });

            // Increment used count
            validatedPromoCode.usedCount += 1;
            await validatedPromoCode.save();
        }

        // Send Email with Invoice
        const invoiceHtml = generateInvoiceTemplate(createdOrder, req.user);

        // Fire and forget, don't await/block response
        sendEmail({
            to: req.user.email,
            subject: `Invoice for Order #${createdOrder._id} - Sri Chola Book Shop`,
            html: invoiceHtml
        }).catch(err => console.error('Failed to send invoice email:', err));

        res.status(201).json(createdOrder);
    }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate(
        'user',
        'name email'
    );

    if (order) {
        res.json(order);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
            id: req.body.id,
            status: req.body.status,
            update_time: req.body.update_time,
            email_address: req.body.email_address,
        };

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id });
    res.json(orders);
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({}).populate('user', 'id name');
    res.json(orders);
});

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
        order.status = 'delivered';

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Get dashboard stats
// @route   GET /api/orders/stats
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;

    // Use shared delivered filter utility - single source of truth
    const deliveredFilter = getDeliveredDateRangeFilter(startDate, endDate, false);

    const orders = await Order.find(deliveredFilter);
    const users = await User.countDocuments({ isAdmin: false }); // All time, not date-filtered
    const books = await Book.countDocuments();

    const totalOrders = orders.length;
    const totalSales = orders.reduce((acc, order) => acc + order.totalPrice, 0);
    const totalPaidOrders = orders.length; // All delivered orders are considered paid

    console.log('📊 Dashboard Stats (using shared filter):');
    console.log('   Filter:', deliveredFilter);
    console.log('   Total Orders:', totalOrders);
    console.log('   Total Sales:', totalSales);

    res.json({
        totalOrders,
        totalSales,
        totalPaidOrders,
        totalUsers: users,
        totalBooks: books
    });
});

// @desc    Cancel order (User)
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
            res.status(401);
            throw new Error('Not authorized to cancel this order');
        }

        if (order.status === 'Shipped' || order.status === 'Delivered' || order.status === 'Cancelled') {
            res.status(400);
            throw new Error(`Cannot cancel order that is ${order.status}`);
        }

        order.status = 'Cancelled';
        // Optional: refund logic here or manual process
        // Optional: restore stock

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        const oldStatus = order.status;
        order.status = req.body.status;

        if (req.body.status === 'Delivered') {
            order.isDelivered = true;
            order.deliveredAt = Date.now();
            // Auto-mark as paid for COD orders when delivered
            order.isPaid = true;
            order.paidAt = Date.now();

            console.log('✅ Order Status Updated to Delivered:');
            console.log('   Order ID:', order._id);
            console.log('   Old Status:', oldStatus);
            console.log('   New Status:', order.status);
            console.log('   isPaid:', order.isPaid);
            console.log('   Total Price:', order.totalPrice);
        }

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

export {
    addOrderItems,
    getOrderById,
    updateOrderToPaid,
    updateOrderToDelivered,
    getMyOrders,
    getOrders,
    getDashboardStats,
    cancelOrder,
    updateOrderStatus
};
