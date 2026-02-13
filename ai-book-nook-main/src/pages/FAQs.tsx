import { Helmet } from 'react-helmet-async';
import Layout from '@/components/layout/Layout';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

const FAQs = () => {
    return (
        <Layout>
            <Helmet>
                <title>FAQs | Sri Chola Book Shop</title>
            </Helmet>
            <div className="container mx-auto px-4 py-12 max-w-3xl">
                <h1 className="font-serif text-3xl font-bold text-center mb-8">Frequently Asked Questions</h1>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>How long does shipping take?</AccordionTrigger>
                        <AccordionContent>
                            Standard shipping typically takes 3-5 business days. Express shipping options are available at checkout for 1-2 day delivery.
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-2">
                        <AccordionTrigger>What is your return policy?</AccordionTrigger>
                        <AccordionContent>
                            We accept returns within 30 days of purchase for items in their original condition. Please visit our Return Policy page for more details.
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-3">
                        <AccordionTrigger>Do you ship internationally?</AccordionTrigger>
                        <AccordionContent>
                            Currently, we ship within India. We are working on expanding our shipping destinations to other countries soon.
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-4">
                        <AccordionTrigger>How can I track my order?</AccordionTrigger>
                        <AccordionContent>
                            Once your order is shipped, you will receive a tracking number via email. You can also track your order status in your account dashboard under "My Orders".
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-5">
                        <AccordionTrigger>Are the books new or used?</AccordionTrigger>
                        <AccordionContent>
                            All books sold on Sri Chola Book Shop are brand new, directly from publishers and authorized distributors, unless explicitly marked as "Used" or "Refurbished".
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </Layout>
    );
};

export default FAQs;
