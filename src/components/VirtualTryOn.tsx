import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera, Square, RotateCw, Download, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface JewelryItem {
  id: string;
  title: string;
  category: 'necklace' | 'earring' | 'ring' | 'bracelet' | 'pendant' | 'other';
  type: 'gold' | 'silver';
  purity: string;
  image_url: string | null;
}

interface VirtualTryOnProps {
  products: JewelryItem[];
}

export const VirtualTryOn = ({ products }: VirtualTryOnProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<JewelryItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [faceMesh, setFaceMesh] = useState<any>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 640, height: 480 });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number>(0);
  
  const { toast } = useToast();

  // Filter products for AR try-on (earrings and necklaces)
  const tryOnProducts = products.filter(p => 
    p.category === 'earring' || p.category === 'necklace'
  );

  useEffect(() => {
    const initializeFaceMesh = async () => {
      if (!isCameraOn) return;
      
      try {
        setIsLoading(true);
        
        // Initialize MediaPipe Face Mesh
        const { FaceMesh } = await import('@mediapipe/face_mesh');
        const { Camera } = await import('@mediapipe/camera_utils');
        
        const faceM = new FaceMesh({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
        });
        
        faceM.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
        
        faceM.onResults((results) => {
          if (canvasRef.current && videoRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw video frame
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            
            // Draw face landmarks and overlays
            if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
              const landmarks = results.multiFaceLandmarks[0];
              drawJewelryOverlay(ctx, landmarks);
            }
          }
        });
        
        setFaceMesh(faceM);
        
        // Initialize camera
        if (videoRef.current) {
          const camera = new Camera(videoRef.current, {
            onFrame: async () => {
              if (videoRef.current && faceM) {
                await faceM.send({ image: videoRef.current });
              }
            },
            width: canvasSize.width,
            height: canvasSize.height,
          });
          camera.start();
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing Face Mesh:', error);
        toast({
          title: 'Error',
          description: 'Failed to initialize AR camera. Please try again.',
          variant: 'destructive',
        });
        setIsLoading(false);
      }
    };
    
    initializeFaceMesh();
  }, [isCameraOn, canvasSize, toast]);

  const drawJewelryOverlay = (ctx: CanvasRenderingContext2D, landmarks: any[]) => {
    if (!selectedProduct?.image_url) return;
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (selectedProduct.category === 'earring') {
        drawEarrings(ctx, landmarks, img);
      } else if (selectedProduct.category === 'necklace') {
        drawNecklace(ctx, landmarks, img);
      }
    };
    img.src = selectedProduct.image_url;
  };

  const drawEarrings = (ctx: CanvasRenderingContext2D, landmarks: any[], img: HTMLImageElement) => {
    // Left ear position (landmark 234)
    const leftEar = landmarks[234];
    if (leftEar) {
      const x = leftEar.x * canvasSize.width;
      const y = leftEar.y * canvasSize.height;
      const size = 50; // Adjust size as needed
      ctx.drawImage(img, x - size/2, y - size/2, size, size);
    }
    
    // Right ear position (landmark 454)
    const rightEar = landmarks[454];
    if (rightEar) {
      const x = rightEar.x * canvasSize.width;
      const y = rightEar.y * canvasSize.height;
      const size = 50; // Adjust size as needed
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(img, -x - size/2, y - size/2, size, size);
      ctx.restore();
    }
  };

  const drawNecklace = (ctx: CanvasRenderingContext2D, landmarks: any[], img: HTMLImageElement) => {
    // Neck area (approximate position based on chin landmark)
    const chin = landmarks[152];
    if (chin) {
      const x = chin.x * canvasSize.width;
      const y = chin.y * canvasSize.height + 50; // Offset below chin
      const width = 200; // Adjust width as needed
      const height = 80; // Adjust height as needed
      ctx.drawImage(img, x - width/2, y, width, height);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: canvasSize.width,
          height: canvasSize.height,
          facingMode: 'user'
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraOn(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: 'Camera Error',
        description: 'Please allow camera access to use the virtual try-on feature.',
        variant: 'destructive',
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOn(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const capturePhoto = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `virtual-tryon-${selectedProduct?.title || 'capture'}.png`;
      link.href = canvasRef.current.toDataURL();
      link.click();
      
      toast({
        title: 'Photo Captured',
        description: 'Your virtual try-on photo has been saved!',
      });
    }
  };

  const handleProductSelect = (productId: string) => {
    const product = tryOnProducts.find(p => p.id === productId);
    setSelectedProduct(product || null);
  };

  const handleClose = () => {
    stopCamera();
    setIsOpen(false);
    setSelectedProduct(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Camera className="h-4 w-4" />
          Virtual Try-On
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Virtual Try-On - AR Experience
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-6 space-y-4">
          {/* Product Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Jewelry to Try On</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select onValueChange={handleProductSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose earrings or necklace..." />
                </SelectTrigger>
                <SelectContent>
                  {tryOnProducts.map(product => (
                    <SelectItem key={product.id} value={product.id}>
                      <div className="flex items-center gap-2">
                        {product.image_url && (
                          <img 
                            src={product.image_url} 
                            alt={product.title}
                            className="w-8 h-8 object-cover rounded"
                          />
                        )}
                        <span>{product.title}</span>
                        <Badge variant="outline" className="ml-2">
                          {product.category}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedProduct && (
                <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                  {selectedProduct.image_url && (
                    <img 
                      src={selectedProduct.image_url} 
                      alt={selectedProduct.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold">{selectedProduct.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedProduct.type} • {selectedProduct.purity}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Separator />

          {/* Camera Controls */}
          <div className="flex items-center gap-4">
            {!isCameraOn ? (
              <Button 
                onClick={startCamera}
                disabled={!selectedProduct}
                className="flex items-center gap-2"
              >
                <Camera className="h-4 w-4" />
                Start Camera
              </Button>
            ) : (
              <Button 
                onClick={stopCamera}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Square className="h-4 w-4" />
                Stop Camera
              </Button>
            )}
            
            {isCameraOn && (
              <>
                <Button 
                  onClick={capturePhoto}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Capture Photo
                </Button>
                
                <Button 
                  onClick={() => setCanvasSize(prev => ({ 
                    width: prev.height, 
                    height: prev.width 
                  }))}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RotateCw className="h-4 w-4" />
                  Rotate
                </Button>
              </>
            )}
          </div>

          {/* AR Preview */}
          <Card className="relative">
            <CardContent className="p-0">
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  style={{ display: isCameraOn ? 'block' : 'none' }}
                  className="w-full h-auto"
                />
                <canvas
                  ref={canvasRef}
                  width={canvasSize.width}
                  height={canvasSize.height}
                  className="absolute top-0 left-0 w-full h-full"
                  style={{ display: isCameraOn ? 'block' : 'none' }}
                />
                
                {!isCameraOn && (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    <div className="text-center">
                      <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p>Select a product and start camera to begin virtual try-on</p>
                    </div>
                  </div>
                )}
                
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="text-white text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                      <p>Loading AR...</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">How to use Virtual Try-On:</h3>
              <ol className="space-y-1 text-sm text-muted-foreground">
                <li>1. Select earrings or necklace from the dropdown</li>
                <li>2. Click "Start Camera" to begin AR experience</li>
                <li>3. Position your face in the camera view</li>
                <li>4. The jewelry will appear on your face in real-time</li>
                <li>5. Capture photos to save your virtual try-on</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};