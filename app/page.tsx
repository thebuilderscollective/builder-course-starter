// Copyright (c) 2026 The Builder Course and Rajat. All rights reserved.

import { SetupStatus } from "@/components/setup-status";
import { getSetupReport } from "@/lib/setup/checks";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function Home() {
  const report = await getSetupReport(process.env);
  return <SetupStatus report={report} />;
}
