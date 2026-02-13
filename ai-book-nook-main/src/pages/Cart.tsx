import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Trash2, Minus, Plus, ArrowRight, ShoppingBag } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/context/CartContext';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const Cart = () => {
  const { t } = useTranslation();
  const { items, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const subtotal = getCartTotal();
  const shipping = subtotal > 499 ? 0 : 49;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <>
        <Helmet>
          <title>{t('cart.emptyTitle')} | Sri Chola Book Shop</title>
        </Helmet>
        <Layout>
          <div className="container mx-auto px-4 py-20">
            <div className="max-w-md mx-auto text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="h-24 w-24 rounded-full bg-secondary mx-auto mb-6 flex items-center justify-center"
              >
                <ShoppingBag className="h-12 w-12 text-muted-foreground" />
              </motion.div>
              <h1 className="font-serif text-3xl font-bold text-foreground mb-4">
                {t('cart.emptyTitle')}
              </h1>
              <p className="text-muted-foreground mb-8">
                {t('cart.emptySubtitle')}
              </p>
              <Link to="/books">
                <Button variant="gold" size="lg" className="gap-2">
                  {t('cart.startShopping')}
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </Layout>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${t('cart.title')} (${items.length}) | Sri Chola Book Shop`}</title>
      </Helmet>
      <Layout>
        <div className="bg-secondary/30 py-8 border-b border-border">
          <div className="container mx-auto px-4">
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground flex items-center gap-3">
              <ShoppingCart className="h-8 w-8 text-primary" />
              {t('cart.title')}
            </h1>
            <p className="text-muted-foreground mt-2">
              {items.length === 1
                ? t('cart.items_count', { count: items.length })
                : t('cart.items_count_plural', { count: items.length })}
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.book.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="bg-card rounded-xl p-4 md:p-6 shadow-soft flex gap-4"
                  >
                    {/* Book Image */}
                    <Link to={`/book/${item.book.id}`} className="shrink-0">
                      <img
                        src={item.book.image_url || item.book.coverImage || '/images/placeholder-book.jpg'}
                        alt={item.book.title}
                        className="w-20 h-28 md:w-24 md:h-32 object-cover rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (target.src !== item.book.coverImage && item.book.coverImage) {
                            target.src = item.book.coverImage;
                          } else if (!target.src.includes('placeholder-book.jpg')) {
                            target.src = '/images/placeholder-book.jpg';
                          }
                        }}
                      />
                    </Link>

                    {/* Book Info */}
                    <div className="flex-1 min-w-0">
                      <Link to={`/book/${item.book.id}`}>
                        <h3 className="font-serif font-semibold text-foreground hover:text-primary transition-colors line-clamp-1">
                          {item.book.title} | Sri Chola Book Shop
                        </h3>
                      </Link>
                      <p className="text-sm text-muted-foreground">{t('common.by')} {item.book.author}</p>

                      {/* Price */}
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-lg font-bold text-foreground">
                          ₹{item.book.price}
                        </span>
                        {item.book.originalPrice && (
                          <span className="text-sm text-muted-foreground line-through">
                            ₹{item.book.originalPrice}
                          </span>
                        )}
                      </div>

                      {/* Quantity & Remove (Mobile) */}
                      <div className="flex items-center justify-between mt-4 md:hidden">
                        <div className="flex items-center gap-2 bg-secondary rounded-lg p-1">
                          <button
                            onClick={() => updateQuantity(item.book.id, item.quantity - 1)}
                            className="h-8 w-8 rounded-md hover:bg-card flex items-center justify-center"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.book.id, item.quantity + 1)}
                            className="h-8 w-8 rounded-md hover:bg-card flex items-center justify-center"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.book.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {/* Quantity & Remove (Desktop) */}
                    <div className="hidden md:flex items-center gap-6">
                      <div className="flex items-center gap-2 bg-secondary rounded-lg p-1">
                        <button
                          onClick={() => updateQuantity(item.book.id, item.quantity - 1)}
                          className="h-8 w-8 rounded-md hover:bg-card flex items-center justify-center"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.book.id, item.quantity + 1)}
                          className="h-8 w-8 rounded-md hover:bg-card flex items-center justify-center"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-bold text-foreground">
                          ₹{item.book.price * item.quantity}
                        </p>
                        <button
                          onClick={() => removeFromCart(item.book.id)}
                          className="text-sm text-muted-foreground hover:text-destructive transition-colors mt-1"
                        >
                          {t('cart.remove')}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Clear Cart */}
              <div className="flex justify-end pt-4">
                <Button variant="ghost" onClick={clearCart} className="text-muted-foreground">
                  {t('cart.clear')}
                </Button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-xl p-6 shadow-soft sticky top-24">
                <h2 className="font-serif text-xl font-bold text-foreground mb-6">
                  {t('cart.summary')}
                </h2>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('cart.subtotal')}</span>
                    <span className="font-medium">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('cart.shipping')}</span>
                    <span className="font-medium">
                      {shipping === 0 ? (
                        <span className="text-green-600">{t('cart.free')}</span>
                      ) : (
                        `₹${shipping}`
                      )}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {t('cart.addMore', { amount: 499 - subtotal })}
                    </p>
                  )}
                </div>

                <Separator className="my-6" />

                {/* Promo Code */}
                <div className="mb-6">
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    {t('cart.promoCode')}
                  </label>
                  <div className="flex gap-2">
                    <Input placeholder={t('cart.promoPlaceholder')} className="flex-1" />
                    <Button variant="outline">{t('cart.apply')}</Button>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="flex justify-between text-lg font-bold mb-6">
                  <span>{t('cart.total')}</span>
                  <span>₹{total}</span>
                </div>

                <Button
                  variant="gold"
                  size="lg"
                  className="w-full gap-2"
                  onClick={() => {
                    if (user) {
                      navigate('/checkout');
                    } else {
                      toast.error('Please login to checkout');
                      navigate('/login');
                    }
                  }}
                >
                  {t('cart.checkout')}
                  <ArrowRight className="h-5 w-5" />
                </Button>

                <Link to="/books" className="block mt-4">
                  <Button variant="ghost" className="w-full">
                    {t('cart.continue')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Cart;
