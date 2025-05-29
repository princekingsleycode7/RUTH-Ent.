
"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import jsQR from 'jsqr';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Camera, AlertTriangle, QrCode, VideoOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function ScanPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth(); // Assuming scan page requires authentication

  useEffect(() => {
    if (!isAuthenticated) {
        router.replace('/'); // Or a login page
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    const getCameraPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasCameraPermission(false);
        setScanError("Camera access is not supported by your browser.");
        toast({ variant: "destructive", title: "Camera Not Supported", description: "Your browser does not support camera access." });
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
      }
    };

    if (isAuthenticated) { // Only request camera if authenticated
        getCameraPermission();
    }
    
    return () => { // Cleanup: stop video stream when component unmounts
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]); // Rerun if isAuthenticated changes

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current || !videoRef.current.videoWidth) return;

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
        setIsScanning(false); // Stop scanning animation
        // Basic validation for our app's QR code format
        if (code.data.includes('/attendee/')) {
          router.push(code.data);
          toast({ title: "QR Code Scanned!", description: "Redirecting to attendee page..." });
        } else {
          setScanError("Invalid QR code format. Please scan a SwiftCheck attendee QR code.");
          toast({ variant: "destructive", title: "Invalid QR Code", description: "Not a valid attendee QR code." });
          setTimeout(() => setIsScanning(true), 2000); // Resume scanning after a delay
        }
      } else if (isScanning) {
        requestAnimationFrame(scanQRCode); // Continue scanning
      }
    }
  };

  useEffect(() => {
    if (isScanning && hasCameraPermission && videoRef.current) {
      videoRef.current.play().then(() => {
        requestAnimationFrame(scanQRCode);
      }).catch(err => {
        console.error("Error playing video:", err);
        setScanError("Could not start camera video playback.");
      });
    }
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

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Alert variant="destructive" className="w-full max-w-lg">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            You need to be logged in to access the QR scanner.
            <Link href="/" className="block mt-2 text-sm underline">Go to Home</Link>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-lg mx-auto shadow-xl">
      <CardHeader className="text-center">
        <QrCode className="mx-auto h-12 w-12 text-primary mb-2" />
        <CardTitle>Scan Attendee QR Code</CardTitle>
        <CardDescription>Point your camera at the QR code to check in an attendee.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <div className="w-full aspect-video bg-muted rounded-md overflow-hidden relative">
          <video 
            ref={videoRef} 
            className="w-full h-full object-cover" 
            autoPlay 
            playsInline 
            muted 
          />
          {!hasCameraPermission && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white p-4">
              <VideoOff className="h-12 w-12 mb-2" />
              <p className="text-center">Camera permission is required to scan QR codes.</p>
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

        {hasCameraPermission === false && !scanError && (
           <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Camera Access Required</AlertTitle>
              <AlertDescription>
                Please allow camera access in your browser settings to use this feature.
              </AlertDescription>
            </Alert>
        )}
        
        {hasCameraPermission && !isScanning && (
          <Button onClick={handleStartScan} className="w-full">
            <Camera className="mr-2 h-4 w-4" /> Start Scanning
          </Button>
        )}
        {isScanning && <p className="text-primary animate-pulse">Scanning...</p>}

      </CardContent>
    </Card>
  );
}

