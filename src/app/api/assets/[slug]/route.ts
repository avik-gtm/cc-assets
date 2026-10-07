import { NextRequest, NextResponse } from "next/server";
import { getAsset } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const asset = await getAsset(slug);
  if (!asset) {
    return NextResponse.json({ success: false, error: "Asset not found." }, { status: 404 });
  }
  return NextResponse.json({ success: true, asset });
}
