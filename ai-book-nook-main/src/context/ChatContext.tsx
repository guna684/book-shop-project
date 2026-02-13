import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import api from '@/lib/axios';

export interface Message {
    id: string;
    sender: 'user' | 'bot';
    text: string;
    timestamp: Date;
}

interface Order {
    _id: string;
    itemsPrice: number;
    shippingPrice: number;
    totalPrice: number;
    isPaid: boolean;
    paidAt: string;
    isDelivered: boolean;
    status: string;
    createdAt: string;
    orderItems: Array<{
        title: string;
        qty: number;
        image: string;
        price: number;
        product: string;
    }>;
}

interface ChatContextType {
    sessionId: string;
    messages: Message[];
    orderContext: Order[] | null;
    currentPage: string;
    isLoading: boolean;
    sendMessage: (text: string) => Promise<void>;
    injectOrderContext: (orders: Order[]) => void;
    updatePageContext: (page: string) => void;
    clearSession: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChatContext must be used within a ChatProvider');
    }
    return context;
};

interface ChatProviderProps {
    children: ReactNode;
}

export const ChatProvider = ({ children }: ChatProviderProps) => {
    const { user } = useAuth();
    const [sessionId, setSessionId] = useState<string>('');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            sender: 'bot',
            text: "Hi! I'm your AI book assistant. Ask me for book recommendations, search for books, or inquire about our collection!",
            timestamp: new Date(),
        },
    ]);
    const [orderContext, setOrderContext] = useState<Order[] | null>(null);
    const [currentPage, setCurrentPage] = useState<string>('home');
    const [isLoading, setIsLoading] = useState(false);

    // Initialize session ID based on user
    useEffect(() => {
        if (user) {
            const newSessionId = `chat_${user._id}`;
            setSessionId(newSessionId);
            loadChatHistory(newSessionId);
        } else {
            // Guest session
            const guestSessionId = `chat_guest_${Date.now()}`;
            setSessionId(guestSessionId);
            loadChatHistory(guestSessionId);
        }
    }, [user]);

    // Load chat history from localStorage
    const loadChatHistory = (sessionId: string) => {
        try {
            const storedHistory = localStorage.getItem(`chat_history_${sessionId}`);
            if (storedHistory) {
                const parsed = JSON.parse(storedHistory);
                // Convert timestamp strings back to Date objects
                const messagesWithDates = parsed.map((msg: any) => ({
                    ...msg,
                    timestamp: new Date(msg.timestamp),
                }));
                setMessages(messagesWithDates);
                console.log('[ChatContext] Loaded chat history:', messagesWithDates.length, 'messages');
            }
        } catch (error) {
            console.error('[ChatContext] Error loading chat history:', error);
        }
    };

    // Save chat history to localStorage
    const saveChatHistory = useCallback((msgs: Message[]) => {
        if (!sessionId) return;
        try {
            localStorage.setItem(`chat_history_${sessionId}`, JSON.stringify(msgs));
            console.log('[ChatContext] Saved chat history:', msgs.length, 'messages');
        } catch (error) {
            console.error('[ChatContext] Error saving chat history:', error);
        }
    }, [sessionId]);

    // Auto-save whenever messages change
    useEffect(() => {
        if (messages.length > 1) { // Don't save just the initial bot message
            saveChatHistory(messages);
        }
    }, [messages, saveChatHistory]);

    // Send message with full context
    const sendMessage = async (text: string) => {
        if (!text.trim()) return;

        if (!user) {
            const errorMsg: Message = {
                id: Date.now().toString(),
                sender: 'bot',
                text: 'Please login to use the AI assistant.',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMsg]);
            return;
        }

        const userMsg: Message = {
            id: Date.now().toString(),
            sender: 'user',
            text: text,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setIsLoading(true);

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            // Build enhanced payload with session and context
            const payload = {
                chatId: sessionId,
                sessionId: sessionId,
                message: text,
                orderContext: orderContext,
                pageContext: currentPage,
                chatHistory: messages.slice(-5).map(m => ({ // Last 5 messages for context
                    role: m.sender === 'user' ? 'user' : 'assistant',
                    content: m.text
                }))
            };

            console.log('[ChatContext] Sending message with context:', {
                sessionId,
                pageContext: currentPage,
                hasOrderContext: !!orderContext,
                orderCount: orderContext?.length || 0,
                historyLength: payload.chatHistory.length
            });

            const response = await api.post('/api/chat', payload, config);

            // Handle various n8n response formats
            let botText = "I received your message but couldn't parse the response.";
            if (typeof response.data === 'string') {
                botText = response.data;
            } else if (response.data.text) {
                botText = response.data.text;
            } else if (response.data.message) {
                botText = response.data.message;
            } else if (response.data.output) {
                botText = response.data.output;
            } else {
                botText = JSON.stringify(response.data);
            }

            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                sender: 'bot',
                text: botText,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, botMsg]);

        } catch (error) {
            console.error('[ChatContext] Chat Error:', error);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                sender: 'bot',
                text: "Sorry, I'm having trouble connecting to the server right now.",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    // Inject order context
    const injectOrderContext = (orders: Order[]) => {
        setOrderContext(orders);
        console.log('[ChatContext] Injected order context:', orders.length, 'orders');
    };

    // Update page context
    const updatePageContext = (page: string) => {
        setCurrentPage(page);
        console.log('[ChatContext] Updated page context:', page);
    };

    // Clear session
    const clearSession = () => {
        setMessages([
            {
                id: '1',
                sender: 'bot',
                text: "Hi! I'm your AI book assistant. Ask me for book recommendations, search for books, or inquire about our collection!",
                timestamp: new Date(),
            },
        ]);
        setOrderContext(null);
        setCurrentPage('home');
        if (sessionId) {
            localStorage.removeItem(`chat_history_${sessionId}`);
        }
        console.log('[ChatContext] Cleared session');
    };

    const value: ChatContextType = {
        sessionId,
        messages,
        orderContext,
        currentPage,
        isLoading,
        sendMessage,
        injectOrderContext,
        updatePageContext,
        clearSession,
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
