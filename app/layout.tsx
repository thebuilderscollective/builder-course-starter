// Copyright (c) 2026 The Builder Course and Rajat. All rights reserved.

import type { Metadata } from "next";
import type { ReactNode } from "react";
import { setupCheckerBranding } from "@/lib/setup/branding";
import "./globals.css";

export const metadata: Metadata = {
  title: setupCheckerBranding.metadataTitle,
  description: setupCheckerBranding.metadataDescription,
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">Skip to setup results</a>
        {children}
      </body>
    </html>
  );
}
