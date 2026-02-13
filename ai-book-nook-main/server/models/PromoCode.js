import mongoose from 'mongoose';

const promoCodeSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Promo code is required'],
        unique: true,
        uppercase: true,
        trim: true,
        index: true
    },
    discountType: {
        type: String,
        required: [true, 'Discount type is required'],
        enum: ['PERCENT', 'FLAT'],
        default: 'PERCENT'
    },
    discountValue: {
        type: Number,
        required: [true, 'Discount value is required'],
        min: [0, 'Discount value must be positive']
    },
    minCartValue: {
        type: Number,
        default: 0,
        min: [0, 'Minimum cart value must be positive']
    },
    maxDiscount: {
        type: Number,
        default: null,
        min: [0, 'Maximum discount must be positive']
    },
    usageLimit: {
        type: Number,
        required: [true, 'Usage limit is required'],
        min: [1, 'Usage limit must be at least 1']
    },
    usedCount: {
        type: Number,
        default: 0,
        min: [0, 'Used count cannot be negative']
    },
    perUserLimit: {
        type: Number,
        default: 1,
        min: [1, 'Per user limit must be at least 1']
    },
    expiryDate: {
        type: Date,
        required: [true, 'Expiry date is required']
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for efficient queries
promoCodeSchema.index({ code: 1, isActive: 1 });
promoCodeSchema.index({ expiryDate: 1 });

// Method to check if promo code is valid
promoCodeSchema.methods.isValid = function () {
    return this.isActive &&
        this.expiryDate > new Date() &&
        this.usedCount < this.usageLimit;
};

// Method to calculate discount
promoCodeSchema.methods.calculateDiscount = function (cartTotal) {
    if (!this.isValid()) {
        return { valid: false, discount: 0, message: 'Promo code is not valid' };
    }

    if (cartTotal < this.minCartValue) {
        return {
            valid: false,
            discount: 0,
            message: `Minimum cart value of ₹${this.minCartValue} required`
        };
    }

    let discount = 0;

    if (this.discountType === 'PERCENT') {
        discount = (cartTotal * this.discountValue) / 100;
        // Apply max discount cap if exists
        if (this.maxDiscount && discount > this.maxDiscount) {
            discount = this.maxDiscount;
        }
    } else if (this.discountType === 'FLAT') {
        discount = Math.min(this.discountValue, cartTotal);
    }

    const finalAmount = Math.max(0, cartTotal - discount);

    return {
        valid: true,
        discount: Math.round(discount * 100) / 100,
        finalAmount: Math.round(finalAmount * 100) / 100,
        message: 'Promo code applied successfully'
    };
};

const PromoCode = mongoose.model('PromoCode', promoCodeSchema);

export default PromoCode;
