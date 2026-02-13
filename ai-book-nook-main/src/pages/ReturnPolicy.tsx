import { Helmet } from 'react-helmet-async';
import Layout from '@/components/layout/Layout';

const ReturnPolicy = () => {
    return (
        <Layout>
            <Helmet>
                <title>Return Policy | Sri Chola Book Shop</title>
            </Helmet>
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <h1 className="font-serif text-3xl font-bold mb-8">Return & Refund Policy</h1>

                <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
                    <p className="text-muted-foreground">
                        We want you to be completely satisfied with your purchase. If you're not happy with your order,
                        we're here to help.
                    </p>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">Returns</h2>
                        <p>
                            You have 30 calendar days to return an item from the date you received it.
                            To be eligible for a return, your item must be unused and in the same condition that you received it.
                            Your item must be in the original packaging.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">Refunds</h2>
                        <p>
                            Once we receive your item, we will inspect it and notify you that we have received your returned item.
                            We will immediately notify you on the status of your refund after inspecting the item.
                        </p>
                        <p className="mt-2">
                            If your return is approved, we will initiate a refund to your credit card (or original method of payment).
                            You will receive the credit within a certain amount of days, depending on your card issuer's policies.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">Shipping</h2>
                        <p>
                            You will be responsible for paying for your own shipping costs for returning your item.
                            Shipping costs are non-refundable. If you receive a refund, the cost of return shipping will be deducted from your refund.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">Damaged Items</h2>
                        <p>
                            If you received a damaged product, please notify us immediately for assistance.
                        </p>
                    </section>
                </div>
            </div>
        </Layout>
    );
};

export default ReturnPolicy;
