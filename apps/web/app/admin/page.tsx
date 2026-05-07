"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { Input } from "@/components/ui/Input";
import { Heart, Bell, QrCode, Search, Settings, X, Download } from "lucide-react";
import { patientApi, Patient, Task, Note, getToken } from "@/lib/api";
import { QRCodeSVG } from "qrcode.react";

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "stable":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "critical":
      return "bg-red-100 text-red-800 border-red-200";
    case "recovering":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "surgery":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "discharge":
      return "bg-purple-100 text-purple-800 border-purple-200";
    default:
      return "bg-slate-100 text-slate-800 border-slate-200";
  }
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newTask, setNewTask] = useState("");
  const [newNote, setNewNote] = useState("");
  const [newAudience, setNewAudience] = useState<"staff" | "family">("family");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [consentToggleLoading, setConsentToggleLoading] = useState(false);
  const [qrPatient, setQrPatient] = useState<Patient | null>(null);

  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) return patients;
    const q = searchQuery.toLowerCase();
    return patients.filter((p) => p.name.toLowerCase().includes(q));
  }, [patients, searchQuery]);

  const selectedPatient = useMemo(
    () => filteredPatients.find((p) => p.id === selectedId) || null,
    [filteredPatients, selectedId]
  );

  const loadPatientData = async (id: string) => {
    setError(null);
    try {
      const [ts, ns] = await Promise.all([patientApi.listTasks(id), patientApi.listNotes(id)]);
      setTasks(ts);
      setNotes(ns);
    } catch (e: any) {
      setError(e?.message || "Failed to load patient data");
    }
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await patientApi.list();
      setPatients(list);
      const id = list[0]?.id || null;
      setSelectedId(id);
      if (id) await loadPatientData(id);
    } catch (e: any) {
      setError(e?.message || "Failed to load patients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!getToken()) {
      setError("Please login as staff/admin first.");
      setLoading(false);
      router.replace("/login?next=/admin");
      return;
    }
    load();
  }, [router]);

  const onSelectPatient = async (id: string) => {
    setSelectedId(id);
    await loadPatientData(id);
  };

  const onAddTask = async () => {
    if (!selectedPatient || !newTask.trim()) return;
    await patientApi.addTask(selectedPatient.id, newTask.trim()).catch((e) => setError(e?.message));
    setNewTask("");
    await loadPatientData(selectedPatient.id);
  };

  const onToggleTask = async (taskId: string) => {
    if (!selectedPatient) return;
    await patientApi.toggleTask(selectedPatient.id, taskId).catch((e) => setError(e?.message));
    await loadPatientData(selectedPatient.id);
  };

  const onAddNote = async () => {
    if (!selectedPatient || !newNote.trim()) return;
    await patientApi.addNote(selectedPatient.id, newNote.trim(), newAudience).catch((e) => setError(e?.message));
    setNewNote("");
    await loadPatientData(selectedPatient.id);
  };

  const onToggleConsent = async () => {
    if (!selectedPatient) return;
    setConsentToggleLoading(true);
    try {
      await patientApi.setConsent(selectedPatient.id, !selectedPatient.consentEnabled);
      await load();
    } catch (e: any) {
      setError(e?.message || "Consent update failed");
    } finally {
      setConsentToggleLoading(false);
    }
  };

  const getQRUrl = (patientId: string) => {
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    return `${base}/qr/${patientId}`;
  };

  const downloadQR = () => {
    if (!qrPatient) return;
    const svg = document.getElementById("qr-code-svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `carelink-qr-${qrPatient.name.replace(/\s+/g, "-").toLowerCase()}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-lg text-slate-900 hidden sm:block">
                  CareLink<span className="text-sky-600">QR</span>
                </span>
              </Link>
              <div className="h-6 w-px bg-slate-200 hidden sm:block" />
              <h1 className="font-semibold text-slate-900">Admin Dashboard</h1>
            </div>

            <div className="flex items-center gap-3">
              <button className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
              </button>
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-gradient-to-br from-sky-500 to-blue-600 text-white text-sm">
                    AD
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-slate-700 hidden md:block">
                  Admin
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && <p className="text-sm text-slate-600">Loading...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {!loading && !error && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search patients..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="gap-2">
                    <Settings className="w-4 h-4" />
                    Settings
                  </Button>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Patients</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {filteredPatients.map((p) => (
                      <div
                        key={p.id}
                        className={`w-full flex items-center justify-between p-3 rounded-lg border ${
                          selectedId === p.id ? "border-sky-300 bg-sky-50" : "border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <button
                          onClick={() => onSelectPatient(p.id)}
                          className="flex items-center gap-3 flex-1 text-left"
                        >
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-sky-100 text-sky-700 text-xs">
                              {p.name.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-slate-900">{p.name}</p>
                            <p className="text-xs text-slate-500">{p.location}</p>
                          </div>
                        </button>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(p.status)}>{p.status}</Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              setQrPatient(p);
                            }}
                            className="gap-1"
                          >
                            <QrCode className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {filteredPatients.length === 0 && <p className="text-sm text-slate-500">No patients.</p>}
                  </div>
                </CardContent>
              </Card>

              {selectedPatient && (
                <Card>
                  <CardHeader className="flex items-center justify-between">
                    <CardTitle>Consent & Tasks — {selectedPatient.name}</CardTitle>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={onToggleConsent}
                      disabled={consentToggleLoading}
                      className="gap-2"
                    >
                      {selectedPatient.consentEnabled ? "Disable family view" : "Enable family view"}
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex gap-2 items-center">
                      <Badge className={selectedPatient.consentEnabled ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}>
                        {selectedPatient.consentEnabled ? "Family access allowed" : "Family access blocked"}
                      </Badge>
                      <Badge className="bg-slate-100 text-slate-700">QR ready</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a task..."
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                      />
                      <Button onClick={onAddTask}>Add</Button>
                    </div>
                    <div className="space-y-2">
                      {tasks.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => onToggleTask(t.id)}
                          className="w-full flex items-center justify-between p-2 rounded border border-slate-200 bg-white hover:border-sky-200"
                        >
                          <span className={t.status === "done" ? "line-through text-slate-400" : "text-slate-800"}>
                            {t.title}
                          </span>
                          <Badge className={t.status === "done" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"}>
                            {t.status}
                          </Badge>
                        </button>
                      ))}
                      {tasks.length === 0 && <p className="text-sm text-slate-500">No tasks yet.</p>}
                    </div>
                  </CardContent>
                </Card>
              )}

              {selectedPatient && (
                <Card>
                  <CardHeader>
                    <CardTitle>Notes for {selectedPatient.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        placeholder="Add a note..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                      />
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-slate-600 flex items-center gap-1">
                          <input
                            type="radio"
                            name="aud"
                            checked={newAudience === "family"}
                            onChange={() => setNewAudience("family")}
                          />
                          Family
                        </label>
                        <label className="text-xs text-slate-600 flex items-center gap-1">
                          <input
                            type="radio"
                            name="aud"
                            checked={newAudience === "staff"}
                            onChange={() => setNewAudience("staff")}
                          />
                          Staff
                        </label>
                        <Button onClick={onAddNote}>Post</Button>
                      </div>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                      {notes.map((n) => (
                        <div key={n.id} className="p-3 rounded-lg border border-slate-200 bg-white">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={n.audience === "family" ? "bg-sky-100 text-sky-800" : "bg-slate-100 text-slate-700"}>
                              {n.audience}
                            </Badge>
                            <span className="font-medium text-slate-900">{n.author}</span>
                          </div>
                          <p className="text-sm text-slate-700">{n.text}</p>
                          <p className="text-xs text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                        </div>
                      ))}
                      {notes.length === 0 && <p className="text-sm text-slate-500">No notes yet.</p>}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">API</span>
                    <Badge className="bg-emerald-100 text-emerald-800">Up</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Consent Gate</span>
                    <Badge className="bg-sky-100 text-sky-800">On</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Notes Audience</span>
                    <Badge className="bg-slate-100 text-slate-700">Family/Staff</Badge>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>QR / Sharing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-slate-600">Generate QR codes for patients to share with family.</p>
                  <Button variant="outline" className="gap-2" asChild>
                    <Link href="/scan-qr">
                      <QrCode className="w-4 h-4" />
                      Scan QR
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {qrPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                QR Code for {qrPatient.name}
              </h3>
              <button
                onClick={() => setQrPatient(null)}
                className="p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-white rounded-xl border-2 border-slate-100">
                <QRCodeSVG
                  id="qr-code-svg"
                  value={getQRUrl(qrPatient.id)}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <p className="text-sm text-slate-600 text-center">
                Scan this code to instantly view patient status
              </p>
              <p className="text-xs text-slate-400 text-center break-all">
                {getQRUrl(qrPatient.id)}
              </p>
              <div className="flex gap-2 w-full">
                <Button variant="outline" className="flex-1 gap-2" onClick={downloadQR}>
                  <Download className="w-4 h-4" />
                  Download
                </Button>
                <Button className="flex-1" onClick={() => setQrPatient(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
