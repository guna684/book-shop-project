import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BookCard from '@/components/books/BookCard';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
import { Book } from '@/types/book';

const FeaturedBooks = () => {
  const { t } = useTranslation();
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const { data } = await api.get('/api/books?featured=true');
        // Map _id and slice
        const books = data.map((b: any) => ({ ...b, id: b._id })).slice(0, 4);
        setFeaturedBooks(books);
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
              <Flame className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium text-accent uppercase tracking-wider">
                {t('featured.handpicked')}
              </span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
              {t('featured.title')}
            </h2>
            <p className="text-muted-foreground mt-2 max-w-lg">
              {t('featured.description')}
            </p>
          </div>
          <Link to="/books?filter=featured">
            <Button variant="outline" className="group">
              {t('featured.viewAll')}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </motion.div>

        {/* Books Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredBooks.map((book, index) => (
            <BookCard key={book.id} book={book} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedBooks;
