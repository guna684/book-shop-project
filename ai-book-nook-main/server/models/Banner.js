import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        default: 'Welcome to Sri Chola Book Shop'
    },
    subtitle: {
        type: String,
        required: true,
        default: 'Discover a world of knowledge and imagination'
    },
    imageUrl: {
        type: String,
        required: false,
    },
    overlayOpacity: {
        type: Number,
        default: 0.1,
        min: 0,
        max: 1
    },
    buttons: [{
        text: { type: String, required: true },
        link: { type: String, required: true },
        variant: { type: String, default: 'primary' }, // 'primary' | 'outline' | 'hero' | 'paper'
        order: { type: Number, default: 0 },
        isVisible: { type: Boolean, default: true }
    }],
    counters: [{
        label: { type: String, required: true }, // 'Books', 'Authors', 'Readers'
        value: { type: String, required: true },
        suffix: { type: String, default: '+' },
        isVisible: { type: Boolean, default: true }
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const Banner = mongoose.model('Banner', bannerSchema);

export default Banner;
