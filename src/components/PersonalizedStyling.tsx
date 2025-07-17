import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sparkles, User, Calendar, Heart, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLanguage } from '@/contexts/LanguageContext';

interface StyleProfile {
  name: string;
  age: string;
  occasion: string;
  budget: string;
  style: string;
  preferences: string;
  skinTone: string;
  lifestyle: string;
}

interface StyleRecommendation {
  category: string;
  items: {
    name: string;
    description: string;
    reason: string;
    price: string;
    image: string;
  }[];
}

export const PersonalizedStyling = () => {
  const [profile, setProfile] = useState<StyleProfile>({
    name: '',
    age: '',
    occasion: '',
    budget: '',
    style: '',
    preferences: '',
    skinTone: '',
    lifestyle: ''
  });
  const [recommendations, setRecommendations] = useState<StyleRecommendation[]>([]);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleInputChange = (field: keyof StyleProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const generateRecommendations = async () => {
    if (!profile.name || !profile.occasion || !profile.style) {
      toast({
        title: t('ai.error'),
        description: t('ai.fillRequired'),
        variant: 'destructive',
      });
      return;
    }

    setProcessing(true);
    
    try {
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Generate Indian jewelry recommendations based on profile
      const mockRecommendations: StyleRecommendation[] = [
        {
          category: 'Traditional Necklaces',
          items: [
            {
              name: 'Kundan Meenakari Necklace',
              description: 'Handcrafted gold necklace with kundan stones and colorful meenakari work',
              reason: 'Perfect for weddings and festive occasions, matches traditional Indian style',
              price: '₹45,000 - ₹85,000',
              image: '/lovable-uploads/177cb67f-d365-4177-b967-ece97a39e31e.png'
            },
            {
              name: 'Temple Jewelry Set',
              description: 'South Indian temple style necklace with intricate designs',
              reason: 'Ideal for religious ceremonies and cultural events',
              price: '₹35,000 - ₹60,000',
              image: '/lovable-uploads/9b6e08d1-e086-49fd-a568-e16983ee39e8.png'
            }
          ]
        },
        {
          category: 'Earrings',
          items: [
            {
              name: 'Chandelier Earrings',
              description: 'Heavy gold chandelier earrings with precious stones',
              reason: 'Statement piece perfect for special occasions and your bold style',
              price: '₹25,000 - ₹40,000',
              image: '/lovable-uploads/3f8f1fdc-9e82-4a9f-8c32-95ca7161e97e.png'
            },
            {
              name: 'Jhumka Earrings',
              description: 'Classic Indian jhumka with pearls and gold work',
              reason: 'Versatile design suitable for both casual and formal wear',
              price: '₹15,000 - ₹25,000',
              image: '/lovable-uploads/726ba192-f434-4ff0-8deb-c3e3ace6f5aa.png'
            }
          ]
        },
        {
          category: 'Bangles & Bracelets',
          items: [
            {
              name: 'Antique Gold Bangles',
              description: 'Traditional antique finish gold bangles set',
              reason: 'Classic Indian jewelry piece that complements your traditional style',
              price: '₹20,000 - ₹35,000',
              image: '/lovable-uploads/177cb67f-d365-4177-b967-ece97a39e31e.png'
            },
            {
              name: 'Kada Bracelet',
              description: 'Thick gold kada with engraved patterns',
              reason: 'Perfect for daily wear and professional settings',
              price: '₹12,000 - ₹18,000',
              image: '/lovable-uploads/9b6e08d1-e086-49fd-a568-e16983ee39e8.png'
            }
          ]
        }
      ];
      
      setRecommendations(mockRecommendations);
      
      toast({
        title: t('ai.recommendationsReady'),
        description: t('ai.recommendationsReadyDesc'),
      });
    } catch (error) {
      console.error('Styling recommendation error:', error);
      toast({
        title: t('ai.error'),
        description: t('ai.recommendationsFailed'),
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">{t('ai.personalizedStyling.subtitle')}</h2>
        <p className="text-muted-foreground">
          {t('ai.personalizedStyling.description')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Form */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t('ai.styleProfile')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">{t('ai.nameRequired')}</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder={t('ai.namePlaceholder')}
                />
              </div>

              <div>
                <Label htmlFor="age">{t('ai.ageRange')}</Label>
                <Select value={profile.age} onValueChange={(value) => handleInputChange('age', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('ai.selectAge')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="18-25">18-25</SelectItem>
                    <SelectItem value="26-35">26-35</SelectItem>
                    <SelectItem value="36-45">36-45</SelectItem>
                    <SelectItem value="46-55">46-55</SelectItem>
                    <SelectItem value="55+">55+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="occasion">{t('ai.occasionRequired')}</Label>
                <Select value={profile.occasion} onValueChange={(value) => handleInputChange('occasion', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('ai.selectOccasion')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">{t('ai.dailyWear')}</SelectItem>
                    <SelectItem value="office">{t('ai.office')}</SelectItem>
                    <SelectItem value="wedding">{t('ai.wedding')}</SelectItem>
                    <SelectItem value="party">{t('ai.party')}</SelectItem>
                    <SelectItem value="festival">{t('ai.festival')}</SelectItem>
                    <SelectItem value="special">{t('ai.special')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="budget">{t('ai.budgetRange')}</Label>
                <Select value={profile.budget} onValueChange={(value) => handleInputChange('budget', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('ai.selectBudget')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under-10k">Under ₹10,000</SelectItem>
                    <SelectItem value="10k-25k">₹10,000 - ₹25,000</SelectItem>
                    <SelectItem value="25k-50k">₹25,000 - ₹50,000</SelectItem>
                    <SelectItem value="50k-100k">₹50,000 - ₹1,00,000</SelectItem>
                    <SelectItem value="100k+">₹1,00,000+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="style">{t('ai.styleRequired')}</Label>
                <Select value={profile.style} onValueChange={(value) => handleInputChange('style', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('ai.selectStyle')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minimalist">{t('ai.minimalist')}</SelectItem>
                    <SelectItem value="classic">{t('ai.classic')}</SelectItem>
                    <SelectItem value="modern">{t('ai.modern')}</SelectItem>
                    <SelectItem value="bohemian">{t('ai.bohemian')}</SelectItem>
                    <SelectItem value="traditional">{t('ai.traditional')}</SelectItem>
                    <SelectItem value="bold">{t('ai.bold')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="skinTone">{t('ai.skinTone')}</Label>
                <Select value={profile.skinTone} onValueChange={(value) => handleInputChange('skinTone', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('ai.selectSkinTone')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="warm">{t('ai.warm')}</SelectItem>
                    <SelectItem value="cool">{t('ai.cool')}</SelectItem>
                    <SelectItem value="neutral">{t('ai.neutral')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="lifestyle">{t('ai.lifestyle')}</Label>
                <Select value={profile.lifestyle} onValueChange={(value) => handleInputChange('lifestyle', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('ai.selectLifestyle')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{t('ai.active')}</SelectItem>
                    <SelectItem value="professional">{t('ai.professional')}</SelectItem>
                    <SelectItem value="social">{t('ai.social')}</SelectItem>
                    <SelectItem value="casual">{t('ai.casual')}</SelectItem>
                    <SelectItem value="formal">{t('ai.formal')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="preferences">{t('ai.preferences')}</Label>
                <Textarea
                  id="preferences"
                  value={profile.preferences}
                  onChange={(e) => handleInputChange('preferences', e.target.value)}
                  placeholder={t('ai.preferencesPlaceholder')}
                  rows={3}
                />
              </div>

              <Button
                onClick={generateRecommendations}
                disabled={processing}
                className="w-full"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t('ai.generating')}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    {t('ai.getRecommendations')}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              {t('ai.recommendations')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recommendations.length > 0 ? (
              <div className="space-y-6">
                {/* Profile Summary */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">{t('ai.profileSummary')}</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{profile.style}</Badge>
                    <Badge variant="outline">{profile.occasion}</Badge>
                    {profile.budget && <Badge variant="outline">{profile.budget}</Badge>}
                    {profile.skinTone && <Badge variant="outline">{profile.skinTone} tones</Badge>}
                  </div>
                </div>

                {/* Recommendations by Category */}
                {recommendations.map((category, index) => (
                  <div key={index} className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {category.category}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {category.items.map((item, itemIndex) => (
                        <Card key={itemIndex} className="border-l-4 border-l-primary">
                          <CardContent className="p-4">
                            <div className="flex gap-4">
                              <div className="flex-shrink-0">
                                <img 
                                  src={item.image} 
                                  alt={item.name}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium">{item.name}</h4>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {item.description}
                                </p>
                                <p className="text-sm mb-2">
                                  <strong>Why:</strong> {item.reason}
                                </p>
                                <Badge variant="secondary">{item.price}</Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}

                <Alert>
                  <Sparkles className="h-4 w-4" />
                  <AlertDescription>
                    {t('ai.recommendationsNote')}
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <div className="text-center py-12">
                <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {t('ai.fillProfile')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};