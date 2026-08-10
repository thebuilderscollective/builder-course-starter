// Copyright (c) 2026 The Builder Course and Rajat. All rights reserved.

import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cohort 2 setup checker | The Builder Course",
  description: "A private, setup-only readiness check for Builder Course Cohort 2.",
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
