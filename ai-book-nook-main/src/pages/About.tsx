import { Helmet } from 'react-helmet-async';
import Layout from '@/components/layout/Layout';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const About = () => {
    const { t } = useTranslation();
    return (
        <Layout>
            <Helmet>
                <title>{t('about.title')} | Sri Chola Book Shop</title>
            </Helmet>
            <div className="container mx-auto px-4 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-3xl mx-auto space-y-6"
                >
                    <h1 className="font-serif text-4xl font-bold text-center mb-8">{t('about.title')}</h1>
                    <div className="prose prose-lg dark:prose-invert mx-auto">
                        <p className="lead text-xl text-muted-foreground text-center mb-8">
                            {t('about.subtitle')}
                        </p>

                        <h2 className="text-2xl font-serif font-bold mt-8 mb-4">{t('about.ourStory')}</h2>
                        <p>
                            {t('about.ourStoryText')}
                        </p>

                        <h2 className="text-2xl font-serif font-bold mt-8 mb-4">{t('about.ourMission')}</h2>
                        <p>
                            {t('about.ourMissionText')}
                        </p>

                        <h2 className="text-2xl font-serif font-bold mt-8 mb-4">{t('about.whyChooseUs')}</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>{t('about.points.curated')}</li>
                            <li>{t('about.points.ai')}</li>
                            <li>{t('about.points.shipping')}</li>
                            <li>{t('about.points.community')}</li>
                        </ul>
                    </div>
                </motion.div>
            </div>
        </Layout>
    );
};

export default About;
