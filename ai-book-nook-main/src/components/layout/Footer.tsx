import { Link } from 'react-router-dom';
import { BookOpen, Mail, Phone, MapPin, Facebook, Instagram } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');

  const handleSubscribe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await api.post('/api/newsletter/subscribe', { email });
      toast.success('Successfully subscribed to newsletter!');
      setEmail('');
    } catch (error: any) {
      console.error('Error subscribing:', error);
      toast.error(
        error.response?.data?.message || 'Failed to subscribe. Please try again.'
      );
    }
  };

  return (
    <footer className="bg-sidebar text-sidebar-foreground">

      {/* Newsletter Section */}
      <div className="border-b border-sidebar-border">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="font-serif text-2xl md:text-3xl font-bold mb-3">
              {t('footer.newsletterTitle')}
            </h3>
            <p className="text-sidebar-foreground/70 mb-6">
              {t('footer.newsletterSubtitle')}
            </p>

            <form
              onSubmit={handleSubscribe}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <Input
                type="email"
                required
                placeholder={t('footer.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/50"
              />
              <Button type="submit" variant="gold" className="whitespace-nowrap">
                {t('footer.subscribe')}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">

          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <BookOpen className="h-8 w-8 text-sidebar-primary" />
              <span className="font-serif text-2xl font-bold">
                {t('common.bookHaven')}
              </span>
            </Link>
            <p className="text-sidebar-foreground/70 mb-6 leading-relaxed">
              {t('footer.tagline')}
            </p>
            <div className="flex gap-4">
              {[Facebook, Instagram].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="h-10 w-10 rounded-full bg-sidebar-accent flex items-center justify-center hover:bg-sidebar-primary hover:text-sidebar-primary-foreground transition-colors"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-4">{t('footer.quickLinks')}</h4>
            <ul className="space-y-3">
              {['about', 'contact', 'faqs', 'shipping', 'returns', 'privacy'].map(link => (
                <li key={link}>
                  <Link to={`/${link}`} className="text-sidebar-foreground/70 hover:text-sidebar-primary">
                    {t(`footer.links.${link}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-4">{t('footer.categories')}</h4>
            <ul className="space-y-3">
              {['fiction', 'non-fiction', 'mystery', 'romance', 'sci-fi', 'self-help'].map(cat => (
                <li key={cat}>
                  <Link
                    to={`/books?category=${cat}`}
                    className="text-sidebar-foreground/70 hover:text-sidebar-primary"
                  >
                    {t(`categories.${cat}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-4">{t('footer.contactUs')}</h4>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <MapPin className="h-5 w-5 text-sidebar-primary" />
                <span className="text-sidebar-foreground/70">
                  New Delhi, India - 110001
                </span>
              </li>
              <li className="flex gap-3">
                <Phone className="h-5 w-5 text-sidebar-primary" />
                <span className="text-sidebar-foreground/70">+91 98765 43210</span>
              </li>
              <li className="flex gap-3">
                <Mail className="h-5 w-5 text-sidebar-primary" />
                <span className="text-sidebar-foreground/70">support@sricholabookshop.com</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-sidebar-border">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-sidebar-foreground/60">
          © 2024 Sri Chola Book Shop. {t('footer.rights')}
        </div>
      </div>

    </footer>
  );
};

export default Footer;
