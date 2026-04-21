import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Fraunces, DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["300", "400", "500"],
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["300", "500", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: { default: "CareCompass", template: "%s | CareCompass" },
  description: "Bangladesh's comprehensive pet care platform — vets, grooming, daycare, adoption, rescue & community events.",
  keywords: ["pet care", "veterinary", "pet adoption", "pet grooming", "pet daycare", "Bangladesh"],
  openGraph: {
    title: "CareCompass",
    description: "Your complete pet care companion",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${dmSans.variable} ${fraunces.variable} font-sans antialiased bg-cream-100`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
