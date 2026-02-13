import { motion } from 'framer-motion';
import { Bot, MessageCircle, Sparkles, Search, TrendingUp, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation, Trans } from 'react-i18next';

const AIFeatureSection = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: Search,
      title: t('aiAssistant.features.naturalSearch.title'),
      description: t('aiAssistant.features.naturalSearch.description'),
    },
    {
      icon: TrendingUp,
      title: t('aiAssistant.features.smartRecs.title'),
      description: t('aiAssistant.features.smartRecs.description'),
    },
    {
      icon: BookOpen,
      title: t('aiAssistant.features.budgetFriendly.title'),
      description: t('aiAssistant.features.budgetFriendly.description'),
    },
  ];

  return (
    <section className="py-20 bg-gradient-hero relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-accent blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/20 rounded-full px-4 py-2 mb-6">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm text-primary font-medium">{t('aiAssistant.badge')}</span>
            </div>

            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-paper mb-6">
              <Trans i18nKey="aiAssistant.title">
                Meet Your Personal <span className="text-gradient-gold">Book Assistant</span>
              </Trans>
            </h2>

            <p className="text-lg text-paper/70 mb-8">
              {t('aiAssistant.description')}
            </p>

            <div className="space-y-4 mb-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-paper">{feature.title}</h3>
                    <p className="text-sm text-paper/60">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <Button variant="hero" size="lg" className="gap-2">
              <MessageCircle className="h-5 w-5" />
              {t('aiAssistant.tryAssistant')}
            </Button>
          </motion.div>

          {/* Chat Demo Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-card rounded-2xl shadow-elevated p-6 max-w-md mx-auto">
              {/* Chat Header */}
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{t('aiAssistant.demo.title')}</h4>
                  <p className="text-xs text-muted-foreground">{t('aiAssistant.demo.subtitle')}</p>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="space-y-4">
                <div className="flex justify-end">
                  <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-2 max-w-[80%]">
                    <p className="text-sm">{t('aiAssistant.demo.userMessage')}</p>
                  </div>
                </div>

                <div className="flex justify-start">
                  <div className="bg-secondary text-secondary-foreground rounded-2xl rounded-bl-md px-4 py-3 max-w-[85%]">
                    <p className="text-sm">
                      {t('aiAssistant.demo.aiResponse')}
                    </p>
                    <div className="mt-3 space-y-2">
                      {[
                        { title: 'The Silent Patient', price: '₹349' },
                        { title: 'Gone Girl', price: '₹399' },
                        { title: 'The Girl on the Train', price: '₹349' },
                      ].map((book) => (
                        <div
                          key={book.title}
                          className="flex items-center justify-between bg-card/50 rounded-lg px-3 py-2"
                        >
                          <span className="text-xs font-medium">{book.title}</span>
                          <span className="text-xs text-primary font-bold">{book.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Input Demo */}
              <div className="mt-6 pt-4 border-t border-border">
                <div className="flex items-center gap-2 bg-secondary/50 rounded-lg px-4 py-3">
                  <span className="text-sm text-muted-foreground">{t('aiAssistant.demo.inputPlaceholder')}</span>
                </div>
              </div>
            </div>

            {/* Decorative */}
            <motion.div
              className="absolute -top-4 -right-4 h-20 w-20 bg-primary/30 rounded-full blur-xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AIFeatureSection;
