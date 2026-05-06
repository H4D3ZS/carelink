import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CareLink QR - Patient Transparency System",
  description: "Real-time patient transparency system for families and healthcare providers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}