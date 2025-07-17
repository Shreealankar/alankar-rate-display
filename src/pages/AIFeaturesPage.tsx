import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { QualityAssessment } from '@/components/QualityAssessment';
import { PersonalizedStyling } from '@/components/PersonalizedStyling';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Camera, User, Zap, Shield, Heart } from 'lucide-react';

const AIFeaturesPage = () => {
  const [activeTab, setActiveTab] = useState('quality');

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold">AI-Powered Features</h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the future of jewelry with our advanced AI technology for quality assessment and personalized styling
            </p>
          </div>

          {/* Features Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <Card className="border-2 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => setActiveTab('quality')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Quality Assessment
                  <Badge variant="secondary">AI-Powered</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Upload jewelry images for AI-powered authenticity verification, quality analysis, and detailed assessment reports.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">Authenticity Check</Badge>
                  <Badge variant="outline">Quality Analysis</Badge>
                  <Badge variant="outline">Defect Detection</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => setActiveTab('styling')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  Personalized Styling
                  <Badge variant="secondary">AI Consultant</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Get personalized jewelry recommendations based on your style preferences, lifestyle, and special occasions.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">Style Analysis</Badge>
                  <Badge variant="outline">Personal Recommendations</Badge>
                  <Badge variant="outline">Occasion Matching</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Features Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="quality" className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Quality Assessment
              </TabsTrigger>
              <TabsTrigger value="styling" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Personalized Styling
              </TabsTrigger>
            </TabsList>

            <TabsContent value="quality">
              <QualityAssessment />
            </TabsContent>

            <TabsContent value="styling">
              <PersonalizedStyling />
            </TabsContent>
          </Tabs>

          {/* Technology Info */}
          <Card className="mt-12">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Powered by Advanced AI
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="font-semibold mb-2">Computer Vision</h3>
                  <p className="text-sm text-muted-foreground">
                    Advanced image recognition for jewelry analysis and quality assessment
                  </p>
                </div>
                <div className="text-center">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="font-semibold mb-2">Machine Learning</h3>
                  <p className="text-sm text-muted-foreground">
                    AI models trained on thousands of jewelry images for accurate predictions
                  </p>
                </div>
                <div className="text-center">
                  <Heart className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="font-semibold mb-2">Personalization</h3>
                  <p className="text-sm text-muted-foreground">
                    Intelligent recommendations based on individual preferences and style
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