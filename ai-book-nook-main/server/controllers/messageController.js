import asyncHandler from 'express-async-handler';
import Message from '../models/Message.js';
import sendEmail from '../utils/sendEmail.js';

// @desc    Create new message
// @route   POST /api/messages
// @access  Public
// @desc    Create new message
// @route   POST /api/messages
// @access  Public
const createMessage = asyncHandler(async (req, res) => {
    const { name, email, subject, message } = req.body;

    const newMessage = await Message.create({
        name,
        email,
        subject,
        message,
    });

    if (newMessage) {
        // Send email notification to admin (using the configured EMAIL_USER)
        try {
            await sendEmail({
                to: process.env.EMAIL_USER, // Send TO the admin/support email
                subject: `New Contact Form Message: ${subject}`,
                html: `You have received a new message from ${name} (<a href="mailto:${email}">${email}</a>):<br><br>${message}`,
            });
        } catch (error) {
            console.error('Error sending email notification:', error);
            // We don't fail the request if email sending fails, but we log it.
        }

        res.status(201).json(newMessage);
    } else {
        res.status(400);
        throw new Error('Invalid message data');
    }
});

// @desc    Get all messages
// @route   GET /api/messages
// @access  Private/Admin
const getMessages = asyncHandler(async (req, res) => {
    const messages = await Message.find({}).sort({ createdAt: -1 });
    res.json(messages);
});

// @desc    Delete message
// @route   DELETE /api/messages/:id
// @access  Private/Admin
const deleteMessage = asyncHandler(async (req, res) => {
    const message = await Message.findById(req.params.id);

    if (message) {
        await Message.deleteOne({ _id: message._id });
        res.json({ message: 'Message removed' });
    } else {
        res.status(404);
        throw new Error('Message not found');
    }
});

// @desc    Mark message as read
// @route   PUT /api/messages/:id/read
// @access  Private/Admin
const markMessageAsRead = asyncHandler(async (req, res) => {
    const message = await Message.findById(req.params.id);

    if (message) {
        message.isRead = true;
        const updatedMessage = await message.save();
        res.json(updatedMessage);
    } else {
        res.status(404);
        throw new Error('Message not found');
    }
});

export { createMessage, getMessages, deleteMessage, markMessageAsRead };
