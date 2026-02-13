import Banner from '../models/Banner.js';

// @desc    Get active banner
// @route   GET /api/banner
// @access  Public
export const getActiveBanner = async (req, res) => {
    try {
        // We only need one settings document, so we can just find the most recently updated one or a specific singular one
        // For simplicity, we'll strive to keep only one document in the collection or fetch the latest
        const banner = await Banner.findOne({ isActive: true }).sort({ updatedAt: -1 });

        if (banner) {
            res.json(banner);
        } else {
            // Return default structure if no banner config exists
            res.json({
                title: 'Welcome to Sri Chola Book Shop',
                subtitle: 'Discover a world of knowledge and imagination',
                overlayOpacity: 0.1,
                buttons: [
                    { text: 'Start Exploring', link: '/books', variant: 'hero', order: 1, isVisible: true },
                    { text: 'Browse Categories', link: '/categories', variant: 'paper', order: 2, isVisible: true }
                ],
                counters: [
                    { label: 'Books', value: '50K', suffix: '+', isVisible: true },
                    { label: 'Authors', value: '10K', suffix: '+', isVisible: true },
                    { label: 'Readers', value: '500K', suffix: '+', isVisible: true }
                ],
                isActive: true
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all banners (admin) - though we really just manage one 'configuration' usually
// @route   GET /api/banner/admin
// @access  Private/Admin
export const getBannerSettings = async (req, res) => {
    try {
        const banner = await Banner.findOne().sort({ updatedAt: -1 });
        if (banner) {
            res.json(banner);
        } else {
            // Return empty object or default to let frontend handle it, 
            // but returning null/empty allows creating new one
            res.json({});
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create or Update Banner
// @route   POST /api/banner
// @access  Private/Admin
export const updateBanner = async (req, res) => {
    try {
        const {
            title,
            subtitle,
            imageUrl,
            overlayOpacity,
            buttons,
            counters,
            isActive
        } = req.body;

        // Check if a banner document already exists
        let banner = await Banner.findOne().sort({ updatedAt: -1 });

        if (banner) {
            banner.title = title || banner.title;
            banner.subtitle = subtitle || banner.subtitle;
            banner.imageUrl = imageUrl !== undefined ? imageUrl : banner.imageUrl;
            banner.overlayOpacity = overlayOpacity !== undefined ? overlayOpacity : banner.overlayOpacity;
            banner.buttons = buttons || banner.buttons;
            banner.counters = counters || banner.counters;
            banner.isActive = isActive !== undefined ? isActive : banner.isActive;

            const updatedBanner = await banner.save();
            res.json(updatedBanner);
        } else {
            const newBanner = new Banner({
                title,
                subtitle,
                imageUrl,
                overlayOpacity,
                buttons,
                counters,
                isActive
            });

            const createdBanner = await newBanner.save();
            res.status(201).json(createdBanner);
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
