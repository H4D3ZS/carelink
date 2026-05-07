"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  QrCode,
  Camera,
  Upload,
  CheckCircle2,
  Heart,
  Activity,
  Clock,
  ArrowLeft,
  Share2,
} from "lucide-react";

// Mock patient data for demo
const mockPatientData = {
  name: "John Mitchell",
  age: 68,
  status: "stable",
  location: "Room 302, Cardiac Unit",
  admissionDate: "2024-01-15",
  lastUpdated: "2 minutes ago",
  vitals: {
    heartRate: 72,
    bloodPressure: "120/80",
    temperature: 98.6,
    oxygenLevel: 98,
  },
  updates: [
    { time: "2 min ago", message: "Vitals updated - Blood pressure stable" },
    { time: "15 min ago", message: "Pain medication administered" },
    { time: "1 hour ago", message: "Doctor visit completed" },
  ],
};

export default function ScanQRPage() {
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleScan = () => {
    setScanning(true);
    // Simulate scanning delay
    setTimeout(() => {
      setScanning(false);
      setScanned(true);
    }, 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setScanning(true);
      setTimeout(() => {
        setScanning(false);
        setScanned(true);
      }, 1500);
    }
  };

  const resetScan = () => {
    setScanned(false);
    setScanning(false);
  };

  if (scanned) {
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Patient Information Found
            </h1>
            <p className="text-slate-600">
              You now have access to real-time updates for this patient.
            </p>
          </div>

          {/* Patient Card */}
          <Card className="mb-6 overflow-hidden">
            <div className="bg-gradient-to-r from-sky-600 to-blue-700 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{mockPatientData.name}</h2>
                  <p className="text-sky-100">
                    {mockPatientData.age} years old • {mockPatientData.location}
                  </p>
                </div>
                <Badge className="bg-emerald-400/30 text-white border-emerald-400/50">
                  Stable
                </Badge>
              </div>
            </div>
            <CardContent className="p-6">
              {/* Vitals Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-rose-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-5 h-5 text-rose-500" />
                    <span className="text-sm text-slate-600">Heart Rate</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">
                    {mockPatientData.vitals.heartRate}
                    <span className="text-sm font-normal text-slate-500 ml-1">bpm</span>
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-5 h-5 text-blue-500" />
                    <span className="text-sm text-slate-600">Blood Pressure</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">
                    {mockPatientData.vitals.bloodPressure}
                  </p>
                </div>
                <div className="p-4 bg-amber-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-amber-500" />
                    <span className="text-sm text-slate-600">Temperature</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">
                    {mockPatientData.vitals.temperature}°
                    <span className="text-sm font-normal text-slate-500">F</span>
                  </p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm text-slate-600">Oxygen Level</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">
                    {mockPatientData.vitals.oxygenLevel}
                    <span className="text-sm font-normal text-slate-500">%</span>
                  </p>
                </div>
              </div>

              {/* Recent Updates */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-4">Recent Updates</h3>
                <div className="space-y-3">
                  {mockPatientData.updates.map((update, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg"
                    >
                      <div className="w-2 h-2 rounded-full bg-sky-500 mt-2" />
                      <div className="flex-1">
                        <p className="text-slate-900">{update.message}</p>
                        <p className="text-sm text-slate-500">{update.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="outline" className="flex-1 gap-2" onClick={resetScan}>
              <ArrowLeft className="w-4 h-4" />
              Scan Another Code
            </Button>
            <Button className="flex-1 gap-2">
              <Share2 className="w-4 h-4" />
              Share Access
            </Button>
          </div>

          <p className="text-center text-sm text-slate-500 mt-6">
            This is a demo page. In production, patient data is securely fetched from the server.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Scan QR Code</h1>
          <p className="text-slate-600">Scan a patient's QR code to access their real-time status.</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Scanner Container */}
        <Card className="mb-6">
          <CardContent className="p-8">
            <div className="aspect-square max-w-md mx-auto relative bg-slate-900 rounded-2xl overflow-hidden">
              {scanning ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-lg font-medium">Scanning...</p>
                    <p className="text-sm text-white/70">Processing QR code</p>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white/50">
                    <QrCode className="w-24 h-24 mx-auto mb-4" />
                    <p className="text-lg">Camera preview will appear here</p>
                    <p className="text-sm">Point your camera at a QR code</p>
                  </div>
                </div>
              )}

              {/* Scan Frame Overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-sky-500" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-sky-500" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-sky-500" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-sky-500" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button
            size="lg"
            className="w-full gap-2"
            onClick={handleScan}
            disabled={scanning}
          >
            <Camera className="w-5 h-5" />
            {scanning ? "Scanning..." : "Simulate Camera Scan"}
          </Button>

          <div className="relative">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <Button
              variant="outline"
              size="lg"
              className="w-full gap-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={scanning}
            >
              <Upload className="w-5 h-5" />
              Upload QR Code Image
            </Button>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 p-6 bg-blue-50 rounded-xl">
          <h3 className="font-semibold text-slate-900 mb-3">How to Scan</h3>
          <ol className="space-y-2 text-slate-600">
            <li className="flex items-start gap-2">
              <span className="font-semibold text-sky-600">1.</span>
              Point your camera at the patient's QR code
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-sky-600">2.</span>
              Hold steady until the code is recognized
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-sky-600">3.</span>
              View real-time patient status instantly
            </li>
          </ol>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          No app download required. Works on any device with a camera.
        </p>
      </div>
    </div>
  );
}
