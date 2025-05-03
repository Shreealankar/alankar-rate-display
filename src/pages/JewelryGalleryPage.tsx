
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { JewelryGallery } from '@/components/JewelryGallery';

const JewelryGalleryPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <JewelryGallery />
      </main>
      <Footer />
    </div>
  );
};

export default JewelryGalleryPage;
