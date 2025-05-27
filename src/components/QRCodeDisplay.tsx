"use client";

import QRCode from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, QrCodeIcon } from 'lucide-react';
import { useRef } from 'react';

interface QRCodeDisplayProps {
  value: string;
  attendeeName: string;
}

export function QRCodeDisplay({ value, attendeeName }: QRCodeDisplayProps) {
  const qrRef = useRef<HTMLDivElement>(null);

  const downloadQRCode = () => {
    if (qrRef.current) {
      const canvas = qrRef.current.querySelector('canvas');
      if (canvas) {
        const pngUrl = canvas
          .toDataURL('image/png')
          .replace('image/png', 'image/octet-stream');
        let downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `${attendeeName.replace(/\s+/g, '_')}_qr.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-8 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <QrCodeIcon className="h-6 w-6 text-primary" />
          <CardTitle>QR Code Generated!</CardTitle>
        </div>
        <CardDescription>
          QR code for <span className="font-semibold text-primary">{attendeeName}</span>. Scan this code to check in.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center p-6">
        <div ref={qrRef} className="p-4 bg-white rounded-lg shadow-inner">
          <QRCode value={value} size={256} level="H" includeMargin={true} />
        </div>
        <p className="mt-4 text-xs text-muted-foreground break-all">Value: {value}</p>
      </CardContent>
      <CardFooter>
        <Button onClick={downloadQRCode} className="w-full">
          <Download className="mr-2 h-4 w-4" />
          Download QR Code (PNG)
        </Button>
      </CardFooter>
    </Card>
  );
}
