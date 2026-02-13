import PromoCode from '../models/PromoCode.js';
import PromoCodeUsage from '../models/PromoCodeUsage.js';

// @desc    Validate promo code
// @route   POST /api/promo/validate
// @access  Private
export const validatePromoCode = async (req, res) => {
    try {
        const { code, cartTotal } = req.body;
        const userId = req.user._id;

        // Validate input
        if (!code || !cartTotal) {
            return res.status(400).json({
                success: false,
                message: 'Promo code and cart total are required'
            });
        }

        if (cartTotal <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Cart total must be greater than 0'
            });
        }

        // Find promo code (case-insensitive, trimmed)
        const promoCode = await PromoCode.findOne({
            code: code.trim().toUpperCase()
        });

        if (!promoCode) {
            return res.status(404).json({
                success: false,
                message: 'Invalid promo code'
            });
        }

        // Check if active
        if (!promoCode.isActive) {
            return res.status(400).json({
                success: false,
                message: 'This promo code is no longer active'
            });
        }

        // Check expiry
        if (promoCode.expiryDate < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'This promo code has expired'
            });
        }

        // Check global usage limit
        if (promoCode.usedCount >= promoCode.usageLimit) {
            return res.status(400).json({
                success: false,
                message: 'This promo code has reached its usage limit'
            });
        }

        // Check per-user usage limit
        const userUsageCount = await PromoCodeUsage.getUserUsageCount(
            promoCode._id,
            userId
        );

        if (userUsageCount >= promoCode.perUserLimit) {
            return res.status(400).json({
                success: false,
                message: 'You have already used this promo code the maximum number of times'
            });
        }

        // Calculate discount
        const result = promoCode.calculateDiscount(cartTotal);

        if (!result.valid) {
            return res.status(400).json({
                success: false,
                message: result.message
            });
        }

        res.json({
            success: true,
            promoCodeId: promoCode._id,
            code: promoCode.code,
            discount: result.discount,
            finalAmount: result.finalAmount,
            message: result.message
        });

    } catch (error) {
        console.error('Validate promo code error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error validating promo code'
        });
    }
};

// @desc    Get all promo codes (Admin)
// @route   GET /api/promo/admin
// @access  Private/Admin
export const getPromoCodes = async (req, res) => {
    try {
        const promoCodes = await PromoCode.find({})
            .sort({ createdAt: -1 });

        res.json(promoCodes);
    } catch (error) {
        console.error('Get promo codes error:', error);
        res.status(500).json({ message: 'Server error fetching promo codes' });
    }
};

// @desc    Create promo code (Admin)
// @route   POST /api/promo/admin
// @access  Private/Admin
export const createPromoCode = async (req, res) => {
    try {
        const {
            code,
            discountType,
            discountValue,
            minCartValue,
            maxDiscount,
            usageLimit,
            perUserLimit,
            expiryDate,
            isActive
        } = req.body;

        // Check if code already exists
        const existingCode = await PromoCode.findOne({
            code: code.trim().toUpperCase()
        });

        if (existingCode) {
            return res.status(400).json({
                message: 'Promo code already exists'
            });
        }

        const promoCode = await PromoCode.create({
            code: code.trim().toUpperCase(),
            discountType,
            discountValue,
            minCartValue: minCartValue || 0,
            maxDiscount: maxDiscount || null,
            usageLimit,
            perUserLimit: perUserLimit || 1,
            expiryDate,
            isActive: isActive !== undefined ? isActive : true
        });

        res.status(201).json(promoCode);
    } catch (error) {
        console.error('Create promo code error:', error);
        res.status(500).json({ message: error.message || 'Server error creating promo code' });
    }
};

// @desc    Update promo code (Admin)
// @route   PUT /api/promo/admin/:id
// @access  Private/Admin
export const updatePromoCode = async (req, res) => {
    try {
        const promoCode = await PromoCode.findById(req.params.id);

        if (!promoCode) {
            return res.status(404).json({ message: 'Promo code not found' });
        }

        const {
            code,
            discountType,
            discountValue,
            minCartValue,
            maxDiscount,
            usageLimit,
            perUserLimit,
            expiryDate,
            isActive
        } = req.body;

        // If code is being changed, check for duplicates
        if (code && code.trim().toUpperCase() !== promoCode.code) {
            const existingCode = await PromoCode.findOne({
                code: code.trim().toUpperCase()
            });
            if (existingCode) {
                return res.status(400).json({
                    message: 'Promo code already exists'
                });
            }
            promoCode.code = code.trim().toUpperCase();
        }

        if (discountType) promoCode.discountType = discountType;
        if (discountValue !== undefined) promoCode.discountValue = discountValue;
        if (minCartValue !== undefined) promoCode.minCartValue = minCartValue;
        if (maxDiscount !== undefined) promoCode.maxDiscount = maxDiscount;
        if (usageLimit !== undefined) promoCode.usageLimit = usageLimit;
        if (perUserLimit !== undefined) promoCode.perUserLimit = perUserLimit;
        if (expiryDate) promoCode.expiryDate = expiryDate;
        if (isActive !== undefined) promoCode.isActive = isActive;

        const updatedPromoCode = await promoCode.save();

        res.json(updatedPromoCode);
    } catch (error) {
        console.error('Update promo code error:', error);
        res.status(500).json({ message: error.message || 'Server error updating promo code' });
    }
};

// @desc    Delete promo code (Admin)
// @route   DELETE /api/promo/admin/:id
// @access  Private/Admin
export const deletePromoCode = async (req, res) => {
    try {
        const promoCode = await PromoCode.findById(req.params.id);

        if (!promoCode) {
            return res.status(404).json({ message: 'Promo code not found' });
        }

        // Soft delete by deactivating
        promoCode.isActive = false;
        await promoCode.save();

        res.json({ message: 'Promo code deactivated successfully' });
    } catch (error) {
        console.error('Delete promo code error:', error);
        res.status(500).json({ message: 'Server error deleting promo code' });
    }
};

// @desc    Get promo code stats (Admin)
// @route   GET /api/promo/admin/:id/stats
// @access  Private/Admin
export const getPromoCodeStats = async (req, res) => {
    try {
        const promoCode = await PromoCode.findById(req.params.id);

        if (!promoCode) {
            return res.status(404).json({ message: 'Promo code not found' });
        }

        const usages = await PromoCodeUsage.find({ promoCode: promoCode._id })
            .populate('user', 'name email')
            .populate('order', 'totalPrice createdAt')
            .sort({ usedAt: -1 });

        const totalDiscountGiven = usages.reduce((sum, usage) => sum + usage.discountAmount, 0);

        res.json({
            promoCode,
            usages,
            stats: {
                totalUsages: promoCode.usedCount,
                remainingUsages: promoCode.usageLimit - promoCode.usedCount,
                totalDiscountGiven,
                uniqueUsers: new Set(usages.map(u => u.user._id.toString())).size
            }
        });
    } catch (error) {
        console.error('Get promo code stats error:', error);
        res.status(500).json({ message: 'Server error fetching stats' });
    }
};
