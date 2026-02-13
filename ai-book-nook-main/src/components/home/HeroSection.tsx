import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/axios';

interface BannerButton {
  text: string;
  link: string;
  variant: 'hero' | 'paper' | 'primary' | 'outline';
  order: number;
  isVisible: boolean;
}

interface BannerCounter {
  label: string;
  value: string;
  suffix: string;
  isVisible: boolean;
}

interface BannerData {
  title: string;
  subtitle: string;
  imageUrl: string;
  overlayOpacity: number;
  buttons: BannerButton[];
  counters: BannerCounter[];
  isActive: boolean;
}

const HeroSection = () => {
  const { t } = useTranslation();
  const [banner, setBanner] = useState<BannerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const { data } = await api.get('/api/banner');
        setBanner(data);
      } catch (error) {
        console.error('Failed to fetch banner:', error);
        // Fallback to default if API fails
      } finally {
        setLoading(false);
      }
    };
    fetchBanner();
  }, []);

  // Use defaults if loading or no data, but preferably use the fetched data structure
  // If loading, we can show a skeleton or just render defaults immediately to avoid flicker if SSR/SSG wasn't an option
  // For now, we'll wait for loading to finish for "smooth" transition or just show defaults

  const displayBanner = banner || {
    title: t('hero.title'),
    subtitle: t('hero.description'),
    imageUrl: '',
    overlayOpacity: 0.1,
    buttons: [
      { text: t('hero.startExploring'), link: '/books', variant: 'hero', order: 1, isVisible: true },
      { text: t('hero.browseCategories'), link: '/categories', variant: 'paper', order: 2, isVisible: true }
    ],
    counters: [
      { label: 'Books', value: '50K', suffix: '+', isVisible: true },
      { label: 'Authors', value: '10K', suffix: '+', isVisible: true },
      { label: 'Readers', value: '500K', suffix: '+', isVisible: true }
    ],
    isActive: true
  };

  const activeButtons = displayBanner.buttons
    ?.filter(b => b.isVisible)
    .sort((a, b) => a.order - b.order) || [];

  const activeCounters = displayBanner.counters
    ?.filter(c => c.isVisible) || [];

  return (
    <section className="relative min-h-[90vh] flex items-center bg-gradient-hero overflow-hidden">
      {/* Dynamic Background Image & Overlay */}
      {displayBanner.imageUrl && (
        <div className="absolute inset-0 z-0">
          <img
            src={displayBanner.imageUrl}
            alt="Banner Background"
            className="w-full h-full object-cover"
          />
          {/* Overlay for text readability */}
          <div
            className="absolute inset-0 bg-black"
            style={{ opacity: displayBanner.overlayOpacity }}
          />
        </div>
      )}

      {/* Background Pattern (Original) - visible if no image or partly visible via overlay */}
      {!displayBanner.imageUrl && (
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-primary blur-[100px]" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-accent blur-[120px]" />
        </div>
      )}

      {/* Floating Books Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-primary/20"
            style={{
              left: `${15 + i * 20}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              rotate: [-5, 5, -5],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <BookOpen className="w-16 h-16 md:w-24 md:h-24" />
          </motion.div>
        ))}
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            {/* 
                For title, we need to handle the specialized styling of "Knowledge" which was done via <Trans>.
                The backend title will be a raw string. 
                If we want to maintain the partial styling, we might need a richer editor or 
                just apply style to the whole title or specific keywords.
                For now, we'll render the raw string but allow HTML or simple text.
            */}
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-paper leading-tight mb-6">
              {/* 
                 Check if it's the default key to preserve the Translation capability if backend returns "Welcome..." exactly?
                 If custom title is set, use it. If not, use translation.
               */}
              {banner && banner.title !== "Discover Your Next Great Adventure" ? (
                banner.title
              ) : (
                <Trans i18nKey="hero.title" components={{ 1: <span className="text-gradient-gold" /> }} />
              )}
            </h1>

            <p className="text-lg md:text-xl text-paper/70 mb-8 max-w-xl mx-auto lg:mx-0">
              {banner && banner.subtitle !== "Explore millions of books from bestsellers to rare finds. Let our AI assistant help you discover your perfect read." ? (
                banner.subtitle
              ) : (
                t('hero.description')
              )}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              {activeButtons.map((btn, index) => {
                // Try to translate known button texts
                let displayText = btn.text;
                if (btn.text === 'Start Exploring') displayText = t('hero.startExploring');
                else if (btn.text === 'Browse Categories') displayText = t('hero.browseCategories');

                return (
                  <Link key={index} to={btn.link}>
                    <Button
                      variant={btn.variant as any}
                      size="xl"
                      className="w-full sm:w-auto group"
                    >
                      {displayText}
                      {index === 0 && <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />}
                    </Button>
                  </Link>
                );
              })}
            </div>

            {/* Stats */}
            {activeCounters.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-paper/10"
              >
                {activeCounters.map((stat, i) => (
                  <div key={i} className="text-center lg:text-left">
                    <div className="text-2xl md:text-3xl font-bold text-primary">
                      {stat.value}{stat.suffix}
                    </div>
                    <div className="text-sm text-paper/60">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            )}
          </motion.div>

          {/* Hero Image/Books Stack */}
          {/* We keep this visual if no custom background image is set, OR we could make this toggleable?
              The user asked for "background image", usually implying a hero background. 
              The original hero had a "stack of books" on the right. 
              If the user sets a background image for the WHOLE section, this stack might clutter it.
              Let's condition this on "no custom background image set" or just keep it as 'additional visual'.
              Given "Banner Management" usually implies replacing the whole hero look, 
              if `imageUrl` is present, maybe we should hide the right-side books stack?
              Let's hide the stack if a custom background image is present for cleaner look.
          */}
          {/* Book stack visualization removed to fix ID display issue */}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
