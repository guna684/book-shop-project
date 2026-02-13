import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Trophy, Star, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getLocalized } from '@/utils/localization';
import { getImageUrl } from '@/utils/imageUrl';
import api from '@/lib/axios';
import { Book } from '@/types/book';

const BestsellerSection = () => {
  const { t, i18n } = useTranslation();
  const [bestsellers, setBestsellers] = useState<Book[]>([]);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const { data } = await api.get('/api/books?bestseller=true');
        // Map _id and slice
        const books = data.map((b: any) => ({ ...b, id: b._id })).slice(0, 5);
        setBestsellers(books);
      } catch (error) {
        console.error(error);
      }
    };
    fetchBooks();
  }, []);

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12"
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-primary uppercase tracking-wider">
                {t('bestsellers.mostPopular')}
              </span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
              {t('bestsellers.title')}
            </h2>
            <p className="text-muted-foreground mt-2 max-w-lg">
              {t('bestsellers.description')}
            </p>
          </div>
          <Link to="/books?filter=bestseller">
            <Button variant="outline" className="group">
              {t('bestsellers.viewAll')}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </motion.div>

        {/* Bestsellers List */}
        <div className="space-y-4">
          {bestsellers.map((book, index) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group bg-card rounded-xl p-4 md:p-6 shadow-soft hover:shadow-card transition-all duration-300 flex items-center gap-4 md:gap-6"
            >
              {/* Rank */}
              <div className="shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="font-serif text-xl font-bold text-primary">
                  #{index + 1}
                </span>
              </div>

              {/* Cover */}
              <Link to={`/book/${book.id}`} className="shrink-0">
                <img
                  src={getImageUrl(book.image_url || book.coverImage)}
                  alt={getLocalized(book, 'title', i18n.language)}
                  className="w-16 h-24 md:w-20 md:h-28 object-cover rounded-lg shadow-soft group-hover:shadow-card transition-shadow"
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

              {/* Info */}
              <div className="flex-1 min-w-0">
                <Link to={`/book/${book.id}`}>
                  <h3 className="font-serif text-lg md:text-xl font-semibold text-foreground truncate hover:text-primary transition-colors">
                    {getLocalized(book, 'title', i18n.language)} | Sri Chola Book Shop
                  </h3>
                </Link>
                <p className="text-sm text-muted-foreground">{t('common.by')} {getLocalized(book, 'author', i18n.language)}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  <span className="text-sm font-medium">{book.rating}</span>
                  <span className="text-xs text-muted-foreground">
                    ({book.reviewCount.toLocaleString()} {t('bestsellers.reviews')})
                  </span>
                </div>
              </div>

              {/* Price & Action */}
              <div className="shrink-0 text-right">
                <div className="text-xl md:text-2xl font-bold text-foreground">
                  ₹{book.price}
                </div>
                {book.originalPrice && (
                  <div className="text-sm text-muted-foreground line-through">
                    ₹{book.originalPrice}
                  </div>
                )}
                <Button
                  variant="gold"
                  size="sm"
                  onClick={() => addToCart(book)}
                  className="mt-2 gap-1"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span className="hidden md:inline">{t('common.addToCart')}</span>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BestsellerSection;
