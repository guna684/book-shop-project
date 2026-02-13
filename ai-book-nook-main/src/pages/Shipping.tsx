import { Helmet } from 'react-helmet-async';
import Layout from '@/components/layout/Layout';

const Shipping = () => {
    return (
        <Layout>
            <Helmet>
                <title>Shipping Info | Sri Chola Book Shop</title>
            </Helmet>
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <h1 className="font-serif text-3xl font-bold mb-8">Shipping Information</h1>

                <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
                    <section>
                        <h2 className="text-xl font-semibold mb-3">Delivery Options</h2>
                        <div className="grid md:grid-cols-2 gap-6 mt-4">
                            <div className="p-6 border border-border rounded-lg bg-card">
                                <h3 className="font-bold text-lg mb-2">Standard Shipping</h3>
                                <p className="text-muted-foreground mb-2">3-5 Business Days</p>
                                <p className="font-medium">Free on orders over ₹500</p>
                            </div>
                            <div className="p-6 border border-border rounded-lg bg-card">
                                <h3 className="font-bold text-lg mb-2">Express Shipping</h3>
                                <p className="text-muted-foreground mb-2">1-2 Business Days</p>
                                <p className="font-medium">₹100 flat rate</p>
                            </div>
                        </div>
                    </section>

                    <section className="mt-8">
                        <h2 className="text-xl font-semibold mb-3">Order Processing</h2>
                        <p>
                            Orders are processed within 24 hours of being placed. Orders placed on weekends or holidays
                            will be processed the next business day. You will receive a confirmation email with tracking
                            information once your order has shipped.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">International Shipping</h2>
                        <p>
                            We currently do not offer international shipping. We only ship to addresses within India.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">Tracking Your Order</h2>
                        <p>
                            You can track your order using the tracking number provided in your shipping confirmation email
                            or by logging into your account and viewing your order history.
                        </p>
                    </section>
                </div>
            </div>
        </Layout>
    );
};

export default Shipping;
