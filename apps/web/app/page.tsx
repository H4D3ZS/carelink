import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  Heart,
  QrCode,
  Shield,
  Clock,
  Users,
  Bell,
  Smartphone,
  Activity,
  ChevronRight,
  Star,
  CheckCircle2,
} from "lucide-react";

const features = [
  {
    icon: QrCode,
    title: "Instant QR Access",
    description: "Scan a QR code to instantly view patient status, no login required for family members.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Clock,
    title: "Real-Time Updates",
    description: "Receive live notifications when patient status changes, keeping families informed 24/7.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: Shield,
    title: "HIPAA Compliant",
    description: "Enterprise-grade security with end-to-end encryption and strict access controls.",
    color: "from-violet-500 to-purple-500",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Customizable alerts for critical updates, discharge readiness, and care milestones.",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: Users,
    title: "Multi-User Support",
    description: "Family groups can access the same patient information with role-based permissions.",
    color: "from-rose-500 to-pink-500",
  },
  {
    icon: Smartphone,
    title: "Mobile First",
    description: "Native mobile apps for iOS and Android with offline support and push notifications.",
    color: "from-indigo-500 to-blue-500",
  },
];

const howItWorks = [
  {
    step: "01",
    title: "Hospital Creates Profile",
    description: "Healthcare staff create a patient profile and generate a unique QR code for family access.",
  },
  {
    step: "02",
    title: "Family Scans QR Code",
    description: "Family members scan the QR code with their phone camera - no app download required.",
  },
  {
    step: "03",
    title: "Stay Informed",
    description: "Receive real-time updates on patient status, location, and care milestones.",
  },
];

const testimonials = [
  {
    name: "Sarah Mitchell",
    role: "Family Member",
    content: "CareLink QR gave me peace of mind during my mother's surgery. I could check her status anytime without bothering the nurses.",
    rating: 5,
  },
  {
    name: "Dr. James Chen",
    role: "Emergency Physician",
    content: "This system has reduced our phone call volume by 60%. Families feel more connected and informed throughout the care process.",
    rating: 5,
  },
  {
    name: "Maria Rodriguez",
    role: "ICU Nurse",
    content: "The automated updates mean I can focus on patient care instead of constantly updating family members. It's a game-changer.",
    rating: 5,
  },
];

const stats = [
  { value: "50+", label: "Hospitals" },
  { value: "10K+", label: "Daily Active Users" },
  { value: "1M+", label: "Status Updates" },
  { value: "99.9%", label: "Uptime" },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/20" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-sky-100/50 to-transparent" />
        
        {/* Animated shapes */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-sky-200/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-200/30 rounded-full blur-3xl animate-pulse delay-1000" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-100 text-sky-700 text-sm font-medium mb-6">
                <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                Now Open Source on GitHub
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
                Connect Families with{" "}
                <span className="bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent">
                  Real-Time
                </span>{" "}
                Patient Updates
              </h1>
              
              <p className="text-lg sm:text-xl text-slate-600 mb-8 max-w-2xl mx-auto lg:mx-0">
                CareLink QR provides instant, secure access to patient status through QR codes. 
                Keep families informed and reduce anxiety during critical care moments.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/register">
                  <Button size="lg" className="gap-2 text-lg px-8">
                    Get Started Free
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/demo">
                  <Button size="lg" variant="outline" className="gap-2 text-lg px-8">
                    <QrCode className="w-5 h-5" />
                    Try Demo
                  </Button>
                </Link>
              </div>

              {/* Trust badges */}
              <div className="mt-12 pt-8 border-t border-slate-200">
                <p className="text-sm text-slate-500 mb-4">Trusted by leading healthcare institutions</p>
                <div className="flex flex-wrap justify-center lg:justify-start gap-8 opacity-50">
                  <div className="h-8 w-24 bg-slate-300 rounded" />
                  <div className="h-8 w-20 bg-slate-300 rounded" />
                  <div className="h-8 w-28 bg-slate-300 rounded" />
                  <div className="h-8 w-24 bg-slate-300 rounded" />
                </div>
              </div>
            </div>

            {/* Right Content - Phone Mockup */}
            <div className="relative lg:pl-8">
              <div className="relative mx-auto w-[280px] sm:w-[320px]">
                {/* Phone Frame */}
                <div className="relative bg-slate-900 rounded-[3rem] p-3 shadow-2xl">
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-800 rounded-full" />
                  <div className="bg-white rounded-[2.5rem] overflow-hidden">
                    {/* Mock App Screen */}
                    <div className="p-6 pt-12">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <p className="text-xs text-slate-500">Patient</p>
                          <p className="font-semibold text-slate-900">John M.</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center">
                          <Heart className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      
                      {/* Status Card */}
                      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-sm font-medium text-emerald-800">Stable</span>
                        </div>
                        <p className="text-xs text-emerald-600">Recovery progressing well</p>
                      </div>

                      {/* QR Code Placeholder */}
                      <div className="bg-slate-100 rounded-2xl p-6 text-center mb-4">
                        <QrCode className="w-16 h-16 mx-auto text-slate-400 mb-2" />
                        <p className="text-xs text-slate-500">Scan to share access</p>
                      </div>

                      {/* Activity */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Activity className="w-4 h-4 text-sky-500" />
                          <div className="flex-1">
                            <p className="text-xs font-medium text-slate-900">Vitals Updated</p>
                            <p className="text-xs text-slate-500">2 minutes ago</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <div className="flex-1">
                            <p className="text-xs font-medium text-slate-900">Medication Administered</p>
                            <p className="text-xs text-slate-500">15 minutes ago</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating notification */}
                <div className="absolute -right-4 top-20 bg-white rounded-xl shadow-lg p-3 animate-float">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center">
                      <Bell className="w-4 h-4 text-sky-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-900">Status Update</p>
                      <p className="text-xs text-slate-500">Patient stable</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl sm:text-4xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-slate-400 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Everything You Need for{" "}
              <span className="text-sky-600">Patient Transparency</span>
            </h2>
            <p className="text-lg text-slate-600">
              Our comprehensive platform provides all the tools healthcare providers need to keep families informed and engaged.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group relative p-8 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-xl transition-all duration-300 border border-slate-100"
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              How <span className="text-sky-600">CareLink QR</span> Works
            </h2>
            <p className="text-lg text-slate-600">
              Simple, secure, and seamless patient information sharing in three easy steps.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((step, index) => (
              <div key={index} className="relative">
                {index < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-sky-200 to-transparent" />
                )}
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center mb-6 shadow-lg shadow-sky-500/30">
                    <span className="text-3xl font-bold text-white">{step.step}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">{step.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 lg:py-32 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Loved by Healthcare Teams & Families
            </h2>
            <p className="text-lg text-slate-400">
              See what our users say about CareLink QR
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="p-8 rounded-2xl bg-slate-800 border border-slate-700"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-300 mb-6 leading-relaxed">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{testimonial.name}</p>
                    <p className="text-sm text-slate-400">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-sky-600 to-blue-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Transform Patient Communication?
          </h2>
          <p className="text-xl text-sky-100 mb-10 max-w-2xl mx-auto">
            Join hundreds of healthcare facilities already using CareLink QR to keep families informed and reduce staff workload.
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
          <p className="mt-6 text-sm text-sky-200">
            No credit card required. Free 14-day trial. HIPAA compliant.
          </p>
        </div>
      </section>
    </div>
  );
}
