"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/Button";
import { Camera, X } from "lucide-react";

interface QRScannerProps {
  onScan: (decodedText: string) => void;
  onError?: (error: string) => void;
  onClose: () => void;
}

export function QRScanner({ onScan, onError, onClose }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasCamera, setHasCamera] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    const initScanner = async () => {
      try {
        // Check if camera is available
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          const scanner = new Html5Qrcode("qr-reader");
          scannerRef.current = scanner;
          
          await scanner.start(
            { facingMode: "environment" }, // Use back camera on mobile
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1,
            },
            (decodedText) => {
              // Successfully scanned
              onScan(decodedText);
              scanner.stop().catch(console.error);
            },
            (errorMessage) => {
              // Scan error (no QR found in frame) - this is normal during scanning
              // Only report critical errors
              if (errorMessage.includes("Permission")) {
                setPermissionDenied(true);
                onError?.("Camera permission denied");
              }
            }
          );
          setIsScanning(true);
        } else {
          setHasCamera(false);
          onError?.("No camera found on this device");
        }
      } catch (err: any) {
        console.error("Scanner init error:", err);
        if (err.message?.includes("Permission") || err.name === "NotAllowedError") {
          setPermissionDenied(true);
          onError?.("Camera permission denied. Please allow camera access.");
        } else {
          setHasCamera(false);
          onError?.("Could not access camera: " + (err.message || "Unknown error"));
        }
      }
    };

    initScanner();

    // Cleanup
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, [onScan, onError]);

  const handleClose = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch (e) {
        console.error("Error stopping scanner:", e);
      }
      scannerRef.current = null;
    }
    onClose();
  };

  if (permissionDenied) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Camera className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Camera Access Denied
            </h3>
            <p className="text-slate-600 mb-6">
              Please allow camera access in your browser settings to scan QR codes.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={handleClose}>
                Close
              </Button>
              <Button 
                className="flex-1" 
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!hasCamera) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <Camera className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No Camera Found
            </h3>
            <p className="text-slate-600 mb-6">
              This device doesn&apos;t have a camera or it&apos;s not accessible.
            </p>
            <Button className="w-full" onClick={handleClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">
            Scan QR Code
          </h3>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Scanner */}
        <div className="p-4">
          <div className="relative aspect-square max-w-sm mx-auto bg-slate-900 rounded-xl overflow-hidden">
            <div id="qr-reader" className="w-full h-full" />
            
            {/* Scan frame overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-sky-500" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-sky-500" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-sky-500" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-sky-500" />
              </div>
            </div>

            {/* Scanning indicator */}
            {!isScanning && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-center text-white">
                  <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-sm">Initializing camera...</p>
                </div>
              </div>
            )}
          </div>

          <p className="text-center text-sm text-slate-500 mt-4">
            Point your camera at a patient&apos;s QR code
          </p>
        </div>
      </div>
    </div>
  );
}
