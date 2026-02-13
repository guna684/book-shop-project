import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Layout from '@/components/layout/Layout';
import HeroSection from '@/components/home/HeroSection';
import FeaturedBooks from '@/components/home/FeaturedBooks';
import CategorySection from '@/components/home/CategorySection';
import BestsellerSection from '@/components/home/BestsellerSection';
import AIFeatureSection from '@/components/home/AIFeatureSection';
import ThreeShopButton from '@/components/home/ThreeShopButton';
import ThreeShopModal from '@/components/home/ThreeShopModal';

const Index = () => {
  const [open3D, setOpen3D] = useState(false);

  return (
    <>
      <Helmet>
        <title>Sri Chola Book Shop - Discover Your Next Great Read | AI-Powered Book Store</title>
        <meta
          name="description"
          content="Explore millions of books with AI-powered recommendations. Find bestsellers, discover new authors, and shop securely at Sri Chola Book Shop."
        />
      </Helmet>
      <Layout>
        <HeroSection />
        <FeaturedBooks />
        <CategorySection />
        <BestsellerSection />
        <AIFeatureSection />
        <ThreeShopButton onClick={() => setOpen3D(true)} />
        {open3D && <ThreeShopModal onClose={() => setOpen3D(false)} />}
      </Layout>
    </>
  );
};

export default Index;
