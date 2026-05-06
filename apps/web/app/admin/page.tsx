"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { Input } from "@/components/ui/Input";
import { Heart, Bell, QrCode, Search, Settings } from "lucide-react";
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
                      <button
                        key={p.id}
                        onClick={() => onSelectPatient(p.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg border ${
                          selectedId === p.id ? "border-sky-300 bg-sky-50" : "border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-sky-100 text-sky-700 text-xs">
                              {p.name.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-left">
                            <p className="font-medium text-slate-900">{p.name}</p>
                            <p className="text-xs text-slate-500">{p.location}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(p.status)}>{p.status}</Badge>
                      </button>
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
                  <p className="text-sm text-slate-600">Use QR flow in /scan-qr for family view.</p>
                  <Button variant="outline" className="gap-2" asChild>
                    <Link href="/scan-qr">
                      <QrCode className="w-4 h-4" />
                      QR Demo
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { Input } from "@/components/ui/Input";
import {
  Heart,
  Bell,
  QrCode,
  Search,
  Plus,
  Activity,
  Settings,
} from "lucide-react";
import { patientApi, Patient, Task, Note, getToken } from "@/lib/api";

const recentPatients = [
  {
    id: "P-1024",
    name: "John Mitchell",
    age: 68,
    status: "stable",
    department: "Cardiology",
    room: "302",
    admissionDate: "2024-01-15",
    lastUpdated: "2 min ago",
  },
  {
    id: "P-1025",
    name: "Sarah Chen",
    age: 45,
    status: "surgery",
    department: "Orthopedics",
    room: "405",
    admissionDate: "2024-01-18",
    lastUpdated: "5 min ago",
  },
  {
    id: "P-1026",
    name: "Robert Wilson",
    age: 72,
    status: "critical",
    department: "ICU",
    room: "ICU-12",
    admissionDate: "2024-01-16",
    lastUpdated: "1 min ago",
  },
  {
    id: "P-1027",
    name: "Maria Rodriguez",
    age: 34,
    status: "recovering",
    department: "Maternity",
    room: "208",
    admissionDate: "2024-01-19",
    lastUpdated: "15 min ago",
  },
  {
    id: "P-1028",
    name: "David Kim",
    age: 56,
    status: "discharge",
    department: "General Medicine",
    room: "115",
    admissionDate: "2024-01-14",
    lastUpdated: "30 min ago",
  },
];

const departmentStats = [
  { name: "Emergency", patients: 45, capacity: 60, status: "normal" },
  { name: "ICU", patients: 18, capacity: 20, status: "high" },
  { name: "Cardiology", patients: 32, capacity: 40, status: "normal" },
  { name: "Orthopedics", patients: 28, capacity: 35, status: "normal" },
  { name: "Maternity", patients: 15, capacity: 25, status: "low" },
];

const getStatusColor = (status: string) => {
  switch (status) {
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

const getStatusLabel = (status: string) => {
  switch (status) {
    case "stable":
      return "Stable";
    case "critical":
      return "Critical";
    case "recovering":
      return "Recovering";
    case "surgery":
      return "In Surgery";
    case "discharge":
      return "Ready for Discharge";
    default:
      return status;
  }
};

const getCapacityColor = (patients: number, capacity: number) => {
  const percentage = (patients / capacity) * 100;
  if (percentage >= 90) return "bg-red-500";
  if (percentage >= 70) return "bg-amber-500";
  return "bg-emerald-500";
};

export default function AdminDashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation Bar */}
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
        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown;
            const trendColor = stat.trend === "up" ? "text-emerald-600" : "text-red-600";

            return (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500 mb-1">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold text-slate-900">
                        {stat.value}
                      </p>
                      <div className={`flex items-center gap-1 mt-2 ${trendColor}`}>
                        <TrendIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">{stat.change}</span>
                        <span className="text-sm text-slate-500">vs last week</span>
                      </div>
                    </div>
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Recent Patients */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search and Actions */}
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
                  <Filter className="w-4 h-4" />
                  Filter
                </Button>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Patient
                </Button>
              </div>
            </div>

            {/* Patients Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Patients</CardTitle>
                  <Button variant="ghost" size="sm" className="gap-1">
                    View All
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">
                          Patient
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">
                          Department
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">
                          Room
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">
                          Last Updated
                        </th>
                        <th className="py-3 px-4"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentPatients.map((patient) => (
                        <tr
                          key={patient.id}
                          className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="bg-sky-100 text-sky-700 text-xs">
                                  {patient.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-slate-900">
                                  {patient.name}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {patient.id} • {patient.age} years
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={getStatusColor(patient.status)}>
                              {getStatusLabel(patient.status)}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-slate-700">
                              {patient.department}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-slate-700">
                              {patient.room}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-slate-500">
                              {patient.lastUpdated}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <button className="p-1 rounded hover:bg-slate-200 transition-colors">
                              <MoreHorizontal className="w-4 h-4 text-slate-400" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      action: "Patient admitted",
                      patient: "Sarah Chen",
                      time: "5 minutes ago",
                      icon: Users,
                      color: "text-blue-600",
                      bgColor: "bg-blue-50",
                    },
                    {
                      action: "Vitals updated",
                      patient: "John Mitchell",
                      time: "12 minutes ago",
                      icon: Activity,
                      color: "text-emerald-600",
                      bgColor: "bg-emerald-50",
                    },
                    {
                      action: "QR code scanned",
                      patient: "Robert Wilson",
                      time: "25 minutes ago",
                      icon: QrCode,
                      color: "text-violet-600",
                      bgColor: "bg-violet-50",
                    },
                    {
                      action: "Discharge initiated",
                      patient: "David Kim",
                      time: "1 hour ago",
                      icon: Calendar,
                      color: "text-purple-600",
                      bgColor: "bg-purple-50",
                    },
                  ].map((activity, index) => {
                    const Icon = activity.icon;
                    return (
                      <div key={index} className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-lg ${activity.bgColor} flex items-center justify-center`}
                        >
                          <Icon className={`w-5 h-5 ${activity.color}`} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">
                            {activity.action}
                          </p>
                          <p className="text-sm text-slate-500">
                            {activity.patient}
                          </p>
                        </div>
                        <span className="text-sm text-slate-400">
                          {activity.time}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Department Capacity */}
            <Card>
              <CardHeader>
                <CardTitle>Department Capacity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {departmentStats.map((dept) => (
                  <div key={dept.name}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">
                        {dept.name}
                      </span>
                      <span className="text-sm text-slate-500">
                        {dept.patients}/{dept.capacity}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getCapacityColor(
                          dept.patients,
                          dept.capacity
                        )} rounded-full transition-all`}
                        style={{
                          width: `${(dept.patients / dept.capacity) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Plus className="w-4 h-4" />
                  Add New Patient
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <QrCode className="w-4 h-4" />
                  Generate QR Codes
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Users className="w-4 h-4" />
                  Manage Staff
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Settings className="w-4 h-4" />
                  System Settings
                </Button>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">API Status</span>
                  <Badge className="bg-emerald-100 text-emerald-800">Operational</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Database</span>
                  <Badge className="bg-emerald-100 text-emerald-800">Connected</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">QR Service</span>
                  <Badge className="bg-emerald-100 text-emerald-800">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Notifications</span>
                  <Badge className="bg-emerald-100 text-emerald-800">Enabled</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
