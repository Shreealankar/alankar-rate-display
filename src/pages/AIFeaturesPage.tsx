import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PersonalizedStyling } from '@/components/PersonalizedStyling';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, User, Heart } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const AIFeaturesPage = () => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold">{t('ai.title')}</h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('ai.subtitle')}
            </p>
          </div>

          {/* Personalized Styling Feature */}
          <Card className="border-2 hover:border-primary/50 transition-colors mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                {t('ai.personalizedStyling.title')}
                <Badge variant="secondary">{t('ai.personalizedStyling.subtitle')}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {t('ai.personalizedStyling.description')}
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Style Analysis</Badge>
                <Badge variant="outline">Personal Recommendations</Badge>
                <Badge variant="outline">Occasion Matching</Badge>
                <Badge variant="outline">Indian Jewelry</Badge>
              </div>
            </CardContent>
          </Card>

          {/* AI Fashion Consultant */}
          <PersonalizedStyling />

          {/* Technology Info */}
          <Card className="mt-12">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Powered by Advanced AI
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center">
                  <User className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="font-semibold mb-2">Personalized Styling</h3>
                  <p className="text-sm text-muted-foreground">
                    AI-powered recommendations based on your personal style, preferences, and Indian jewelry traditions
                  </p>
                </div>
                <div className="text-center">
                  <Heart className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="font-semibold mb-2">Cultural Expertise</h3>
                  <p className="text-sm text-muted-foreground">
                    Specialized knowledge of Indian jewelry styles, occasions, and cultural significance
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AIFeaturesPage;