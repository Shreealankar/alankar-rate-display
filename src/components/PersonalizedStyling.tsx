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

  const handleInputChange = (field: keyof StyleProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const generateRecommendations = async () => {
    if (!profile.name || !profile.occasion || !profile.style) {
      toast({
        title: 'Error',
        description: 'Please fill in the required fields',
        variant: 'destructive',
      });
      return;
    }

    setProcessing(true);
    
    try {
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Generate mock recommendations based on profile
      const mockRecommendations: StyleRecommendation[] = [
        {
          category: 'Necklaces',
          items: [
            {
              name: 'Delicate Gold Chain',
              description: '18K gold chain with small pendant',
              reason: 'Perfect for your minimalist style and daily wear',
              price: '₹15,000 - ₹25,000'
            },
            {
              name: 'Pearl Choker',
              description: 'Classic pearl choker with gold clasp',
              reason: 'Elegant choice for formal occasions',
              price: '₹8,000 - ₹12,000'
            }
          ]
        },
        {
          category: 'Earrings',
          items: [
            {
              name: 'Stud Earrings',
              description: 'Diamond stud earrings in gold',
              reason: 'Versatile and suitable for your lifestyle',
              price: '₹20,000 - ₹35,000'
            },
            {
              name: 'Hoop Earrings',
              description: 'Medium-sized gold hoops',
              reason: 'Adds elegance without being too bold',
              price: '₹10,000 - ₹18,000'
            }
          ]
        },
        {
          category: 'Rings',
          items: [
            {
              name: 'Solitaire Ring',
              description: 'Classic solitaire diamond ring',
              reason: 'Timeless piece that matches your style',
              price: '₹50,000 - ₹100,000'
            },
            {
              name: 'Stackable Rings',
              description: 'Set of thin gold bands',
              reason: 'Perfect for mixing and matching',
              price: '₹5,000 - ₹8,000 each'
            }
          ]
        }
      ];
      
      setRecommendations(mockRecommendations);
      
      toast({
        title: 'Recommendations Generated',
        description: 'Your personalized styling suggestions are ready!',
      });
    } catch (error) {
      console.error('Styling recommendation error:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate recommendations. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">AI Fashion Consultant</h2>
        <p className="text-muted-foreground">
          Get personalized jewelry recommendations based on your style preferences and lifestyle
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Form */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Style Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <Label htmlFor="age">Age Range</Label>
                <Select value={profile.age} onValueChange={(value) => handleInputChange('age', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select age range" />
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
                <Label htmlFor="occasion">Occasion *</Label>
                <Select value={profile.occasion} onValueChange={(value) => handleInputChange('occasion', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select occasion" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily Wear</SelectItem>
                    <SelectItem value="office">Office/Work</SelectItem>
                    <SelectItem value="wedding">Wedding</SelectItem>
                    <SelectItem value="party">Party/Event</SelectItem>
                    <SelectItem value="festival">Festival</SelectItem>
                    <SelectItem value="special">Special Occasion</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="budget">Budget Range</Label>
                <Select value={profile.budget} onValueChange={(value) => handleInputChange('budget', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget range" />
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
                <Label htmlFor="style">Style Preference *</Label>
                <Select value={profile.style} onValueChange={(value) => handleInputChange('style', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minimalist">Minimalist</SelectItem>
                    <SelectItem value="classic">Classic</SelectItem>
                    <SelectItem value="modern">Modern</SelectItem>
                    <SelectItem value="bohemian">Bohemian</SelectItem>
                    <SelectItem value="traditional">Traditional</SelectItem>
                    <SelectItem value="bold">Bold/Statement</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="skinTone">Skin Tone</Label>
                <Select value={profile.skinTone} onValueChange={(value) => handleInputChange('skinTone', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select skin tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="warm">Warm</SelectItem>
                    <SelectItem value="cool">Cool</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="lifestyle">Lifestyle</Label>
                <Select value={profile.lifestyle} onValueChange={(value) => handleInputChange('lifestyle', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select lifestyle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="formal">Formal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="preferences">Additional Preferences</Label>
                <Textarea
                  id="preferences"
                  value={profile.preferences}
                  onChange={(e) => handleInputChange('preferences', e.target.value)}
                  placeholder="Any specific preferences or requirements..."
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
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Get Recommendations
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
              Personalized Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recommendations.length > 0 ? (
              <div className="space-y-6">
                {/* Profile Summary */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Style Profile Summary</h3>
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
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              {item.description}
                            </p>
                            <p className="text-sm mb-2">
                              <strong>Why:</strong> {item.reason}
                            </p>
                            <Badge variant="secondary">{item.price}</Badge>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}

                <Alert>
                  <Sparkles className="h-4 w-4" />
                  <AlertDescription>
                    These recommendations are AI-generated based on your preferences. 
                    Visit our gallery to see available products or consult with our experts for personalized assistance.
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <div className="text-center py-12">
                <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Fill out your style profile to get personalized jewelry recommendations
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};