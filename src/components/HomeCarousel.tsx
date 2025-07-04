
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Card, CardContent } from '@/components/ui/card';
import type { Tables } from '@/integrations/supabase/types';

type CarouselImage = Tables<'carousel_images'>;

export const HomeCarousel = () => {
  const [images, setImages] = useState<CarouselImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveImages();
  }, []);

  const fetchActiveImages = async () => {
    try {
      const { data, error } = await supabase
        .from('carousel_images')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Error fetching carousel images:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || images.length === 0) {
    return null;
  }

  return (
    <section className="py-8 bg-background">
      <div className="container px-4">
        <Carousel className="w-full max-w-4xl mx-auto">
          <CarouselContent>
            {images.map((image) => (
              <CarouselItem key={image.id}>
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-0">
                    <AspectRatio ratio={16/9}>
                      <img
                        src={image.image_url}
                        alt={image.title}
                        className="object-cover w-full h-full rounded-lg"
                      />
                    </AspectRatio>
                    {(image.title || image.description) && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-lg">
                        <h3 className="text-white text-xl font-semibold mb-2">{image.title}</h3>
                        {image.description && (
                          <p className="text-white/90 text-sm">{image.description}</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          {images.length > 1 && (
            <>
              <CarouselPrevious />
              <CarouselNext />
            </>
          )}
        </Carousel>
      </div>
    </section>
  );
};
