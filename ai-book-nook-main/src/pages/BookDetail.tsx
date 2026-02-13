import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw, Minus, Plus, ChevronLeft } from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';

import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import BookCard from '@/components/books/BookCard';
import { Book } from '@/types/book';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useTranslation, Trans } from 'react-i18next';
import { getLocalized } from '@/utils/localization';
import { getImageUrl } from '@/utils/imageUrl';

const BookDetail = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<ExtendedBook | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [relatedBooks, setRelatedBooks] = useState<Book[]>([]);

  // Review State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loadingReview, setLoadingReview] = useState(false);

  // Extend Book type locally to include reviews if not in main type
  interface Review {
    _id: string;
    name: string;
    rating: number;
    comment: string;
    user: string;
    createdAt: string;
  }

  interface ExtendedBook extends Book {
    reviews?: Review[];
  }

  const submitReviewHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingReview(true);
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
      };
      await api.post(
        `/api/books/${id}/reviews`,
        { rating, comment },
        config
      );
      toast.success(t('bookDetail.reviews.success'));
      setComment('');
      setRating(5);
      // Refetch book to show new review
      const { data } = await api.get(`/api/books/${id}`);
      data.id = data._id;
      setBook(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('bookDetail.reviews.error'));
    } finally {
      setLoadingReview(false);
    }
  };

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const { data } = await api.get(`/api/books/${id}`);
        // Map _id to id
        data.id = data._id;
        setBook(data);

        // Fetch related books
        const relatedRes = await api.get(`/api/books?category=${data.category}`);
        const related = relatedRes.data
          .filter((b: any) => b._id !== data._id)
          .map((b: any) => ({ ...b, id: b._id }))
          .slice(0, 4);
        setRelatedBooks(related);

      } catch (error) {
        console.error('Error fetching book:', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchBook();
  }, [id]);

  if (loading) return <div>Loading...</div>;

  if (!book) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-serif text-3xl font-bold text-foreground mb-4">{t('bookDetail.notFound')}</h1>
          <p className="text-muted-foreground mb-8">{t('bookDetail.notFoundDesc')}</p>
          <Link to="/books">
            <Button>{t('bookDetail.browseAll')}</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const discount = book.originalPrice
    ? Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100)
    : 0;

  return (
    <>
      <Helmet>
        <title>{`${getLocalized(book, 'title', i18n.language)} ${t('common.by')} ${getLocalized(book, 'author', i18n.language)} | Sri Chola Book Shop`}</title>
        <meta name="description" content={getLocalized(book, 'description', i18n.language)} />
      </Helmet>
      <Layout>
        {/* Breadcrumb */}
        <div className="bg-secondary/30 border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-2 text-sm">
              <Link to="/books" className="text-muted-foreground hover:text-foreground flex items-center gap-1">
                <ChevronLeft className="h-4 w-4" />
                {t('bookDetail.backToBooks')}
              </Link>
              <span className="text-muted-foreground">/</span>
              <span className="text-foreground">{getLocalized(book, 'title', i18n.language)}</span>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 lg:py-12">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Book Image */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative"
            >
              <div className="sticky top-24">
                <div className="relative aspect-[3/4] max-w-md mx-auto rounded-xl overflow-hidden shadow-elevated">
                  <img
                    src={getImageUrl(book.image_url || book.coverImage)}
                    alt={getLocalized(book, 'title', i18n.language)}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (book.image_url && target.src === getImageUrl(book.image_url)) {
                        target.src = getImageUrl(book.coverImage);
                      } else if (!target.src.includes('placeholder-book.jpg')) {
                        target.src = '/images/placeholder-book.jpg';
                      }
                    }}
                  />
                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {book.bestseller && (
                      <Badge className="bg-accent text-accent-foreground">{t('bookDetail.bestseller')}</Badge>
                    )}
                    {discount > 0 && (
                      <Badge className="bg-primary text-primary-foreground">{discount}% {t('bookDetail.off')}</Badge>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Book Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Category */}
              <div>
                <Link
                  to={`/books?category=${book.category.toLowerCase()}`}
                  className="text-sm text-primary font-medium uppercase tracking-wider hover:underline"
                >
                  {t(`categories.${book.category.toLowerCase()}`) || getLocalized(book, 'category', i18n.language)}
                </Link>
              </div>

              {/* Title & Author */}
              <div>
                <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">
                  {getLocalized(book, 'title', i18n.language)}
                </h1>
                <p className="text-lg text-muted-foreground">
                  {t('common.by')} <span className="text-foreground font-medium">{getLocalized(book, 'author', i18n.language)}</span>
                </p>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < Math.floor(book.rating)
                        ? 'fill-primary text-primary'
                        : 'text-muted'
                        }`}
                    />
                  ))}
                </div>
                <span className="font-semibold">{book.rating}</span>
                <span className="text-muted-foreground">
                  ({book.reviewCount.toLocaleString()} {t('bestsellers.reviews')})
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl md:text-4xl font-bold text-foreground">
                  ₹{book.price}
                </span>
                {book.originalPrice && (
                  <>
                    <span className="text-xl text-muted-foreground line-through">
                      ₹{book.originalPrice}
                    </span>
                    <Badge variant="outline" className="text-primary border-primary">
                      {t('bookDetail.save')} ₹{book.originalPrice - book.price}
                    </Badge>
                  </>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${book.stock > 10 ? 'bg-green-500' : 'bg-orange-500'}`} />
                <span className="text-sm font-medium">
                  {book.stock > 0 ? (
                    book.stock > 10 ? t('bookDetail.inStock', { count: book.stock }) : t('bookDetail.hurry', { count: book.stock })
                  ) : (
                    <span className="text-destructive">{t('bookDetail.outOfStock')}</span>
                  )}
                </span>
              </div>

              {/* Quantity & Add to Cart */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <div className="flex items-center gap-2 bg-secondary rounded-lg p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={book.stock === 0}
                    className="h-10 w-10 rounded-md hover:bg-card flex items-center justify-center transition-colors disabled:opacity-50"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(book.stock, quantity + 1))}
                    disabled={book.stock === 0 || quantity >= book.stock}
                    className="h-10 w-10 rounded-md hover:bg-card flex items-center justify-center transition-colors disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <Button
                  variant="gold"
                  size="lg"
                  onClick={() => addToCart(book, quantity)}
                  disabled={book.stock === 0}
                  className="flex-1 md:flex-none gap-2"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {book.stock === 0 ? t('bookDetail.outOfStock') : t('common.addToCart')}
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12"
                  onClick={() => {
                    if (isInWishlist(book.id)) {
                      removeFromWishlist(book.id);
                    } else {
                      addToWishlist(book);
                    }
                  }}
                >
                  <Heart className={`h-5 w-5 ${isInWishlist(book.id) ? "fill-red-500 text-red-500" : ""}`} />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12"
                  onClick={async () => {
                    if (navigator.share) {
                      try {
                        await navigator.share({
                          title: book.title,
                          text: `Check out ${book.title} on Sri Chola Book Shop!`,
                          url: window.location.href,
                        });
                      } catch (err) {
                        console.log('Error sharing:', err);
                      }
                    } else {
                      // Fallback for desktop/browsers without native share
                      navigator.clipboard.writeText(window.location.href);
                      toast.success(t('bookDetail.linkCopied'));
                    }
                  }}
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-border">
                {[
                  { icon: Truck, title: t('bookDetail.features.freeDelivery'), desc: t('bookDetail.features.ordersOver') },
                  { icon: Shield, title: t('bookDetail.features.securePayment'), desc: t('bookDetail.features.gateway') },
                  { icon: RotateCcw, title: t('bookDetail.features.easyReturns'), desc: t('bookDetail.features.policy') },
                ].map((feature) => (
                  <div key={feature.title} className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{feature.title}</p>
                      <p className="text-xs text-muted-foreground">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tabs */}
              <Tabs defaultValue="description" className="pt-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="description">{t('bookDetail.tabs.description')}</TabsTrigger>
                  <TabsTrigger value="details">{t('bookDetail.tabs.details')}</TabsTrigger>
                  <TabsTrigger value="reviews">{t('bookDetail.tabs.reviews')}</TabsTrigger>
                </TabsList>
                <TabsContent value="description" className="pt-4">
                  <p className="text-muted-foreground leading-relaxed">
                    {getLocalized(book, 'description', i18n.language)}
                  </p>
                </TabsContent>
                <TabsContent value="details" className="pt-4">
                  <dl className="grid grid-cols-2 gap-4">
                    {[
                      { label: t('bookDetail.details.isbn'), value: book.isbn },
                      { label: t('bookDetail.details.pages'), value: book.pages },
                      { label: t('bookDetail.details.language'), value: t(`data.language.${book.language}`) || book.language },
                      { label: t('bookDetail.details.published'), value: new Date(book.publishedDate).toLocaleDateString() },
                      { label: t('bookDetail.details.category'), value: t(`categories.${book.category.toLowerCase()}`) || book.category },
                      { label: t('bookDetail.details.genre'), value: t(`data.genre.${book.genre}`) || book.genre },
                    ].map((detail) => (
                      <div key={detail.label}>
                        <dt className="text-sm text-muted-foreground">{detail.label}</dt>
                        <dd className="font-medium">{detail.value}</dd>
                      </div>
                    ))}
                  </dl>
                </TabsContent>
                <TabsContent value="reviews" className="pt-4 space-y-8">
                  <div className="space-y-4">
                    <h3 className="font-serif text-lg font-bold">{t('bookDetail.reviews.title')}</h3>
                    {book.reviews && book.reviews.length === 0 ? (
                      <p className="text-muted-foreground">{t('bookDetail.reviews.noReviews')}</p>
                    ) : (
                      book.reviews?.map((review: any) => (
                        <div key={review._id} className="bg-secondary/20 p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold">{review.name}</span>
                            <div className="flex text-yellow-500">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">{review.createdAt?.substring(0, 10)}</p>
                          <p className="text-sm">{review.comment}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {user ? (
                    <div className="bg-card border border-border p-6 rounded-xl">
                      <h4 className="font-bold mb-4">{t('bookDetail.reviews.writeReview')}</h4>
                      <form onSubmit={submitReviewHandler} className="space-y-4">
                        <div className="space-y-2">
                          <Label>{t('bookDetail.reviews.rating')}</Label>
                          <Select onValueChange={(v) => setRating(Number(v))} value={rating.toString()}>
                            <SelectTrigger>
                              <SelectValue placeholder={t('bookDetail.reviews.select')} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">{t('bookDetail.reviews.ratings.1')}</SelectItem>
                              <SelectItem value="2">{t('bookDetail.reviews.ratings.2')}</SelectItem>
                              <SelectItem value="3">{t('bookDetail.reviews.ratings.3')}</SelectItem>
                              <SelectItem value="4">{t('bookDetail.reviews.ratings.4')}</SelectItem>
                              <SelectItem value="5">{t('bookDetail.reviews.ratings.5')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>{t('bookDetail.reviews.comment')}</Label>
                          <textarea
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                          />
                        </div>
                        <Button type="submit" disabled={loadingReview}>
                          {loadingReview ? t('bookDetail.reviews.submitting') : t('bookDetail.reviews.submit')}
                        </Button>
                      </form>
                    </div>
                  ) : (
                    <div className="bg-secondary/30 p-4 rounded-lg">
                      <Trans i18nKey="bookDetail.reviews.signInToReview">
                        Please <Link to="/login" className="text-primary hover:underline">sign in</Link> to write a review
                      </Trans>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>

          {/* Related Books */}
          {relatedBooks.length > 0 && (
            <section className="mt-16 pt-16 border-t border-border">
              <h2 className="font-serif text-2xl font-bold text-foreground mb-8">
                {t('bookDetail.related')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedBooks.map((book, index) => (
                  <BookCard key={book.id} book={book} index={index} />
                ))}
              </div>
            </section>
          )}
        </div>
      </Layout>
    </>
  );
};

export default BookDetail;
