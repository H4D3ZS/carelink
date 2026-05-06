"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { Heart, Bell, QrCode, ChevronRight, Phone } from "lucide-react";
import { patientApi, Patient, Task, Note, getToken } from "@/lib/api";

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

export default function FamilyPortalPage() {
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await patientApi.list();
      const p = list[0];
      if (!p) throw new Error("No patients available for this user.");
      setPatient(p);
      const [ts, ns] = await Promise.all([
        patientApi.listTasks(p.id),
        patientApi.listNotes(p.id),
      ]);
      setTasks(ts);
      setNotes(ns);
    } catch (e: any) {
      setError(e?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!getToken()) {
      setError("Please login first.");
      setLoading(false);
      router.replace("/login?next=/family-portal");
      return;
    }
    load();
  }, [router]);

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
              <h1 className="font-semibold text-slate-900">Family Portal</h1>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
              </button>
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-sky-100 text-sky-700 text-sm">
                    U
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-slate-700 hidden md:block">
                  You
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && <p className="text-sm text-slate-600">Loading...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {!loading && !error && patient && (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarFallback className="bg-gradient-to-br from-sky-500 to-blue-600 text-white text-xl">
                      {patient.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">{patient.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getStatusColor(patient.status)}>{patient.status}</Badge>
                      <span className="text-sm text-slate-500">{patient.location}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="gap-2">
                    <QrCode className="w-4 h-4" />
                    View QR
                  </Button>
                  <Button className="gap-2">
                    <Phone className="w-4 h-4" />
                    Contact Nurse
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-slate-500">Consent</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className={patient.consentEnabled ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}>
                    {patient.consentEnabled ? "Family access allowed" : "Family access blocked"}
                  </Badge>
                  <p className="text-xs text-slate-500 mt-2">
                    Consent managed by staff. Family can view only if allowed.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-slate-500">Encounters</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-700">See latest status and location above.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-slate-500">Tasks (read-only)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {tasks.map((t) => (
                    <div key={t.id} className="flex items-center justify-between p-2 rounded border border-slate-200 bg-white">
                      <span className={t.status === "done" ? "line-through text-slate-400" : "text-slate-800"}>{t.title}</span>
                      <Badge className={t.status === "done" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"}>
                        {t.status}
                      </Badge>
                    </div>
                  ))}
                  {tasks.length === 0 && <p className="text-sm text-slate-500">No tasks yet.</p>}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Family Updates</CardTitle>
                  <Button variant="ghost" size="sm" className="gap-1">
                    View All
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {notes.length === 0 && <p className="text-sm text-slate-500">No updates yet.</p>}
                {notes.map((n) => (
                  <div key={n.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center text-sky-700 font-semibold">
                      {n.author.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900">{n.author}</span>
                        <Badge className="bg-slate-100 text-slate-700">{n.audience === "family" ? "Family-visible" : "Staff"}</Badge>
                      </div>
                      <p className="text-sm text-slate-700 mt-1">{n.text}</p>
                      <p className="text-xs text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
