"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import {
  Heart,
  Users,
  Bell,
  Settings,
  LogOut,
  QrCode,
  Clock,
  Activity,
  ChevronRight,
  Plus,
  Search,
  Filter,
  MapPin,
  Phone,
} from "lucide-react";

// Mock data for family portal
const familyMembers = [
  {
    id: "1",
    name: "John Mitchell",
    relation: "Father",
    age: 68,
    status: "stable",
    location: "Room 302, Cardiac Unit",
    admissionDate: "2024-01-15",
    lastUpdated: "2 minutes ago",
    avatar: "JM",
    vitals: {
      heartRate: 72,
      bloodPressure: "120/80",
      temperature: 98.6,
      oxygenLevel: 98,
    },
  },
  {
    id: "2",
    name: "Sarah Mitchell",
    relation: "Mother",
    age: 65,
    status: "recovering",
    location: "Room 205, Recovery Ward",
    admissionDate: "2024-01-18",
    lastUpdated: "5 minutes ago",
    avatar: "SM",
    vitals: {
      heartRate: 78,
      bloodPressure: "125/82",
      temperature: 99.1,
      oxygenLevel: 96,
    },
  },
];

const recentUpdates = [
  {
    id: "1",
    patientId: "1",
    type: "vitals",
    message: "Vitals updated - Blood pressure stable",
    time: "2 minutes ago",
    icon: Activity,
    color: "text-emerald-500",
    bgColor: "bg-emerald-50",
  },
  {
    id: "2",
    patientId: "2",
    type: "medication",
    message: "Pain medication administered",
    time: "15 minutes ago",
    icon: Heart,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
  },
  {
    id: "3",
    patientId: "1",
    type: "location",
    message: "Moved to Room 302 from ICU",
    time: "2 hours ago",
    icon: MapPin,
    color: "text-amber-500",
    bgColor: "bg-amber-50",
  },
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

export default function FamilyPortalPage() {
  const [selectedPatient, setSelectedPatient] = useState(familyMembers[0]);
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
                    JD
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-slate-700 hidden md:block">
                  Jane Doe
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-500">
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Plus className="w-4 h-4" />
                  Add Patient
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <QrCode className="w-4 h-4" />
                  Scan QR Code
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Phone className="w-4 h-4" />
                  Contact Hospital
                </Button>
              </CardContent>
            </Card>

            {/* My Patients */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-500">
                    My Patients
                  </CardTitle>
                  <Badge variant="secondary">{familyMembers.length}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {familyMembers.map((patient) => (
                  <button
                    key={patient.id}
                    onClick={() => setSelectedPatient(patient)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                      selectedPatient.id === patient.id
                        ? "bg-sky-50 border border-sky-200"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-gradient-to-br from-sky-500 to-blue-600 text-white">
                        {patient.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">
                        {patient.name}
                      </p>
                      <p className="text-xs text-slate-500">{patient.relation}</p>
                    </div>
                    <div
                      className={`w-2 h-2 rounded-full ${
                        patient.status === "stable"
                          ? "bg-emerald-500"
                          : patient.status === "critical"
                          ? "bg-red-500"
                          : "bg-amber-500"
                      }`}
                    />
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Patient Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="bg-gradient-to-br from-sky-500 to-blue-600 text-white text-xl">
                    {selectedPatient.avatar}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {selectedPatient.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getStatusColor(selectedPatient.status)}>
                      {getStatusLabel(selectedPatient.status)}
                    </Badge>
                    <span className="text-sm text-slate-500">
                      {selectedPatient.age} years old • {selectedPatient.relation}
                    </span>
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
            </div>

            {/* Location & Admission Info */}
            <Card>
              <CardContent className="p-6">
                <div className="grid sm:grid-cols-3 gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Location</p>
                      <p className="font-medium text-slate-900">
                        {selectedPatient.location}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Admitted</p>
                      <p className="font-medium text-slate-900">
                        {selectedPatient.admissionDate}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <Activity className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Last Updated</p>
                      <p className="font-medium text-slate-900">
                        {selectedPatient.lastUpdated}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vitals Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center">
                      <Heart className="w-5 h-5 text-rose-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Heart Rate</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {selectedPatient.vitals.heartRate}
                        <span className="text-sm font-normal text-slate-500 ml-1">
                          bpm
                        </span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Activity className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Blood Pressure</p>
                      <p className="text-xl font-bold text-slate-900">
                        {selectedPatient.vitals.bloodPressure}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Temperature</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {selectedPatient.vitals.temperature}°
                        <span className="text-sm font-normal text-slate-500">
                          F
                        </span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <Activity className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Oxygen Level</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {selectedPatient.vitals.oxygenLevel}
                        <span className="text-sm font-normal text-slate-500">
                          %
                        </span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Updates */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Updates</CardTitle>
                  <Button variant="ghost" size="sm" className="gap-1">
                    View All
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentUpdates
                    .filter((update) => update.patientId === selectedPatient.id)
                    .map((update) => {
                      const Icon = update.icon;
                      return (
                        <div
                          key={update.id}
                          className="flex items-start gap-4 p-4 rounded-lg bg-slate-50"
                        >
                          <div
                            className={`w-10 h-10 rounded-lg ${update.bgColor} flex items-center justify-center flex-shrink-0`}
                          >
                            <Icon className={`w-5 h-5 ${update.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-900">
                              {update.message}
                            </p>
                            <p className="text-sm text-slate-500 mt-0.5">
                              {update.time}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
