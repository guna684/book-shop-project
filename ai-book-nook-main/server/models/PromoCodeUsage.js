import mongoose from 'mongoose';

const promoCodeUsageSchema = new mongoose.Schema({
    promoCode: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PromoCode',
        required: true,
        index: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    discountAmount: {
        type: Number,
        required: true,
        min: 0
    },
    usedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Compound index for efficient user usage queries
promoCodeUsageSchema.index({ promoCode: 1, user: 1 });

// Static method to get user usage count for a promo code
promoCodeUsageSchema.statics.getUserUsageCount = async function (promoCodeId, userId) {
    return await this.countDocuments({
        promoCode: promoCodeId,
        user: userId
    });
};

const PromoCodeUsage = mongoose.model('PromoCodeUsage', promoCodeUsageSchema);

export default PromoCodeUsage;
