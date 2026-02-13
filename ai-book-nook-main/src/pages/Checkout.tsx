import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ChevronLeft, CreditCard, Truck, Shield, CheckCircle } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import { useTranslation } from 'react-i18next';
import PromoCodeInput from '@/components/checkout/PromoCodeInput';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Checkout = () => {
  const { t } = useTranslation();
  const { items, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isProcessing, setIsProcessing] = useState(false);
  const { user, logout } = useAuth();

  const [appliedPromo, setAppliedPromo] = useState<{
    promoCodeId: string;
    code: string;
    discount: number;
    finalAmount: number;
  } | null>(null);

  const subtotal = getCartTotal();
  const discountAmount = appliedPromo ? appliedPromo.discount : 0;
  const shipping = subtotal > 499 ? 0 : 49;
  const total = appliedPromo ? appliedPromo.finalAmount + shipping : subtotal + shipping;

  const handlePromoApplied = (promoData: {
    promoCodeId: string;
    code: string;
    discount: number;
    finalAmount: number;
  }) => {
    setAppliedPromo(promoData);
  };

  const handlePromoRemoved = () => {
    setAppliedPromo(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error(t('checkout.messages.loginReq'));
      navigate('/login');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Create Order
      const orderConfig = {
        headers: { Authorization: `Bearer ${user.token}` }
      };

      const orderData = {
        orderItems: items.map(item => ({
          title: item.book.title,
          qty: item.quantity,
          image: item.book.coverImage,
          price: item.book.price,
          product: item.book.id
        })),
        shippingAddress: {
          address: (document.getElementById('address') as HTMLInputElement).value,
          city: (document.getElementById('city') as HTMLInputElement).value,
          postalCode: (document.getElementById('pincode') as HTMLInputElement).value,
          country: (document.getElementById('country') as HTMLInputElement).value,
        },
        paymentMethod,
        itemsPrice: subtotal,
        taxPrice: 0,
        shippingPrice: shipping,
        totalPrice: total,
        promoCodeId: appliedPromo?.promoCodeId || null,
        discountAmount: appliedPromo?.discount || 0
      };

      const { data: createdOrder } = await api.post('/api/orders', orderData, orderConfig);

      // 2. Initiate Payment (Razorpay)
      if (paymentMethod === 'razorpay') {
        const { data: session } = await api.post('/api/payment/create-session', {
          orderId: createdOrder._id
        }, orderConfig);

        const options = {
          key: session.key,
          amount: session.amount,
          currency: session.currency,
          name: "Sri Chola Book Shop",
          description: "Payment for Order",
          image: "https://cdn-icons-png.flaticon.com/512/2230/2230469.png", // Book icon
          order_id: session.order_id,
          handler: async function (response: any) {
            try {
              await api.post('/api/payment/verify', {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                orderId: createdOrder._id
              }, orderConfig);

              toast.success(t('checkout.messages.success'));
              clearCart();
              navigate('/');
            } catch (err) {
              console.error(err);
              toast.error('Payment verification failed');
              setIsProcessing(false);
            }
          },
          prefill: {
            name: (document.getElementById('firstName') as HTMLInputElement).value + " " + (document.getElementById('lastName') as HTMLInputElement).value,
            email: (document.getElementById('email') as HTMLInputElement).value,
            contact: (document.getElementById('phone') as HTMLInputElement).value
          },
          theme: {
            color: "#eab308"
          },
          modal: {
            ondismiss: function () {
              setIsProcessing(false);
              toast(t('checkout.messages.cancelled'));
            }
          }
        };

        const rzp1 = new window.Razorpay(options);
        rzp1.open();

      } else {
        // COD
        toast.success(t('checkout.messages.orderPlaced'));
        clearCart();
        navigate('/');
      }

    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error(t('checkout.messages.sessionExpired'));
        logout();
        navigate('/login');
        return;
      }
      toast.error(error.response?.data?.message || t('checkout.messages.failed'));
      console.error(error);
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-serif text-3xl font-bold text-foreground mb-4">{t('checkout.empty')}</h1>
          <Link to="/books">
            <Button>{t('checkout.continue')}</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Helmet>
        <title>{t('checkout.title')} | Sri Chola Book Shop</title>
      </Helmet>
      <Layout>
        <div className="bg-secondary/30 py-6 border-b border-border">
          <div className="container mx-auto px-4">
            <Link to="/cart" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft className="h-4 w-4" />
              {t('checkout.backToCart')}
            </Link>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-8">{t('checkout.title')}</h1>

          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Shipping & Payment Forms */}
              <div className="lg:col-span-2 space-y-8">
                {/* Shipping Address */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-xl p-6 shadow-soft"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Truck className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="font-serif text-xl font-bold">{t('checkout.shippingAddress')}</h2>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">{t('checkout.fields.firstName')}</Label>
                      <Input id="firstName" placeholder="John" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">{t('checkout.fields.lastName')}</Label>
                      <Input id="lastName" placeholder="Doe" required />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="email">{t('checkout.fields.email')}</Label>
                      <Input id="email" type="email" placeholder="john@example.com" required />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="phone">{t('checkout.fields.phone')}</Label>
                      <Input id="phone" placeholder="+91 98765 43210" required />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">{t('checkout.fields.address')}</Label>
                      <Input id="address" placeholder="123 Book Street" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">{t('checkout.fields.city')}</Label>
                      <Input id="city" placeholder="New Delhi" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">{t('checkout.fields.state')}</Label>
                      <Input id="state" placeholder="Delhi" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pincode">{t('checkout.fields.pincode')}</Label>
                      <Input id="pincode" placeholder="110001" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">{t('checkout.fields.country')}</Label>
                      <Input id="country" placeholder="India" defaultValue="India" required />
                    </div>
                  </div>
                </motion.div>

                {/* Payment Method */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-card rounded-xl p-6 shadow-soft"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="font-serif text-xl font-bold">{t('checkout.paymentMethod.title')}</h2>
                  </div>

                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                    <label className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary cursor-pointer transition-colors">
                      <RadioGroupItem value="razorpay" />
                      <div className="flex-1">
                        <p className="font-medium">{t('checkout.paymentMethod.razorpay')}</p>
                        <p className="text-sm text-muted-foreground">{t('checkout.paymentMethod.razorpayDesc')}</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary cursor-pointer transition-colors">
                      <RadioGroupItem value="cod" />
                      <div className="flex-1">
                        <p className="font-medium">{t('checkout.paymentMethod.cod')}</p>
                        <p className="text-sm text-muted-foreground">{t('checkout.paymentMethod.codDesc')}</p>
                      </div>
                    </label>
                  </RadioGroup>

                  <div className="flex items-center gap-2 mt-6 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    <span>{t('checkout.paymentMethod.secured')}</span>
                  </div>
                </motion.div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-card rounded-xl p-6 shadow-soft sticky top-24"
                >
                  <h2 className="font-serif text-xl font-bold text-foreground mb-6">{t('checkout.summary')}</h2>

                  <div className="space-y-4 mb-6">
                    {items.map((item) => (
                      <div key={item.book.id} className="flex gap-3">
                        <img
                          src={item.book.coverImage || '/images/placeholder-book.jpg'}
                          alt={item.book.title}
                          className="w-12 h-16 object-cover rounded"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (!target.src.includes('placeholder-book.jpg')) {
                              target.src = '/images/placeholder-book.jpg';
                            }
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.book.title}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-medium">₹{item.book.price * item.quantity}</p>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  {/* Promo Code Input */}
                  <div className="mb-4">
                    <PromoCodeInput
                      cartTotal={subtotal + shipping}
                      onPromoApplied={handlePromoApplied}
                      onPromoRemoved={handlePromoRemoved}
                      appliedPromo={appliedPromo ? {
                        code: appliedPromo.code,
                        discount: appliedPromo.discount
                      } : null}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('cart.subtotal')}</span>
                      <span>₹{subtotal}</span>
                    </div>
                    {appliedPromo && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>{t('checkout.discount')}</span>
                        <span>-₹{discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('cart.shipping')}</span>
                      <span>{shipping === 0 ? t('cart.free') : `₹${shipping}`}</span>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="flex justify-between text-lg font-bold mb-6">
                    <span>{t('cart.total')}</span>
                    <span>₹{total}</span>
                  </div>

                  <Button
                    type="submit"
                    variant="gold"
                    size="lg"
                    className="w-full gap-2"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>{t('checkout.processing')}</>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5" />
                        {t('checkout.placeOrder')}
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>
            </div>
          </form>
        </div>
      </Layout>
    </>
  );
};

export default Checkout;
