import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { Book } from '@/types/book';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { Badge } from '@/components/ui/badge';

import { useTranslation } from 'react-i18next';
import { getLocalized } from '@/utils/localization';
import { getImageUrl } from '@/utils/imageUrl';

interface BookCardProps {
  book: Book;
  index?: number;
}

const BookCard = ({ book, index = 0 }: BookCardProps) => {
  const { i18n } = useTranslation();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const discount = book.originalPrice
    ? Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="group relative bg-card rounded-xl overflow-hidden shadow-soft hover:shadow-card transition-all duration-300"
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        {book.bestseller && (
          <Badge className="bg-accent text-accent-foreground">
            Bestseller
          </Badge>
        )}
        {discount > 0 && (
          <Badge className="bg-primary text-primary-foreground">
            {discount}% OFF
          </Badge>
        )}
      </div>

      {/* Wishlist Button */}
      {/* Wishlist Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation(); // Prevent navigating to book details
          if (isInWishlist(book.id)) {
            removeFromWishlist(book.id);
          } else {
            addToWishlist(book);
          }
        }}
        className={`absolute top-3 right-3 z-10 h-8 w-8 rounded-full backdrop-blur-sm flex items-center justify-center transition-all duration-300 ${isInWishlist(book.id)
          ? 'bg-red-50 text-red-500 opacity-100'
          : 'bg-card/80 opacity-0 group-hover:opacity-100 hover:bg-card hover:text-accent'
          }`}
      >
        <Heart className={`h-4 w-4 ${isInWishlist(book.id) ? 'fill-current' : ''}`} />
      </button>

      {/* Cover Image */}
      <Link to={`/book/${book.id}`} className="block relative overflow-hidden aspect-[3/4]">
        <img
          src={getImageUrl(book.image_url || book.coverImage)}
          alt={getLocalized(book, 'title', i18n.language)}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            // Fallback logic
            const target = e.target as HTMLImageElement;
            if (book.image_url && target.src === getImageUrl(book.image_url)) {
              // If image_url failed, try coverImage
              target.src = getImageUrl(book.coverImage);
            } else if (!target.src.includes('placeholder-book.jpg')) {
              // Final fallback to placeholder
              target.src = '/images/placeholder-book.jpg';
            }
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </Link>

      {/* Content */}
      <div className="p-4">
        <div className="mb-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            {getLocalized(book, 'category', i18n.language)}
          </span>
        </div>

        <Link to={`/book/${book.id}`}>
          <h3 className="font-serif font-semibold text-foreground line-clamp-1 hover:text-primary transition-colors">
            {getLocalized(book, 'title', i18n.language)} | Sri Chola Book Shop
          </h3>
        </Link>

        <p className="text-sm text-muted-foreground mt-1">
          by {getLocalized(book, 'author', i18n.language)}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-2">
          <Star className="h-4 w-4 fill-primary text-primary" />
          <span className="text-sm font-medium">{book.rating}</span>
          <span className="text-xs text-muted-foreground">
            ({book.reviewCount.toLocaleString()})
          </span>
        </div>

        {/* Price & Cart */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-foreground">
              ₹{book.price}
            </span>
            {book.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ₹{book.originalPrice}
              </span>
            )}
          </div>
          <Button
            variant="gold"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              addToCart(book);
            }}
            className="gap-1"
          >
            <ShoppingCart className="h-4 w-4" />
            Add
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default BookCard;
