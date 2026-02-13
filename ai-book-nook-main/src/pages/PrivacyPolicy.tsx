import { Helmet } from 'react-helmet-async';
import Layout from '@/components/layout/Layout';

const PrivacyPolicy = () => {
    return (
        <Layout>
            <Helmet>
                <title>Privacy Policy | Sri Chola Book Shop</title>
            </Helmet>
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <h1 className="font-serif text-3xl font-bold mb-8">Privacy Policy</h1>

                <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
                    <p className="text-muted-foreground">Last updated: December 2024</p>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
                        <p>
                            We collect information you provide directly to us, such as when you create an account, make a purchase,
                            sign up for our newsletter, or contact us for support. This may include your name, email address,
                            shipping address, payment information, and phone number.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
                        <p>
                            We use the information we collect to:
                        </p>
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li>Process your orders and payments.</li>
                            <li>Send you order confirmations and shipping updates.</li>
                            <li>Respond to your comments and questions.</li>
                            <li>Send you newsletters and promotional offers (you can opt out at any time).</li>
                            <li>Improve our website and customer service.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">3. Sharing of Information</h2>
                        <p>
                            We do not sell your personal information. We may share your information with third-party service providers
                            who help us operate our business, such as payment processors and shipping carriers. These providers have access
                            to your information only to perform these tasks on our behalf.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">4. Security</h2>
                        <p>
                            We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">5. Cookies</h2>
                        <p>
                            We use cookies to improve your experience on our site. You can set your browser to refuse all or some browser cookies, or to alert you when websites set or access cookies.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">6. Contact Us</h2>
                        <p>
                            If you have any questions about this Privacy Policy, please contact us at support@sricholabookshop.com.
                        </p>
                    </section>
                </div>
            </div>
        </Layout>
    );
};

export default PrivacyPolicy;
