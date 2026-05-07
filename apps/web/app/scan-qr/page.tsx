"use client";

import { useState, useRef, Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { QRScanner } from "@/components/qr/QRScanner";
import {
  QrCode,
  Camera,
  Upload,
  CheckCircle2,
  Heart,
  Activity,
  Clock,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface PatientData {
  patient: {
    id: string;
    name: string;
    status: string;
    location: string;
    consentEnabled: boolean;
  };
  tasks: Array<{
    id: string;
    title: string;
    status: string;
  }>;
  notes: Array<{
    id: string;
    author: string;
    text: string;
    createdAt: string;
  }>;
}

function ScanQRContent() {
  const [showScanner, setShowScanner] = useState(false);
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractPatientIdFromQR = (qrData: string): string | null => {
    try {
      const url = new URL(qrData);
      const match = url.pathname.match(/\/qr\/(.+)/);
      return match ? match[1] : null;
    } catch {
      const match = qrData.match(/\/qr\/(.+)/);
      return match ? match[1] : qrData;
    }
  };

  const fetchPatientData = async (patientId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/qr/${patientId}`);
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("Family access is disabled for this patient");
        }
        if (response.status === 404) {
          throw new Error("Patient not found");
        }
        throw new Error("Failed to load patient data");
      }
      const data = await response.json();
      setPatientData(data);
    } catch (err: any) {
      setError(err.message || "Failed to load patient data");
    } finally {
      setLoading(false);
    }
  };

  const handleScanSuccess = async (decodedText: string) => {
    setShowScanner(false);
    const patientId = extractPatientIdFromQR(decodedText);
    if (patientId) {
      await fetchPatientData(patientId);
    } else {
      setError("Invalid QR code format");
    }
  };

  const handleScanError = (errorMessage: string) => {
    setError(errorMessage);
    setShowScanner(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      // For file upload, we'll try to use the first demo patient
      // In production, you'd decode the QR from the image
      await fetchPatientData("p1");
    } catch (err: any) {
      setError(err.message || "Failed to process image");
    } finally {
      setLoading(false);
    }
  };

  const resetScan = () => {
    setPatientData(null);
    setError(null);
    setShowScanner(false);
  };

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("stable")) return "bg-emerald-100 text-emerald-800 border-emerald-200";
    if (s.includes("critical")) return "bg-red-100 text-red-800 border-red-200";
    if (s.includes("surgery")) return "bg-blue-100 text-blue-800 border-blue-200";
    if (s.includes("recover")) return "bg-amber-100 text-amber-800 border-amber-200";
    if (s.includes("discharge")) return "bg-purple-100 text-purple-800 border-purple-200";
    return "bg-slate-100 text-slate-800 border-slate-200";
  };

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Access Denied
            </h1>
            <p className="text-slate-600">{error}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" className="gap-2" onClick={resetScan}>
              <ArrowLeft className="w-4 h-4" />
              Try Again
            </Button>
            <Link href="/login" className="inline-flex">
              <Button className="gap-2">
                Sign In for Full Access
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (patientData) {
    const { patient, tasks, notes } = patientData;
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
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

          <Card className="mb-6 overflow-hidden">
            <div className="bg-gradient-to-r from-sky-600 to-blue-700 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{patient.name}</h2>
                  <p className="text-sky-100">{patient.location}</p>
                </div>
                <Badge className={getStatusColor(patient.status)}>
                  {patient.status}
                </Badge>
              </div>
            </div>
            <CardContent className="p-6">
              <div className="mb-6">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-sky-500" />
                  Care Tasks
                </h3>
                {tasks.length === 0 ? (
                  <p className="text-sm text-slate-500">No tasks available</p>
                ) : (
                  <div className="space-y-2">
                    {tasks.slice(0, 5).map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                      >
                        <span className={task.status === "done" ? "line-through text-slate-400" : "text-slate-900"}>
                          {task.title}
                        </span>
                        <Badge className={task.status === "done" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}>
                          {task.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-sky-500" />
                  Recent Updates
                </h3>
                {notes.length === 0 ? (
                  <p className="text-sm text-slate-500">No updates available</p>
                ) : (
                  <div className="space-y-3">
                    {notes.slice(0, 3).map((note) => (
                      <div
                        key={note.id}
                        className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg"
                      >
                        <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-semibold text-sm">
                          {note.author.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{note.author}</p>
                          <p className="text-sm text-slate-700">{note.text}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {new Date(note.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="outline" className="flex-1 gap-2" onClick={resetScan}>
              <ArrowLeft className="w-4 h-4" />
              Scan Another Code
            </Button>
            <Link href="/family-portal" className="inline-flex flex-1">
              <Button className="flex-1 gap-2">
                <Heart className="w-4 h-4" />
                Family Portal
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Scan QR Code</h1>
          <p className="text-slate-600">Scan a patient&apos;s QR code to access their real-time status.</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <Card className="mb-6">
          <CardContent className="p-8">
            <div className="aspect-square max-w-md mx-auto relative bg-slate-900 rounded-2xl overflow-hidden">
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-lg font-medium">Loading...</p>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white/50">
                    <QrCode className="w-24 h-24 mx-auto mb-4" />
                    <p className="text-lg">QR Scanner</p>
                    <p className="text-sm">Click the button below to scan</p>
                  </div>
                </div>
              )}

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

        <div className="space-y-4">
          <Button
            size="lg"
            className="w-full gap-2"
            onClick={() => setShowScanner(true)}
            disabled={loading}
          >
            <Camera className="w-5 h-5" />
            Open Camera Scanner
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
              disabled={loading}
            >
              <Upload className="w-5 h-5" />
              Upload QR Code Image
            </Button>
          </div>
        </div>

        <div className="mt-8 p-6 bg-blue-50 rounded-xl">
          <h3 className="font-semibold text-slate-900 mb-3">How QR Access Works</h3>
          <ol className="space-y-2 text-slate-600">
            <li className="flex items-start gap-2">
              <span className="font-semibold text-sky-600">1.</span>
              Healthcare staff generates a unique QR code for the patient
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-sky-600">2.</span>
              Family scans the QR code with any phone camera
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-sky-600">3.</span>
              Instant access to approved patient information - no app needed!
            </li>
          </ol>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          No app download required. Works on any device with a camera.
        </p>
      </div>

      {showScanner && (
        <QRScanner
          onScan={handleScanSuccess}
          onError={handleScanError}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}

export default function ScanQRPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-600">Loading...</p>
      </div>
    </div>}>
      <ScanQRContent />
    </Suspense>
  );
}
