import asyncHandler from 'express-async-handler';
import axios from 'axios';
import Book from '../models/Book.js';

// @desc    Handle chat request and forward to n8n or handle locally
// @route   POST /api/chat
// @access  Private
const handleChat = asyncHandler(async (req, res) => {
    const { chatId, message } = req.body;

    if (!chatId || !message) {
        res.status(400);
        throw new Error('Please provide chatId and message');
    }

    // Enhanced Local Search & URL Request Logic

    // 1. Check if user is asking for URLs/links
    const urlRequestRegex = /(?:give|show|provide|get|send|share|what'?s?\s+the)\s+(?:me\s+)?(?:url|link|website|page|product\s+page)s?\s+(?:for|of|to)?\s*(?:the\s+)?(?:above|these|those|this|that)?/i;
    const isUrlRequest = urlRequestRegex.test(message);

    if (isUrlRequest) {
        // Try to find recently mentioned books or get featured books
        const books = await Book.find({ featured: true }).limit(5);

        if (books.length > 0) {
            const baseUrl = 'https://ai-book-woad.vercel.app';
            const bookLinks = books.map(b =>
                `📚 **${b.title}** by ${b.author}\n   🔗 ${baseUrl}/book/${b._id}`
            ).join('\n\n');

            res.json({
                text: `Here are the URLs for our featured books:\n\n${bookLinks}\n\n✨ Click any link to view the book details!`
            });
            return;
        }
    }

    // 2. Check for book search queries
    const searchRegex = /(?:search|find|looking for|show me)\s+(?:book|books)?\s*(.+)/i;
    const match = message.match(searchRegex);

    if (match && match[1]) {
        const query = match[1].trim();
        const books = await Book.find({
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { author: { $regex: query, $options: 'i' } },
                { category: { $regex: query, $options: 'i' } },
            ]
        }).limit(3);

        if (books.length > 0) {
            const baseUrl = 'https://ai-book-woad.vercel.app';
            const results = books.map(b =>
                `📚 **${b.title}** by ${b.author}\n   💰 ₹${b.price}\n   🔗 ${baseUrl}/book/${b._id}`
            ).join('\n\n');

            res.json({
                text: `Here are some books I found for "${query}":\n\n${results}`
            });
            return;
        } else {
            // If no books found locally, maybe let n8n handle it or just say generic
            // keeping n8n fallback might be better if n8n has broader knowledge
        }
    }

    // Prepare enhanced payload with book inventory context for n8n
    const baseUrl = 'https://ai-book-woad.vercel.app';

    // Get available books to provide context to n8n
    const availableBooks = await Book.find({ stock: { $gt: 0 } })
        .select('title author price category _id description')
        .limit(20);

    const bookContext = availableBooks.map(b => ({
        title: b.title,
        author: b.author,
        price: b.price,
        category: b.category,
        url: `${baseUrl}/book/${b._id}`,
        id: b._id.toString()
    }));

    // Extract session-based context from request
    const { sessionId, orderContext, pageContext, chatHistory } = req.body;

    const payload = {
        chatId: sessionId || chatId,
        sessionId: sessionId || chatId,
        userId: req.user._id,
        message,
        // Add book inventory context
        bookInventory: bookContext,
        websiteUrl: baseUrl,
        // Add user order context if provided
        userOrders: orderContext || null,
        // Add page context
        currentPage: pageContext || 'unknown',
        // Add chat history for context
        chatHistory: chatHistory || [],
        // System instructions for n8n AI
        systemInstructions: {
            storeName: "Sri Chola Book Shop",
            urlFormat: `${baseUrl}/book/{bookId}`,
            rules: [
                "NEVER provide Amazon, Flipkart, or any external bookstore URLs",
                "ALWAYS use Sri Chola Book Shop URLs from the bookInventory provided",
                `Format all book URLs as: ${baseUrl}/book/{bookId}`,
                "Only recommend books from the provided bookInventory",
                "If a book is not in inventory, suggest similar books from inventory",
                "If user order history is provided, use it to give personalized recommendations",
                "Reference past purchases when relevant to build rapport",
                "Suggest reorders or complementary books based on purchase history",
                "Use the current page context to provide relevant assistance"
            ]
        }
    };

    try {
        const webhookUrl = process.env.N8N_WEBHOOK_URL || 'https://sengon8n.app.n8n.cloud/webhook/ai-book';

        // Validate webhook URL
        if (!webhookUrl) {
            console.error('N8N_WEBHOOK_URL is not configured');
            res.json({
                text: "I'm currently unavailable. Please try using the search feature to find books!"
            });
            return;
        }

        console.log('Sending to N8N webhook:', webhookUrl);
        console.log('Payload:', JSON.stringify(payload, null, 2));

        const n8nResponse = await axios.post(
            webhookUrl,
            payload,
            {
                timeout: 30000, // 30 second timeout
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('N8N Response Status:', n8nResponse.status);
        console.log('N8N Response Data:', JSON.stringify(n8nResponse.data, null, 2));

        // Handle various response formats from n8n
        if (typeof n8nResponse.data === 'string') {
            res.json({ text: n8nResponse.data });
        } else if (n8nResponse.data.text || n8nResponse.data.message || n8nResponse.data.output) {
            res.json(n8nResponse.data);
        } else {
            // If response format is unexpected, try to extract meaningful data
            res.json({
                text: n8nResponse.data.response || JSON.stringify(n8nResponse.data)
            });
        }
    } catch (error) {
        console.error('=== N8N ERROR DETAILS ===');

        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Status Code:', error.response.status);
            console.error('Status Text:', error.response.statusText);
            console.error('Response Headers:', error.response.headers);
            console.error('Response Data:', JSON.stringify(error.response.data, null, 2));

            // Provide user-friendly error based on status code
            let userMessage = "I'm having trouble connecting to the AI service. ";

            if (error.response.status === 404) {
                userMessage += "The webhook endpoint was not found. Please check the N8N workflow configuration.";
            } else if (error.response.status === 502 || error.response.status === 503) {
                userMessage += "The AI service is temporarily unavailable. Please try again in a moment.";
            } else if (error.response.status === 500) {
                userMessage += "There was an error processing your request. Please try rephrasing your question.";
            } else {
                userMessage += "Please try again or use the search feature to find books.";
            }

            res.json({
                text: userMessage
            });
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received from N8N');
            console.error('Request details:', error.request);

            res.json({
                text: "I couldn't reach the AI service. Please check your internet connection or try again later. You can also use the search feature to find books!"
            });
        } else {
            // Something happened in setting up the request
            console.error('Error setting up request:', error.message);
            console.error('Error stack:', error.stack);

            res.json({
                text: "An unexpected error occurred. Please try again or use the search feature to find books."
            });
        }

        console.error('=== END N8N ERROR ===');
    }
});

export { handleChat };
