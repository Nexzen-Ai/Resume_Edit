import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "NexCV — End-to-End Skill Verification & Candidate Readiness Engine",
  description: "Beat Applicant Tracking Systems and bridge experience gaps. NexCV offers Fact-Graph resume tailoring, adaptive diagnostic testing, STAR interview prep, and cryptographic verified skill proofs.",
  keywords: [
    "Resume Tailor",
    "ATS Resume Checker",
    "Skill Verification Badge",
    "Interview Preparation STAR Method",
    "Candidate Readiness Engine",
    "Low YOE Resume Rewriter",
    "Workday Lever Greenhouse ATS Simulator"
  ],
  authors: [{ name: "NexCV Team" }],
  creator: "NexCV",
  metadataBase: new URL("https://nexcv.me"),
  alternates: {
    canonical: "https://nexcv.me",
  },
  openGraph: {
    title: "NexCV — End-to-End Skill Verification & Candidate Readiness Engine",
    description: "Turn low YOE into verified proof. Adaptive diagnostic tests, ATS dual-scan simulator, and cryptographic recruiter proof badges.",
    url: "https://nexcv.me",
    siteName: "NexCV",
    images: [
      {
        url: "/images/hero_dashboard.png",
        width: 1200,
        height: 630,
        alt: "NexCV Dashboard Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NexCV — Skill Verification & Resume Optimization",
    description: "Bridge your experience gap with adaptive diagnostic assessments and cryptographic skill badges.",
    images: ["/images/hero_dashboard.png"],
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "NexCV",
    "operatingSystem": "Web",
    "applicationCategory": "BusinessApplication",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "1250"
    },
    "offers": {
      "@type": "Offer",
      "price": "0.00",
      "priceCurrency": "USD"
    },
    "description": "End-to-End Skill Verification & Candidate Readiness Engine. Adaptive diagnostic tests, ATS dual-scan simulator, and cryptographic recruiter proof badges."
  };

  return (
    <html lang="en" className="h-full scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.className} min-h-full bg-[#030712] text-slate-100 antialiased`}>
        {children}
      </body>
    </html>
  );
}
