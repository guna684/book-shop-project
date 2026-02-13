import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import { Book } from '@/types/book';

interface WishlistContextType {
    wishlist: Book[];
    addToWishlist: (book: Book) => Promise<void>;
    removeFromWishlist: (bookId: string) => Promise<void>;
    isInWishlist: (bookId: string) => boolean;
    loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [wishlist, setWishlist] = useState<Book[]>([]);
    const [loading, setLoading] = useState(false);
    const { user, logout } = useAuth();

    useEffect(() => {
        if (user) {
            fetchWishlist();
        } else {
            setWishlist([]);
        }
    }, [user]);

    const fetchWishlist = async () => {
        setLoading(true);
        try {
            const config = {
                headers: { Authorization: `Bearer ${user?.token}` },
            };
            const { data } = await api.get('/api/users/wishlist', config);

            // Map _id to id if necessary
            const mappedWishlist = data.map((item: any) => ({
                ...item,
                id: item._id
            }));

            setWishlist(mappedWishlist);
        } catch (error: any) {
            console.error('Failed to fetch wishlist');
            if (error.response?.status === 401) {
                // Token is invalid/expired
                logout();
            }
        } finally {
            setLoading(false);
        }
    };

    const addToWishlist = async (book: Book) => {
        if (!user) {
            toast.error('Please login to add to wishlist');
            return;
        }

        if (isInWishlist(book.id)) {
            toast.info('Already in wishlist');
            return;
        }

        try {
            const config = {
                headers: { Authorization: `Bearer ${user?.token}` },
            };
            await api.post('/api/users/wishlist', { bookId: book.id }, config);
            setWishlist([...wishlist, book]);
            toast.success('Added to wishlist');
        } catch (error) {
            toast.error('Failed to add to wishlist');
        }
    };

    const removeFromWishlist = async (bookId: string) => {
        if (!user) return;

        try {
            const config = {
                headers: { Authorization: `Bearer ${user?.token}` },
            };
            await api.delete(`/api/users/wishlist/${bookId}`, config);
            setWishlist(wishlist.filter((item) => item.id !== bookId));
            toast.success('Removed from wishlist');
        } catch (error) {
            toast.error('Failed to remove from wishlist');
        }
    };

    const isInWishlist = (bookId: string) => {
        return wishlist.some((item) => item.id === bookId);
    };

    return (
        <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist, loading }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};
