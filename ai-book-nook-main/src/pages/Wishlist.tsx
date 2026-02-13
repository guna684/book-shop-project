import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/context/WishlistContext';
import { getImageUrl } from '@/utils/imageUrl';
import { useCart } from '@/context/CartContext';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Wishlist = () => {
    const { t } = useTranslation();
    const { wishlist, removeFromWishlist, loading } = useWishlist();
    const { addToCart } = useCart();

    return (
        <Layout>
            <Helmet>
                <title>{t('wishlist.title')} | Sri Chola Book Shop</title>
            </Helmet>

            <div className="bg-secondary/30 py-8 border-b border-border">
                <div className="container mx-auto px-4">
                    <h1 className="font-serif text-3xl font-bold text-foreground flex items-center gap-3">
                        <Heart className="h-8 w-8 text-red-500 fill-current" />
                        {t('wishlist.title')}
                    </h1>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                {loading ? (
                    <div>Loading...</div>
                ) : wishlist.length === 0 ? (
                    <div className="text-center py-20">
                        <Heart className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold mb-4">{t('wishlist.emptyTitle')}</h2>
                        <Link to="/books">
                            <Button>{t('wishlist.browseBooks')}</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {wishlist.map((book) => (
                            <motion.div
                                key={book.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-card border border-border rounded-xl overflow-hidden shadow-sm flex flex-col"
                            >
                                <Link to={`/book/${book.id}`} className="relative aspect-[2/3] overflow-hidden">
                                    <img
                                        src={getImageUrl(book.image_url || book.coverImage)}
                                        alt={book.title}
                                        className="w-full h-full object-cover transition-transform hover:scale-105"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            if (book.image_url && target.src === getImageUrl(book.image_url)) {
                                                target.src = getImageUrl(book.coverImage);
                                            } else if (!target.src.includes('placeholder-book.jpg')) {
                                                target.src = '/images/placeholder-book.jpg';
                                            }
                                        }}
                                    />
                                </Link>
                                <div className="p-4 flex flex-col flex-1">
                                    <Link to={`/book/${book.id}`} className="flex-1">
                                        <h3 className="font-semibold line-clamp-1 hover:text-primary transition-colors">
                                            {book.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground mb-2">{t('common.by')} {book.author} | Sri Chola Book Shop</p>
                                        <p className="font-bold text-lg">₹{book.price}</p>
                                    </Link>
                                    <div className="flex gap-2 mt-4">
                                        <Button
                                            className="flex-1 gap-2"
                                            size="sm"
                                            onClick={() => addToCart(book, 1)}
                                        >
                                            <ShoppingCart className="h-4 w-4" /> {t('common.addToCart')}
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="shrink-0"
                                            onClick={() => removeFromWishlist(book.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Wishlist;
