import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { useTranslation } from 'react-i18next';

const Contact = () => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/api/messages', formData);
            toast.success(t('contact.form.success'));
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (error: any) {
            toast.error(error.response?.data?.message || t('contact.form.error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <Helmet>
                <title>{t('contact.title')} | Sri Chola Book Shop</title>
                <meta name="description" content="Get in touch with Sri Chola Book Shop. We are here to help with any questions or concerns." />
            </Helmet>

            <div className="bg-secondary/30 py-12 border-b border-border">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="font-serif text-4xl font-bold text-foreground mb-4">{t('contact.title')}</h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        {t('contact.subtitle')}
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16">
                <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-8"
                    >
                        <div>
                            <h2 className="font-serif text-2xl font-bold mb-6">{t('contact.getInTouch')}</h2>
                            <p className="text-muted-foreground mb-8">
                                {t('contact.formDescription')}
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <MapPin className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-1">{t('contact.location')}</h3>
                                    <p className="text-muted-foreground">
                                        123 Book Street, Library District,<br />
                                        New Delhi, India - 110001
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <Phone className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-1">{t('contact.phone')}</h3>
                                    <p className="text-muted-foreground">+91 98765 43210</p>
                                    <p className="text-xs text-muted-foreground mt-1">{t('contact.phoneSub')}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <Mail className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-1">{t('contact.email')}</h3>
                                    <p className="text-muted-foreground">support@sricholabookshop.com</p>
                                    <p className="text-xs text-muted-foreground mt-1">{t('contact.emailSub')}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-card p-8 rounded-2xl shadow-soft border border-border"
                    >
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">{t('contact.form.name')}</Label>
                                <Input
                                    id="name"
                                    placeholder={t('contact.form.placeholderName')}
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">{t('contact.form.email')}</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder={t('contact.form.placeholderEmail')}
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="subject">{t('contact.form.subject')}</Label>
                                <Input
                                    id="subject"
                                    placeholder={t('contact.form.placeholderSubject')}
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="message">{t('contact.form.message')}</Label>
                                <Textarea
                                    id="message"
                                    placeholder={t('contact.form.placeholderMessage')}
                                    className="min-h-[150px]"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <Button type="submit" variant="gold" className="w-full gap-2" disabled={loading}>
                                {loading ? t('contact.form.sending') : t('contact.form.send')}
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </Layout>
    );
};

export default Contact;
