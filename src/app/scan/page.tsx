
"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import jsQR from 'jsqr';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Camera, AlertTriangle, QrCode, VideoOff } from 'lucide-react';
// No explicit useAuth needed here if scanning is public, but could be added for user-specific features.

export default function ScanPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isLoadingCamera, setIsLoadingCamera] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const getCameraPermission = async () => {
      setIsLoadingCamera(true);
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasCameraPermission(false);
        setScanError("Camera access is not supported by your browser.");
        toast({ variant: "destructive", title: "Camera Not Supported", description: "Your browser does not support camera access." });
        setIsLoadingCamera(false);
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        setScanError('Camera access denied. Please enable camera permissions in your browser settings.');
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings.',
        });
      } finally {
        setIsLoadingCamera(false);
      }
    };

    getCameraPermission();
    
    return () => { 
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current || !videoRef.current.videoWidth || !videoRef.current.srcObject || (videoRef.current.srcObject as MediaStream).getVideoTracks().length === 0) {
        if (isScanning) requestAnimationFrame(scanQRCode); // Keep trying if video not ready but scanning active
        return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });

      if (code) {
        setIsScanning(false); 
        
        // Validate if it's a URL and an attendee link from our app
        try {
          const url = new URL(code.data);
          if (url.pathname.startsWith('/attendee/')) {
            router.push(url.pathname); // Navigate to the path part e.g. /attendee/xyz
            toast({ title: "QR Code Scanned!", description: "Redirecting to attendee page..." });
          } else {
            setScanError("Invalid QR code. Please scan a SwiftCheck attendee QR code.");
            toast({ variant: "destructive", title: "Invalid QR Code", description: "Not a valid attendee QR code." });
            setTimeout(() => { setScanError(null); setIsScanning(true); }, 3000); 
          }
        } catch (e) { // Not a valid URL
          setScanError("Invalid QR code content. Please scan a SwiftCheck attendee QR code.");
          toast({ variant: "destructive", title: "Invalid QR Content", description: "The QR code does not contain a valid link." });
          setTimeout(() => { setScanError(null); setIsScanning(true); }, 3000);
        }
      } else if (isScanning) {
        requestAnimationFrame(scanQRCode); 
      }
    }
  };

  useEffect(() => {
    let animationFrameId: number;
    if (isScanning && hasCameraPermission && videoRef.current) {
      videoRef.current.play().then(() => {
        animationFrameId = requestAnimationFrame(scanQRCode);
      }).catch(err => {
        console.error("Error playing video:", err);
        setScanError("Could not start camera video playback.");
        setIsScanning(false);
      });
    }
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isScanning, hasCameraPermission]);


  const handleStartScan = () => {
    if (!hasCameraPermission) {
      toast({ variant: "destructive", title: "Camera Permission Needed", description: "Allow camera access to scan." });
      return;
    }
    setScanError(null);
    setIsScanning(true);
  };
  
  return (
    <Card className="w-full max-w-lg mx-auto shadow-xl my-8">
      <CardHeader className="text-center">
        <QrCode className="mx-auto h-12 w-12 text-primary mb-2" />
        <CardTitle>Scan QR Code</CardTitle>
        <CardDescription>Point your camera at an attendee's QR code to view their details or check them in.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-6 p-6">
        <div className="w-full aspect-[4/3] bg-muted rounded-lg overflow-hidden relative border border-dashed">
          {isLoadingCamera && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-10">
              <Camera className="h-12 w-12 mb-2 animate-pulse text-primary" />
              <p className="text-muted-foreground">Initializing camera...</p>
            </div>
          )}
          <video 
            ref={videoRef} 
            className={cn("w-full h-full object-cover", isLoadingCamera && "opacity-0")} 
            autoPlay 
            playsInline 
            muted 
          />
          {!isLoadingCamera && !hasCameraPermission && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white p-4">
              <VideoOff className="h-16 w-16 mb-3" />
              <p className="text-center font-semibold text-lg">Camera Access Required</p>
              <p className="text-center text-sm">Please enable camera permissions in your browser settings to scan QR codes.</p>
            </div>
          )}
           {!isLoadingCamera && hasCameraPermission && !isScanning && (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 p-4 z-10">
                <QrCode className="h-16 w-16 mb-3 text-white/70" />
             </div>
           )}
        </div>
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {scanError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Scan Error</AlertTitle>
            <AlertDescription>{scanError}</AlertDescription>
          </Alert>
        )}
        
        {!isLoadingCamera && hasCameraPermission && !isScanning && (
          <Button onClick={handleStartScan} className="w-full" size="lg">
            <Camera className="mr-2 h-5 w-5" /> Start Scanning
          </Button>
        )}
        {isScanning && <p className="text-primary font-semibold animate-pulse text-lg">Scanning for QR Code...</p>}
      </CardContent>
    </Card>
  );
}
