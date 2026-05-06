"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  Heart,
} from "lucide-react";

const contactInfo = [
  {
    icon: Mail,
    title: "Email Us",
    details: ["support@carelink-qr.example.com", "sales@carelink-qr.example.com"],
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Phone,
    title: "Call Us",
    details: ["1-800-CARELINK", "+1 (555) 123-4567"],
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: MapPin,
    title: "Visit Us",
    details: ["123 Healthcare Blvd", "San Francisco, CA 94102"],
    color: "from-violet-500 to-purple-500",
  },
  {
    icon: Clock,
    title: "Business Hours",
    details: ["Mon-Fri: 9AM - 6PM PST", "24/7 Emergency Support"],
    color: "from-amber-500 to-orange-500",
  },
];

const inquiryTypes = [
  { value: "sales", label: "Sales Inquiry" },
  { value: "support", label: "Technical Support" },
  { value: "demo", label: "Request Demo" },
  { value: "partnership", label: "Partnership" },
  { value: "other", label: "Other" },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    organization: "",
    inquiry: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSubmitted(true);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        organization: "",
        inquiry: "",
        message: "",
      });
    }, 1500);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Message Sent!
            </h2>
            <p className="text-slate-600 mb-6">
              Thank you for reaching out. We&apos;ll get back to you within 24 hours.
            </p>
            <Button onClick={() => setSubmitted(false)} variant="outline">
              Send Another Message
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">
            Get in <span className="text-sky-600">Touch</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Have questions about CareLink QR? We&apos;re here to help. Reach out to our team and we&apos;ll respond as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12 -mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((item, index) => {
              const Icon = item.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div
                      className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-4`}
                    >
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2">
                      {item.title}
                    </h3>
                    {item.details.map((detail, i) => (
                      <p key={i} className="text-sm text-slate-600">
                        {detail}
                      </p>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Send us a Message
                  </h2>
                  <p className="text-slate-600">
                    Fill out the form below and we&apos;ll get back to you shortly.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData((p) => ({ ...p, firstName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData((p) => ({ ...p, lastName: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@hospital.com"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organization">Organization</Label>
                  <Input
                    id="organization"
                    placeholder="St. Mary's Hospital"
                    value={formData.organization}
                    onChange={(e) => setFormData((p) => ({ ...p, organization: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inquiry">Inquiry Type</Label>
                  <Select
                    value={formData.inquiry}
                    onValueChange={(v) => setFormData((p) => ({ ...p, inquiry: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select inquiry type" />
                    </SelectTrigger>
                    <SelectContent>
                      {inquiryTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <textarea
                    id="message"
                    rows={5}
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Tell us about your needs..."
                    required
                    value={formData.message}
                    onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                q: "How quickly can we get started?",
                a: "Most hospitals are up and running within 2-3 weeks, including integration and staff training.",
              },
              {
                q: "Is CareLink QR HIPAA compliant?",
                a: "Yes, we are fully HIPAA compliant with enterprise-grade security and encryption.",
              },
              {
                q: "Do families need to download an app?",
                a: "No, families can scan QR codes directly with their phone camera for instant web access.",
              },
              {
                q: "What systems do you integrate with?",
                a: "We integrate with Epic, Cerner, Meditech, and any HL7 FHIR-compliant system.",
              },
            ].map((faq, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-slate-900 mb-2">{faq.q}</h3>
                  <p className="text-slate-600">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
