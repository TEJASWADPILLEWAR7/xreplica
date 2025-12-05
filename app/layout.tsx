import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "X-Replica",
  description: "Generate Twitter replies in your personal voice.",
  icons: {
    icon: "/logo.png", // <-- your logo
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="antialiased min-h-screen bg-white text-slate-900">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
