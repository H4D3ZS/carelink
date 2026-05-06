import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import {
  QrCode,
  Clock,
  Shield,
  Bell,
  Users,
  Smartphone,
  Activity,
  Lock,
  Zap,
  Heart,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

const mainFeatures = [
  {
    icon: QrCode,
    title: "Instant QR Access",
    description:
      "Generate unique QR codes for each patient that family members can scan to instantly access real-time status updates without needing to download an app or create an account.",
    color: "from-blue-500 to-cyan-500",
    benefits: [
      "No app download required",
      "Instant access with single scan",
      "Secure tokenized links",
      "Customizable access duration",
    ],
  },
  {
    icon: Clock,
    title: "Real-Time Updates",
    description:
      "Automatic synchronization of patient status, vitals, location, and care milestones directly from hospital systems to family devices.",
    color: "from-emerald-500 to-teal-500",
    benefits: [
      "Live status changes",
      "Vital signs monitoring",
      "Location tracking",
      "Care milestone updates",
    ],
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description:
      "Bank-grade security with end-to-end encryption, HIPAA compliance, and comprehensive audit trails to protect patient data.",
    color: "from-violet-500 to-purple-500",
    benefits: [
      "HIPAA compliant",
      "End-to-end encryption",
      "Role-based access control",
      "Audit logging",
    ],
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description:
      "Intelligent alerting system that keeps families informed about critical updates while reducing notification fatigue.",
    color: "from-amber-500 to-orange-500",
    benefits: [
      "Customizable alerts",
      "Priority-based routing",
      "Multi-channel delivery",
      "Quiet hours support",
    ],
  },
  {
    icon: Users,
    title: "Family Groups",
    description:
      "Enable multiple family members to access the same patient information with granular permission controls.",
    color: "from-rose-500 to-pink-500",
    benefits: [
      "Multi-user access",
      "Permission levels",
      "Family member management",
      "Access history",
    ],
  },
  {
    icon: Smartphone,
    title: "Cross-Platform",
    description:
      "Native mobile apps for iOS and Android plus responsive web access ensure families can stay connected from any device.",
    color: "from-indigo-500 to-blue-500",
    benefits: [
      "iOS & Android apps",
      "Responsive web portal",
      "Offline mode support",
      "Push notifications",
    ],
  },
];

const additionalFeatures = [
  {
    icon: Activity,
    title: "Vitals Dashboard",
    description: "Real-time monitoring of heart rate, blood pressure, temperature, and oxygen levels.",
  },
  {
    icon: Lock,
    title: "Access Control",
    description: "Granular permissions with time-based access, geofencing, and device management.",
  },
  {
    icon: Zap,
    title: "Fast Integration",
    description: "Quick setup with existing hospital systems through HL7 FHIR and API connectivity.",
  },
  {
    icon: Heart,
    title: "Care Coordination",
    description: "Share updates across care teams including specialists, nurses, and primary physicians.",
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
            Powerful Features for{" "}
            <span className="bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent">
              Modern Healthcare
            </span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-10">
            Everything you need to keep families informed, reduce staff workload, and improve patient satisfaction.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="gap-2">
                Get Started Free
                <ChevronRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline">
                Schedule a Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Features Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {mainFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex gap-6">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center flex-shrink-0 shadow-lg`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 mb-4 leading-relaxed">
                      {feature.description}
                    </p>
                    <ul className="space-y-2">
                      {feature.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              And Much More
            </h2>
            <p className="text-lg text-slate-600">
              Additional features that make CareLink QR the complete patient transparency solution.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-sky-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-600">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">
                Security You Can Trust
              </h2>
              <p className="text-lg text-slate-600 mb-8">
                We take data security seriously. CareLink QR is built with enterprise-grade security measures to protect sensitive patient information.
              </p>
              <div className="space-y-4">
                {[
                  "HIPAA Compliance Certified",
                  "SOC 2 Type II Certified",
                  "End-to-end Encryption",
                  "Regular Security Audits",
                  "99.99% Uptime SLA",
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span className="text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-sky-500/20 to-blue-600/20 rounded-3xl blur-3xl" />
              <div className="relative bg-white rounded-2xl shadow-xl p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center">
                    <Shield className="w-8 h-8 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Security Status</p>
                    <p className="text-emerald-600">All Systems Secure</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    { label: "Encryption", status: "Active" },
                    { label: "Audit Logging", status: "Enabled" },
                    { label: "Access Control", status: "Active" },
                    { label: "Threat Detection", status: "Monitoring" },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                    >
                      <span className="text-slate-700">{item.label}</span>
                      <Badge className="bg-emerald-100 text-emerald-800">
                        {item.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-sky-600 to-blue-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Experience These Features?
          </h2>
          <p className="text-xl text-sky-100 mb-10">
            Join hundreds of healthcare facilities already using CareLink QR to transform patient communication.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-white text-sky-600 hover:bg-sky-50 text-lg px-8">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8">
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
