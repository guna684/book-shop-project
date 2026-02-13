import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, User, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatContext } from '@/context/ChatContext';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    // Use global chat context
    const { messages, isLoading, sendMessage } = useChatContext();

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const messageText = inputValue;
        setInputValue('');
        await sendMessage(messageText);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="mb-4 bg-card border border-border shadow-2xl rounded-2xl w-[350px] sm:w-[380px] overflow-hidden flex flex-col h-[500px]"
                    >
                        {/* Header */}
                        <div className="bg-primary/10 p-4 flex justify-between items-center border-b border-border">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-primary/20 rounded-full">
                                    <Sparkles className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm">AI Assistant</h3>
                                    <p className="text-xs text-muted-foreground">Online</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Messages */}
                        <ScrollArea className="flex-1 p-4 bg-secondary/5">
                            <div className="space-y-4">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                                    >
                                        <div className={`
                      h-8 w-8 rounded-full flex items-center justify-center shrink-0
                      ${msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}
                    `}>
                                            {msg.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                                        </div>
                                        <div className={`
                      p-3 rounded-lg text-sm max-w-[80%] whitespace-pre-wrap
                      ${msg.sender === 'user'
                                                ? 'bg-primary text-primary-foreground rounded-tr-none'
                                                : 'bg-card border border-border rounded-tl-none shadow-sm'}
                    `}>
                                            {msg.text.split('\n').map((line, i) => (
                                                <span key={i}>
                                                    {line.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\))/g).map((part, j) => {
                                                        if (part.startsWith('**') && part.endsWith('**')) {
                                                            return <strong key={j}>{part.slice(2, -2)}</strong>;
                                                        } else if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
                                                            const match = part.match(/\[(.*?)\]\((.*?)\)/);
                                                            if (match) {
                                                                return (
                                                                    <a
                                                                        key={j}
                                                                        href={match[2]}
                                                                        className="text-blue-500 underline hover:text-blue-700"
                                                                        onClick={(e) => {
                                                                            // If internal link, you might want to use navigate(), but standard <a> works fine for now
                                                                        }}
                                                                    >
                                                                        {match[1]}
                                                                    </a>
                                                                );
                                                            }
                                                        }
                                                        return part;
                                                    })}
                                                    <br />
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                <div ref={scrollRef} />
                            </div>
                        </ScrollArea>

                        {/* Input */}
                        <form onSubmit={handleSend} className="p-4 bg-card border-t border-border mt-auto">
                            <div className="flex gap-2">
                                <Input
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Ask for book recommendations..."
                                    disabled={isLoading}
                                    className="bg-secondary/50"
                                    autoFocus
                                />
                                <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim()} className="shrink-0 bg-primary hover:bg-primary/90">
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <Button
                onClick={() => setIsOpen(!isOpen)}
                size="lg"
                className="h-14 w-14 rounded-full shadow-xl bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white p-0 flex items-center justify-center"
            >
                {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
            </Button>
        </div>
    );
};
export default ChatWidget;
