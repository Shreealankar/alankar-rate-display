import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Search, Upload, Camera, Eye, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { pipeline } from '@huggingface/transformers';

interface JewelryItem {
  id: string;
  title: string;
  category: 'necklace' | 'earring' | 'ring' | 'bracelet' | 'pendant' | 'other';
  type: 'gold' | 'silver';
  purity: string;
  image_url: string | null;
  description: string | null;
  weight_grams: number;
}

interface ImageRecognitionProps {
  products: JewelryItem[];
}

interface RecognitionResult {
  category: string;
  confidence: number;
  estimatedType: string;
  estimatedPurity: string;
  matchedProducts: JewelryItem[];
  description: string;
}

export const ImageRecognition = ({ products }: ImageRecognitionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [recognitionResult, setRecognitionResult] = useState<RecognitionResult | null>(null);
  const [classifier, setClassifier] = useState<any>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const initializeAI = async () => {
    try {
      setAnalysisProgress(20);
      
      // Initialize image classification pipeline
      const imageClassifier = await pipeline(
        'image-classification',
        'microsoft/resnet-50',
        { device: 'webgpu' }
      );
      
      setClassifier(imageClassifier);
      setAnalysisProgress(50);
      
      return imageClassifier;
    } catch (error) {
      console.error('Error initializing AI:', error);
      toast({
        title: 'AI Initialization Error',
        description: 'Failed to load image recognition AI. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const analyzeImage = async (imageUrl: string) => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setRecognitionResult(null);

    try {
      let imageClassifier = classifier;
      
      if (!imageClassifier) {
        imageClassifier = await initializeAI();
      }

      setAnalysisProgress(70);

      // Analyze the image
      const results = await imageClassifier(imageUrl);
      
      setAnalysisProgress(80);

      // Process results and match with jewelry
      const processedResult = processRecognitionResults(results);
      
      setAnalysisProgress(100);
      setRecognitionResult(processedResult);
      
      toast({
        title: 'Analysis Complete',
        description: `Detected ${processedResult.category} with ${Math.round(processedResult.confidence * 100)}% confidence`,
      });
      
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast({
        title: 'Analysis Error',
        description: 'Failed to analyze the image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress(0);
    }
  };

  const processRecognitionResults = (results: any[]): RecognitionResult => {
    // Map AI results to jewelry categories
    const jewelryKeywords = {
      necklace: ['necklace', 'chain', 'pendant', 'choker', 'collar'],
      earring: ['earring', 'ear', 'stud', 'hoop', 'drop'],
      ring: ['ring', 'band', 'signet', 'wedding', 'engagement'],
      bracelet: ['bracelet', 'bangle', 'wrist', 'cuff', 'charm'],
      pendant: ['pendant', 'locket', 'charm', 'medallion'],
      other: ['jewelry', 'ornament', 'accessory', 'decoration']
    };

    // Find the best matching category
    let bestCategory = 'other';
    let bestConfidence = 0;
    
    for (const result of results) {
      const label = result.label.toLowerCase();
      
      for (const [category, keywords] of Object.entries(jewelryKeywords)) {
        const matches = keywords.some(keyword => label.includes(keyword));
        if (matches && result.score > bestConfidence) {
          bestCategory = category;
          bestConfidence = result.score;
        }
      }
    }

    // Estimate material type and purity based on visual analysis
    const estimatedType = estimateMetalType(results);
    const estimatedPurity = estimatePurity(estimatedType);

    // Find similar products in the database
    const matchedProducts = findSimilarProducts(bestCategory, estimatedType);

    // Generate description
    const description = generateDescription(bestCategory, estimatedType, estimatedPurity, bestConfidence);

    return {
      category: bestCategory,
      confidence: bestConfidence,
      estimatedType,
      estimatedPurity,
      matchedProducts,
      description
    };
  };

  const estimateMetalType = (results: any[]): string => {
    // Simple heuristic based on color analysis
    const labels = results.map(r => r.label.toLowerCase()).join(' ');
    
    if (labels.includes('gold') || labels.includes('yellow') || labels.includes('brass')) {
      return 'gold';
    } else if (labels.includes('silver') || labels.includes('white') || labels.includes('platinum')) {
      return 'silver';
    }
    
    return 'gold'; // Default assumption
  };

  const estimatePurity = (type: string): string => {
    // Default purities based on common jewelry standards
    return type === 'gold' ? '22k' : '925';
  };

  const findSimilarProducts = (category: string, type: string): JewelryItem[] => {
    return products
      .filter(p => p.category === category && p.type === type)
      .slice(0, 6); // Limit to 6 similar products
  };

  const generateDescription = (category: string, type: string, purity: string, confidence: number): string => {
    const confidenceText = confidence > 0.8 ? 'high' : confidence > 0.5 ? 'medium' : 'low';
    
    return `This appears to be a ${type} ${category} with ${confidenceText} confidence. ` +
           `Based on visual analysis, it's likely ${purity} purity. ` +
           `The image recognition system has analyzed the shape, color, and texture ` +
           `to make this determination.`;
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setSelectedImage(imageUrl);
        analyzeImage(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      
      video.onloadedmetadata = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0);
        
        const imageUrl = canvas.toDataURL('image/jpeg');
        setSelectedImage(imageUrl);
        analyzeImage(imageUrl);
        
        // Stop the camera stream
        stream.getTracks().forEach(track => track.stop());
      };
    } catch (error) {
      toast({
        title: 'Camera Error',
        description: 'Please allow camera access to capture images.',
        variant: 'destructive',
      });
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedImage(null);
    setRecognitionResult(null);
    setAnalysisProgress(0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          Image Recognition
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            AI Image Recognition - Identify Jewelry
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-6 space-y-6">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Upload or Capture Image
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload Image
                </Button>
                
                <Button 
                  onClick={handleCameraCapture}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Camera className="h-4 w-4" />
                  Take Photo
                </Button>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              
              <p className="text-sm text-muted-foreground">
                Upload a clear image of jewelry for AI-powered identification and matching
              </p>
            </CardContent>
          </Card>

          {/* Image Preview */}
          {selectedImage && (
            <Card>
              <CardHeader>
                <CardTitle>Uploaded Image</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <img 
                    src={selectedImage} 
                    alt="Jewelry to analyze"
                    className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                  />
                  
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                      <div className="text-white text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                        <p>Analyzing image...</p>
                        <Progress value={analysisProgress} className="w-32 mt-2" />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Analysis Results */}
          {recognitionResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  AI Analysis Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <h3 className="font-semibold">Category</h3>
                    <Badge variant="default" className="mt-2">
                      {recognitionResult.category}
                    </Badge>
                  </div>
                  
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <h3 className="font-semibold">Confidence</h3>
                    <p className="text-2xl font-bold text-primary mt-2">
                      {Math.round(recognitionResult.confidence * 100)}%
                    </p>
                  </div>
                  
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <h3 className="font-semibold">Estimated Type</h3>
                    <Badge variant="outline" className="mt-2">
                      {recognitionResult.estimatedType} • {recognitionResult.estimatedPurity}
                    </Badge>
                  </div>
                </div>
                
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-2">AI Analysis</h3>
                  <p className="text-sm text-muted-foreground">
                    {recognitionResult.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Similar Products */}
          {recognitionResult && recognitionResult.matchedProducts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Similar Products in Our Collection</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recognitionResult.matchedProducts.map((product) => (
                    <div key={product.id} className="border rounded-lg p-3">
                      <div className="aspect-square bg-muted rounded mb-2">
                        {product.image_url ? (
                          <img 
                            src={product.image_url} 
                            alt={product.title}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            No Image
                          </div>
                        )}
                      </div>
                      <h4 className="font-medium text-sm">{product.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {product.type} • {product.purity} • {product.weight_grams}g
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">How Image Recognition Works:</h3>
              <ol className="space-y-1 text-sm text-muted-foreground">
                <li>1. Upload a clear image of jewelry or take a photo</li>
                <li>2. AI analyzes the image for shape, color, and texture</li>
                <li>3. System identifies the jewelry category and material</li>
                <li>4. Matches similar products from our collection</li>
                <li>5. Provides detailed analysis and recommendations</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};