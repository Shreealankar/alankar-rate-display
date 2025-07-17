import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, Camera, Check, X, AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface QualityReport {
  authenticity: number;
  purity: string;
  quality: string;
  defects: string[];
  recommendations: string[];
}

export const QualityAssessment = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [report, setReport] = useState<QualityReport | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setReport(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const assessQuality = async () => {
    if (!selectedImage) {
      toast({
        title: 'Error',
        description: 'Please upload an image first',
        variant: 'destructive',
      });
      return;
    }

    setProcessing(true);
    
    try {
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate mock assessment report
      const mockReport: QualityReport = {
        authenticity: Math.floor(Math.random() * 20) + 80, // 80-100%
        purity: ['18K', '20K', '22K', '24K'][Math.floor(Math.random() * 4)],
        quality: ['Excellent', 'Good', 'Fair'][Math.floor(Math.random() * 3)],
        defects: [
          'Minor surface scratches',
          'Slight color variation',
          'Small inclusion visible'
        ].slice(0, Math.floor(Math.random() * 3)),
        recommendations: [
          'Professional cleaning recommended',
          'Store in protective case',
          'Regular inspection advised'
        ]
      };
      
      setReport(mockReport);
      
      toast({
        title: 'Assessment Complete',
        description: 'Quality assessment has been generated',
      });
    } catch (error) {
      console.error('Quality assessment error:', error);
      toast({
        title: 'Error',
        description: 'Failed to assess quality. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const getAuthenticityColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAuthenticityIcon = (score: number) => {
    if (score >= 90) return <Check className="h-5 w-5 text-green-600" />;
    if (score >= 80) return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    return <X className="h-5 w-5 text-red-600" />;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">AI Quality Assessment</h2>
        <p className="text-muted-foreground">
          Upload jewelry images for AI-powered authenticity verification and quality analysis
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Upload Image
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {selectedImage ? (
                  <div className="space-y-4">
                    <img
                      src={selectedImage}
                      alt="Selected jewelry"
                      className="mx-auto max-h-48 rounded-lg object-cover"
                    />
                    <p className="text-sm text-muted-foreground">
                      Click to change image
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                    <div>
                      <p className="font-medium">Click to upload jewelry image</p>
                      <p className="text-sm text-muted-foreground">
                        Support: JPG, PNG, WebP (max 10MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              
              <Button
                onClick={assessQuality}
                disabled={!selectedImage || processing}
                className="w-full"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4 mr-2" />
                    Assess Quality
                  </>
                )}
              </Button>
              
              {processing && (
                <div className="space-y-2">
                  <Progress value={33} className="w-full" />
                  <p className="text-sm text-center text-muted-foreground">
                    AI is analyzing your jewelry...
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Assessment Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            {report ? (
              <div className="space-y-6">
                {/* Authenticity Score */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {getAuthenticityIcon(report.authenticity)}
                    <span className={`text-2xl font-bold ${getAuthenticityColor(report.authenticity)}`}>
                      {report.authenticity}%
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">Authenticity Confidence</p>
                </div>

                {/* Quality Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Purity</p>
                    <Badge variant="outline">{report.purity}</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Quality</p>
                    <Badge variant="outline">{report.quality}</Badge>
                  </div>
                </div>

                {/* Defects */}
                {report.defects.length > 0 && (
                  <div>
                    <p className="font-medium mb-2">Detected Issues</p>
                    <ul className="space-y-1">
                      {report.defects.map((defect, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                          <AlertTriangle className="h-3 w-3" />
                          {defect}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendations */}
                <div>
                  <p className="font-medium mb-2">Recommendations</p>
                  <ul className="space-y-1">
                    {report.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                        <Check className="h-3 w-3" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Confidence Alert */}
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    This assessment is AI-generated and should be verified by a professional jeweler for critical decisions.
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <div className="text-center py-8">
                <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Upload an image to get started with AI quality assessment
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};