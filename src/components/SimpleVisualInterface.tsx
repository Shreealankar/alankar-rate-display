import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Crown, 
  Gem, 
  Heart, 
  Circle, 
  Star, 
  Phone, 
  MapPin, 
  Clock,
  TrendingUp,
  Volume2
} from 'lucide-react';

interface SimpleVisualInterfaceProps {
  onFeatureSelect: (feature: string) => void;
}

export function SimpleVisualInterface({ onFeatureSelect }: SimpleVisualInterfaceProps) {
  const { t } = useLanguage();

  const features = [
    {
      id: 'necklace',
      icon: Crown,
      label: t('necklace'),
      color: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800',
    },
    {
      id: 'ring',
      icon: Circle,
      label: t('ring'),
      color: 'bg-blue-100 hover:bg-blue-200 text-blue-800',
    },
    {
      id: 'earring',
      icon: Star,
      label: t('earring'),
      color: 'bg-pink-100 hover:bg-pink-200 text-pink-800',
    },
    {
      id: 'bracelet',
      icon: Heart,
      label: t('bracelet'),
      color: 'bg-purple-100 hover:bg-purple-200 text-purple-800',
    },
    {
      id: 'rates',
      icon: TrendingUp,
      label: t('gold_rates'),
      color: 'bg-green-100 hover:bg-green-200 text-green-800',
    },
    {
      id: 'voice',
      icon: Volume2,
      label: t('voice_search'),
      color: 'bg-orange-100 hover:bg-orange-200 text-orange-800',
    },
    {
      id: 'contact',
      icon: Phone,
      label: t('contact_us'),
      color: 'bg-red-100 hover:bg-red-200 text-red-800',
    },
    {
      id: 'location',
      icon: MapPin,
      label: t('location'),
      color: 'bg-indigo-100 hover:bg-indigo-200 text-indigo-800',
    },
    {
      id: 'hours',
      icon: Clock,
      label: t('shop_hours'),
      color: 'bg-teal-100 hover:bg-teal-200 text-teal-800',
    },
  ];

  return (
    <div className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
        {t('what_can_i_help_you_with')}
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {features.map((feature) => {
          const IconComponent = feature.icon;
          return (
            <Card 
              key={feature.id} 
              className={`cursor-pointer transition-all duration-200 hover:scale-105 ${feature.color} border-2 border-transparent hover:border-current`}
              onClick={() => onFeatureSelect(feature.id)}
            >
              <CardContent className="p-6 flex flex-col items-center text-center">
                <IconComponent className="h-12 w-12 mb-3" />
                <span className="text-lg font-semibold">{feature.label}</span>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600 mb-4">
          {t('simple_interface_description')}
        </p>
        <Button 
          onClick={() => onFeatureSelect('help')}
          variant="outline"
          size="lg"
          className="bg-white hover:bg-gray-50"
        >
          {t('need_help')}
        </Button>
      </div>
    </div>
  );
}