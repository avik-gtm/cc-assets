import { NextResponse } from "next/server";
import { durableStorageEnabled } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    ok: true,
    storage: durableStorageEnabled() ? "blob" : "memory",
    agentConfigured: Boolean(process.env.ASSET_GENERATOR_URL),
  });
}
