import asyncHandler from 'express-async-handler';
import Offer from '../models/Offer.js';

// @desc    Validate offer code
// @route   POST /api/offers/validate
// @access  Private
const validateOffer = asyncHandler(async (req, res) => {
    const { code } = req.body;

    const offer = await Offer.findOne({ code: code.toUpperCase() });

    if (offer && offer.isActive) {
        if (new Date() > offer.expirationDate) {
            res.status(400);
            throw new Error('Offer has expired');
        }
        res.json({
            code: offer.code,
            discountPercentage: offer.discountPercentage,
            description: offer.description
        });
    } else {
        res.status(404);
        throw new Error('Invalid or inactive offer code');
    }
});

// @desc    Create new offer
// @route   POST /api/offers
// @access  Private/Admin
const createOffer = asyncHandler(async (req, res) => {
    const { code, discountPercentage, expirationDate, description } = req.body;

    const offerExists = await Offer.findOne({ code });

    if (offerExists) {
        res.status(400);
        throw new Error('Offer code already exists');
    }

    const offer = await Offer.create({
        code,
        discountPercentage,
        expirationDate,
        description
    });

    if (offer) {
        res.status(201).json(offer);
    } else {
        res.status(400);
        throw new Error('Invalid offer data');
    }
});

// @desc    Get all offers
// @route   GET /api/offers
// @access  Private/Admin
const getOffers = asyncHandler(async (req, res) => {
    const offers = await Offer.find({});
    res.json(offers);
});

export { validateOffer, createOffer, getOffers };
